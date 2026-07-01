from decimal import Decimal
from rest_framework import serializers
from apps.accounts.serializers import AddressSerializer, UserNestedSerializer
from apps.catalog.serializers import ProductImageSerializer
from apps.delivery.serializers import DeliveryZoneSerializer
from .models import Order, OrderItem
from .services import OrderService


class OrderItemSerializer(serializers.ModelSerializer):
    primary_image = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = (
            "id",
            "product",
            "variant",
            "product_name",
            "variant_name",
            "sku",
            "unit_price",
            "quantity",
            "line_total",
            "primary_image",
        )

    def get_primary_image(self, obj):
        primary = obj.product.images.filter(is_primary=True).first() or obj.product.images.first()
        return ProductImageSerializer(primary).data if primary else None


class OrderSerializer(serializers.ModelSerializer):
    user = UserNestedSerializer(read_only=True)
    delivery_address = AddressSerializer(read_only=True)
    delivery_zone = DeliveryZoneSerializer(read_only=True)
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = (
            "id",
            "number",
            "status",
            "user",
            "delivery_address",
            "delivery_zone",
            "subtotal",
            "delivery_fee",
            "discount_amount",
            "total",
            "currency",
            "notes",
            "items",
            "created_at",
            "updated_at",
        )


class OrderCreateItemInputSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    variant_id = serializers.IntegerField(required=False, allow_null=True)
    quantity = serializers.IntegerField(min_value=1)


class OrderCreateSerializer(serializers.Serializer):
    items = OrderCreateItemInputSerializer(many=True)
    delivery_address_id = serializers.IntegerField(required=False, allow_null=True)
    delivery_zone_id = serializers.IntegerField(required=False, allow_null=True)
    delivery_fee = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, default=Decimal("0.00"))
    discount_amount = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, default=Decimal("0.00"))
    notes = serializers.CharField(required=False, allow_blank=True, default="")

    def create(self, validated_data):
        from apps.accounts.models import Address
        from apps.delivery.models import DeliveryZone

        user = self.context["request"].user

        delivery_address = None
        delivery_zone = None

        if validated_data.get("delivery_address_id"):
            delivery_address = Address.objects.get(id=validated_data["delivery_address_id"], user=user)

        if validated_data.get("delivery_zone_id"):
            delivery_zone = DeliveryZone.objects.get(id=validated_data["delivery_zone_id"], is_active=True)

        return OrderService.create_order(
            user=user,
            items=validated_data["items"],
            delivery_address=delivery_address,
            delivery_zone=delivery_zone,
            delivery_fee=validated_data.get("delivery_fee", Decimal("0.00")),
            discount_amount=validated_data.get("discount_amount", Decimal("0.00")),
            notes=validated_data.get("notes", ""),
        )