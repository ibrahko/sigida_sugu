from django.contrib import admin
from .models import PaymentTransaction, PaymentWebhookEvent


@admin.register(PaymentTransaction)
class PaymentTransactionAdmin(admin.ModelAdmin):
    list_display = (
        "internal_reference",
        "order",
        "provider",
        "status",
        "amount",
        "currency",
        "provider_reference",
        "created_at",
    )
    list_filter = ("provider", "status", "currency")
    search_fields = ("internal_reference", "provider_reference", "order__number")


@admin.register(PaymentWebhookEvent)
class PaymentWebhookEventAdmin(admin.ModelAdmin):
    list_display = ("provider", "event_id", "processed", "created_at")
    list_filter = ("provider", "processed")
    search_fields = ("event_id",)