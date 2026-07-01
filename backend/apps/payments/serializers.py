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
            "created_at",
            "updated_at",
        )


class PaymentWebhookEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentWebhookEvent
        fields = ("id", "provider", "event_id", "payload", "processed", "created_at")


class InitializePaymentSerializer(serializers.Serializer):
    order_id = serializers.IntegerField()
    phone = serializers.CharField(required=False, allow_blank=True, default="")
    operator = serializers.ChoiceField(
        choices=["orange_money", "moov_money", "sama_money", ""],
        required=False,
        allow_blank=True,
        default="",
    )

    def validate_order_id(self, value):
        request = self.context["request"]
        if not Order.objects.filter(id=value, user=request.user).exists():
            raise serializers.ValidationError("Commande introuvable.")
        return value

    def create(self, validated_data):
        request = self.context["request"]
        order = Order.objects.get(id=validated_data["order_id"], user=request.user)
        tx = PaymentService.initialize_intouch_payment(
            order,
            phone=validated_data.get("phone", ""),
            operator=validated_data.get("operator", ""),
        )
        return {"transaction": tx}
