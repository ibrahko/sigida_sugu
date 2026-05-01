from django.urls import path

from .views import (
    InitializeInTouchPaymentAPIView,
    InTouchWebhookView,
    PaymentTransactionDetailAPIView,
    PaymentTransactionListAPIView,
    PaymentWebhookEventListAPIView,
)

urlpatterns = [
    path("transactions/", PaymentTransactionListAPIView.as_view(), name="payments-transactions"),
    path("transactions/<int:pk>/", PaymentTransactionDetailAPIView.as_view(), name="payments-transaction-detail"),
    path("intouch/initialize/", InitializeInTouchPaymentAPIView.as_view(), name="payments-intouch-initialize"),
    path("webhooks/", PaymentWebhookEventListAPIView.as_view(), name="payments-webhook-events"),
    path("webhooks/intouch/", InTouchWebhookView.as_view(), name="payments-intouch-webhook"),
]