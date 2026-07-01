from django.core.validators import MinValueValidator
from django.db import models
from apps.common.models import TimeStampedModel
from apps.orders.models import Order


class PaymentTransaction(TimeStampedModel):
    class Provider(models.TextChoices):
        INTOUCH = "intouch", "InTouch"
        COD = "cod", "Cash on Delivery"

    class Status(models.TextChoices):
        INITIATED = "initiated", "Initiated"
        PENDING = "pending", "Pending"
        SUCCESS = "success", "Success"
        FAILED = "failed", "Failed"
        CANCELLED = "cancelled", "Cancelled"

    order = models.ForeignKey(Order, on_delete=models.PROTECT, related_name="transactions")
    provider = models.CharField(max_length=20, choices=Provider.choices, db_index=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.INITIATED, db_index=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    currency = models.CharField(max_length=3, default="XOF")
    internal_reference = models.CharField(max_length=64, unique=True, db_index=True)
    provider_reference = models.CharField(max_length=128, blank=True, db_index=True)
    raw_request = models.JSONField(default=dict, blank=True)
    raw_response = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.internal_reference


class PaymentWebhookEvent(TimeStampedModel):
    provider = models.CharField(max_length=20, db_index=True)
    event_id = models.CharField(max_length=128, blank=True, db_index=True)
    payload = models.JSONField(default=dict, blank=True)
    processed = models.BooleanField(default=False, db_index=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.provider} - {self.event_id or self.id}"