import uuid
from django.conf import settings
from django.db import transaction
from .models import PaymentTransaction


class InTouchClient:
    def __init__(self):
        self.base_url = settings.INTTOUCH["BASE_URL"]
        self.api_key = settings.INTTOUCH.get("API_KEY", "")
        self.api_secret = settings.INTTOUCH.get("API_SECRET", "")
        self.username = settings.INTTOUCH.get("USERNAME", "")
        self.account_no = settings.INTTOUCH.get("ACCOUNT_NO", "")
        self.partner_password = settings.INTTOUCH.get("PARTNER_PASSWORD", "")
        self.callback_url = settings.INTTOUCH.get("CALLBACK_URL", "")

    def build_payment_payload(self, *, amount, phone, transaction_id):
        payload = {
            "amount": str(amount),
            "transactionId": transaction_id,
            "phone": phone,
        }
        if self.username:
            payload["username"] = self.username
        if self.account_no:
            payload["accountno"] = self.account_no
        if self.partner_password:
            payload["password"] = self.partner_password
        if self.callback_url:
            payload["callback_url"] = self.callback_url
        return payload


class PaymentService:
    @staticmethod
    @transaction.atomic
    def initialize_intouch_payment(order):
        client = InTouchClient()
        tx = PaymentTransaction.objects.create(
            order=order,
            provider=PaymentTransaction.Provider.INTOUCH,
            status=PaymentTransaction.Status.INITIATED,
            amount=order.total,
            currency=order.currency,
            internal_reference=uuid.uuid4().hex,
        )
        payload = client.build_payment_payload(
            amount=tx.amount,
            phone=getattr(order.user, "phone", ""),
            transaction_id=tx.internal_reference,
        )
        tx.raw_request = payload
        tx.save(update_fields=["raw_request", "updated_at"])
        return tx, payload