import json

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


class PaymentTransactionListAPIView(generics.ListAPIView):
    serializer_class = PaymentTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            PaymentTransaction.objects.filter(order__user=self.request.user)
            .select_related("order", "order__user", "order__delivery_address", "order__delivery_zone")
            .prefetch_related("order__items__product__images")
            .order_by("-created_at")
        )


class PaymentTransactionDetailAPIView(generics.RetrieveAPIView):
    serializer_class = PaymentTransactionSerializer
    permission_classes = [permissions.IsAuthenticated, IsPaymentOwnerOrAdmin]

    def get_queryset(self):
        return (
            PaymentTransaction.objects.select_related(
                "order",
                "order__user",
                "order__delivery_address",
                "order__delivery_zone",
            )
            .prefetch_related("order__items__product__images")
            .all()
        )

    def get_object(self):
        obj = super().get_object()
        self.check_object_permissions(self.request, obj)
        return obj


class InitializeInTouchPaymentAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = InitializePaymentSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        result = serializer.save()

        return Response(
            {
                "transaction": PaymentTransactionSerializer(result["transaction"], context={"request": request}).data,
                "provider_payload": result["provider_payload"],
                "integration_mode": "prepared_for_intouch_real_mapping",
            },
            status=status.HTTP_201_CREATED,
        )


class PaymentWebhookEventListAPIView(generics.ListAPIView):
    serializer_class = PaymentWebhookEventSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        return PaymentWebhookEvent.objects.all().order_by("-created_at")


class InTouchWebhookView(View):
    http_method_names = ["post"]

    def post(self, request, *args, **kwargs):
        payload = json.loads(request.body or b"{}")
        event = PaymentWebhookEvent.objects.create(
            provider="intouch",
            event_id=str(payload.get("event_id") or payload.get("transactionId") or ""),
            payload=payload,
            processed=False,
        )
        return JsonResponse(
            {
                "status": "accepted",
                "event_id": event.event_id,
            },
            status=202,
        )