import logging
import uuid

import requests
from django.conf import settings
from django.db import transaction

from .models import PaymentTransaction

logger = logging.getLogger(__name__)

# Opérateurs supportés via InTouch Mali
OPERATOR_CODES = {
    "orange_money": "ORANGE",
    "moov_money": "MOOV",
    "sama_money": "SAMA",
}


class InTouchError(Exception):
    """Erreur retournée par l'API InTouch."""
    def __init__(self, message, code=None, raw=None):
        super().__init__(message)
        self.code = code
        self.raw = raw


class InTouchClient:
    """Client HTTP pour l'API InTouch Mobile Money."""

    def __init__(self):
        cfg = settings.INTTOUCH
        self.base_url = cfg.get("BASE_URL", "https://api.intouchpayments.com").rstrip("/")
        self.username = cfg.get("USERNAME", "")
        self.partner_password = cfg.get("PARTNER_PASSWORD", "")
        self.account_no = cfg.get("ACCOUNT_NO", "")
        self.callback_url = cfg.get("CALLBACK_URL", "")
        self.timeout = int(cfg.get("TIMEOUT", 30))

    @property
    def sandbox(self):
        return settings.INTTOUCH.get("SANDBOX", False)

    @property
    def _is_configured(self):
        return bool(self.username and self.partner_password and self.account_no)

    def _post(self, endpoint: str, payload: dict) -> dict:
        url = f"{self.base_url}{endpoint}"
        logger.info("InTouch → POST %s payload=%s", url, payload)
        try:
            resp = requests.post(url, json=payload, timeout=self.timeout)
        except requests.Timeout:
            raise InTouchError("Timeout lors de la connexion à InTouch")
        except requests.ConnectionError as exc:
            raise InTouchError(f"Connexion impossible à InTouch : {exc}")

        logger.info("InTouch ← status=%s body=%s", resp.status_code, resp.text[:500])

        try:
            data = resp.json()
        except Exception:
            raise InTouchError(f"Réponse non-JSON de InTouch (HTTP {resp.status_code})", raw=resp.text)

        return data

    def request_payment(self, *, amount, phone, transaction_id, operator: str = "") -> dict:
        """
        Déclenche un push de paiement Mobile Money vers le numéro `phone`.
        L'utilisateur reçoit une notification et valide depuis son téléphone.
        """
        if self.sandbox or not self._is_configured:
            logger.info("InTouch SANDBOX — paiement simulé tx=%s", transaction_id)
            return {
                "status": "sandbox",
                "transactionId": transaction_id,
                "message": "Mode sandbox actif. Utilisez /payments/sandbox/simulate/ pour confirmer.",
            }

        payload = {
            "username": self.username,
            "password": self.partner_password,
            "accountno": self.account_no,
            "amount": str(amount),
            "transactionId": transaction_id,
            "phone": phone,
            "callback_url": self.callback_url,
        }
        if operator and operator in OPERATOR_CODES:
            payload["operator"] = OPERATOR_CODES[operator]

        data = self._post("/v1/payment/request", payload)

        # InTouch renvoie status 200 même en cas d'erreur métier
        if data.get("status") in ("error", "failed") or data.get("code") not in (None, "0", 0, "200", 200):
            raise InTouchError(
                data.get("message", "Erreur InTouch inconnue"),
                code=data.get("code"),
                raw=data,
            )
        return data

    def check_status(self, transaction_id: str) -> dict:
        """Interroge le statut d'une transaction InTouch."""
        if not self._is_configured:
            return {"status": "stub", "transactionId": transaction_id}

        payload = {
            "username": self.username,
            "password": self.partner_password,
            "transactionId": transaction_id,
        }
        return self._post("/v1/payment/status", payload)


class PaymentService:

    @staticmethod
    @transaction.atomic
    def initialize_intouch_payment(order, phone: str = "", operator: str = ""):
        """
        Crée une PaymentTransaction et envoie la demande de paiement à InTouch.
        Si InTouch n'est pas configuré, fonctionne en mode stub (pas de vraie requête).
        """
        client = InTouchClient()

        # Récupère le numéro depuis la commande si non fourni
        if not phone:
            phone = getattr(order.user, "phone", "") or ""

        tx = PaymentTransaction.objects.create(
            order=order,
            provider=PaymentTransaction.Provider.INTOUCH,
            status=PaymentTransaction.Status.INITIATED,
            amount=order.total,
            currency=order.currency,
            internal_reference=uuid.uuid4().hex,
        )

        try:
            response = client.request_payment(
                amount=tx.amount,
                phone=phone,
                transaction_id=tx.internal_reference,
                operator=operator,
            )
            tx.raw_request = {"phone": phone, "operator": operator, "amount": str(tx.amount)}
            tx.raw_response = response
            tx.status = PaymentTransaction.Status.PENDING
        except InTouchError as exc:
            logger.error("InTouch payment error: %s (code=%s)", exc, exc.code)
            tx.raw_response = {"error": str(exc), "code": exc.code, "raw": exc.raw}
            tx.status = PaymentTransaction.Status.FAILED

        tx.save(update_fields=["raw_request", "raw_response", "status", "updated_at"])
        return tx

    @staticmethod
    @transaction.atomic
    def process_webhook(payload: dict) -> PaymentTransaction | None:
        """
        Traite un webhook InTouch et met à jour le statut de la transaction.
        Appelé par InTouchWebhookView après validation.
        """
        tx_id = payload.get("transactionId") or payload.get("transaction_id")
        if not tx_id:
            logger.warning("Webhook InTouch sans transactionId : %s", payload)
            return None

        try:
            tx = PaymentTransaction.objects.select_for_update().get(internal_reference=tx_id)
        except PaymentTransaction.DoesNotExist:
            logger.warning("Webhook InTouch : transaction inconnue %s", tx_id)
            return None

        intouch_status = str(payload.get("status", "")).lower()
        if intouch_status in ("success", "successful", "completed", "00"):
            tx.status = PaymentTransaction.Status.SUCCESS
            tx.provider_reference = payload.get("providerTransactionId", "")
            # Marquer la commande comme payée
            order = tx.order
            old_status = order.status
            order.status = "paid"
            order.save(update_fields=["status", "updated_at"])
            if old_status != "paid":
                from apps.notifications.tasks import send_order_status_email, dispatch
                dispatch(send_order_status_email, order.id)
        elif intouch_status in ("failed", "error", "cancelled", "rejected"):
            tx.status = PaymentTransaction.Status.FAILED
        else:
            tx.status = PaymentTransaction.Status.PENDING

        tx.raw_response = {**tx.raw_response, "webhook": payload}
        tx.save(update_fields=["status", "provider_reference", "raw_response", "updated_at"])
        return tx
