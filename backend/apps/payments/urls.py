from django.urls import path

from .views import (
    InitializeInTouchPaymentAPIView,
    InTouchWebhookView,
    PaymentStatusAPIView,
    PaymentTransactionDetailAPIView,
    PaymentTransactionListAPIView,
    PaymentWebhookEventListAPIView,
    SandboxSimulatePaymentView,
)

urlpatterns = [
    path("transactions/", PaymentTransactionListAPIView.as_view(), name="payments-transactions"),
    path("transactions/<int:pk>/", PaymentTransactionDetailAPIView.as_view(), name="payments-transaction-detail"),
    path("transactions/<int:pk>/status/", PaymentStatusAPIView.as_view(), name="payments-transaction-status"),
    path("intouch/initialize/", InitializeInTouchPaymentAPIView.as_view(), name="payments-intouch-initialize"),
    path("sandbox/simulate/", SandboxSimulatePaymentView.as_view(), name="payments-sandbox-simulate"),
    path("webhooks/", PaymentWebhookEventListAPIView.as_view(), name="payments-webhook-events"),
    path("webhook/intouch/", InTouchWebhookView.as_view(), name="payments-intouch-webhook"),
]
