from rest_framework import serializers
from apps.orders.models import Order
from apps.orders.serializers import OrderSerializer
from .models import PaymentTransaction, PaymentWebhookEvent
from .services import PaymentService


class PaymentTransactionSerializer(serializers.ModelSerializer):
    order = OrderSerializer(read_only=True)

    class Meta:
        model = PaymentTransaction
        fields = (
            "id",
            "order",
            "provider",
            "status",
            "amount",
            "currency",
            "internal_reference",
            "provider_reference",
            "raw_request",
            "raw_response",
            "created_at",
            "updated_at",
        )


class PaymentWebhookEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentWebhookEvent
        fields = (
            "id",
            "provider",
            "event_id",
            "payload",
            "processed",
            "created_at",
        )


class InitializePaymentSerializer(serializers.Serializer):
    order_id = serializers.IntegerField()

    def validate_order_id(self, value):
        request = self.context["request"]
        if not Order.objects.filter(id=value, user=request.user).exists():
            raise serializers.ValidationError("Commande introuvable.")
        return value

    def create(self, validated_data):
        request = self.context["request"]
        order = Order.objects.get(id=validated_data["order_id"], user=request.user)
        tx, payload = PaymentService.initialize_intouch_payment(order)
        return {
            "transaction": tx,
            "provider_payload": payload,
        }