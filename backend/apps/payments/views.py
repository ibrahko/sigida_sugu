import hashlib
import hmac
import json
import logging

from django.conf import settings
from django.http import JsonResponse
from django.views import View
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import PaymentTransaction, PaymentWebhookEvent
from .permissions import IsPaymentOwnerOrAdmin
from .serializers import (
    InitializePaymentSerializer,
    PaymentTransactionSerializer,
    PaymentWebhookEventSerializer,
)
from .services import PaymentService

logger = logging.getLogger(__name__)


class PaymentTransactionListAPIView(generics.ListAPIView):
    serializer_class = PaymentTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            PaymentTransaction.objects.filter(order__user=self.request.user)
            .select_related("order", "order__user", "order__delivery_address", "order__delivery_zone")
            .order_by("-created_at")
        )


class PaymentTransactionDetailAPIView(generics.RetrieveAPIView):
    serializer_class = PaymentTransactionSerializer
    permission_classes = [permissions.IsAuthenticated, IsPaymentOwnerOrAdmin]

    def get_queryset(self):
        return PaymentTransaction.objects.select_related(
            "order", "order__user", "order__delivery_address", "order__delivery_zone"
        ).all()

    def get_object(self):
        obj = super().get_object()
        self.check_object_permissions(self.request, obj)
        return obj


class InitializeInTouchPaymentAPIView(APIView):
    """
    POST /api/v1/payments/intouch/initialize/
    Body: { order_id, phone?, operator? }
    Déclenche un push de paiement Mobile Money via InTouch.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = InitializePaymentSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        result = serializer.save()
        tx = result["transaction"]

        return Response(
            {
                "transaction": PaymentTransactionSerializer(tx, context={"request": request}).data,
                "status": tx.status,
                "message": (
                    "Demande de paiement envoyée. Validez depuis votre téléphone."
                    if tx.status == PaymentTransaction.Status.PENDING
                    else "Paiement initialisé (mode test)."
                ),
            },
            status=status.HTTP_201_CREATED,
        )


class PaymentStatusAPIView(APIView):
    """
    GET /api/v1/payments/<int:pk>/status/
    Retourne le statut actuel d'une transaction.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            tx = PaymentTransaction.objects.get(pk=pk, order__user=request.user)
        except PaymentTransaction.DoesNotExist:
            return Response({"detail": "Transaction introuvable."}, status=404)

        return Response({
            "id": tx.id,
            "status": tx.status,
            "internal_reference": tx.internal_reference,
            "provider_reference": tx.provider_reference,
            "amount": str(tx.amount),
            "currency": tx.currency,
        })


class SandboxSimulatePaymentView(APIView):
    """
    POST /api/v1/payments/sandbox/simulate/
    Simule la confirmation ou le refus d'un paiement InTouch en dev.
    Disponible uniquement si INTTOUCH_SANDBOX=true.
    Body: { transaction_id: str, outcome: "success" | "failed" }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        from django.conf import settings
        if not settings.INTTOUCH.get("SANDBOX", False):
            return Response({"detail": "Mode sandbox inactif."}, status=403)

        tx_ref = request.data.get("transaction_id")
        outcome = request.data.get("outcome", "success")

        if outcome not in ("success", "failed"):
            return Response({"detail": "outcome doit être 'success' ou 'failed'."}, status=400)

        try:
            tx = PaymentTransaction.objects.get(internal_reference=tx_ref)
        except PaymentTransaction.DoesNotExist:
            return Response({"detail": "Transaction introuvable."}, status=404)

        # Simuler le webhook InTouch
        fake_webhook = {
            "transactionId": tx_ref,
            "status": "success" if outcome == "success" else "failed",
            "providerTransactionId": f"SANDBOX-{tx_ref[:8].upper()}",
            "amount": str(tx.amount),
            "sandbox": True,
        }
        PaymentService.process_webhook(fake_webhook)
        tx.refresh_from_db()

        return Response({
            "transaction_id": tx_ref,
            "new_status": tx.status,
            "message": (
                "✓ Paiement confirmé (sandbox)" if tx.status == "success"
                else "✗ Paiement refusé (sandbox)"
            ),
        })


class PaymentWebhookEventListAPIView(generics.ListAPIView):
    serializer_class = PaymentWebhookEventSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        return PaymentWebhookEvent.objects.all().order_by("-created_at")


class InTouchWebhookView(View):
    """
    POST /api/v1/payments/webhook/intouch/
    Endpoint public appelé par InTouch pour notifier le statut d'un paiement.
    Vérification optionnelle de signature HMAC si INTTOUCH_WEBHOOK_SECRET est défini.
    """
    http_method_names = ["post"]

    def _verify_signature(self, request) -> bool:
        secret = settings.INTTOUCH.get("WEBHOOK_SECRET", "")
        if not secret:
            return True  # Pas de secret configuré, on accepte
        sig_header = request.headers.get("X-InTouch-Signature", "")
        expected = hmac.new(secret.encode(), request.body, hashlib.sha256).hexdigest()
        return hmac.compare_digest(sig_header, expected)

    def post(self, request, *args, **kwargs):
        if not self._verify_signature(request):
            logger.warning("InTouch webhook : signature invalide")
            return JsonResponse({"error": "Signature invalide"}, status=401)

        try:
            payload = json.loads(request.body or b"{}")
        except json.JSONDecodeError:
            return JsonResponse({"error": "Corps JSON invalide"}, status=400)

        # Enregistrer l'event brut
        event = PaymentWebhookEvent.objects.create(
            provider="intouch",
            event_id=str(
                payload.get("event_id")
                or payload.get("transactionId")
                or payload.get("transaction_id")
                or ""
            ),
            payload=payload,
            processed=False,
        )

        # Traiter le webhook et mettre à jour la transaction
        tx = PaymentService.process_webhook(payload)

        if tx:
            event.processed = True
            event.save(update_fields=["processed"])
            logger.info("Webhook InTouch traité : tx=%s status=%s", tx.internal_reference, tx.status)

        return JsonResponse({"status": "accepted", "event_id": event.event_id}, status=202)
