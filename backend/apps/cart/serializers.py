from decimal import Decimal
from rest_framework import serializers
from apps.catalog.serializers import ProductImageSerializer, ProductVariantSerializer
from .models import Cart, CartItem


class CartItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_sku = serializers.CharField(source="product.sku", read_only=True)
    unit_price = serializers.DecimalField(source="product.price", max_digits=12, decimal_places=2, read_only=True)
    total_price = serializers.SerializerMethodField()
    product_image = serializers.SerializerMethodField()
    variant = ProductVariantSerializer(read_only=True)

    class Meta:
        model = CartItem
        fields = (
            "id",
            "product",
            "product_name",
            "product_sku",
            "unit_price",
            "total_price",
            "variant",
            "quantity",
            "product_image",
            "created_at",
            "updated_at",
        )

    def get_total_price(self, obj):
        price = obj.product.price or Decimal("0")
        return str(price * obj.quantity)

    def get_product_image(self, obj):
        primary = obj.product.images.filter(is_primary=True).first() or obj.product.images.first()
        if primary is None:
            return None
        request = self.context.get("request")
        url = primary.image.url if primary.image else None
        if url and request:
            return request.build_absolute_uri(url)
        return url


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_quantity = serializers.SerializerMethodField()
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ("id", "user", "items", "total_quantity", "subtotal", "created_at", "updated_at")

    def get_total_quantity(self, obj):
        return sum(item.quantity for item in obj.items.all())

    def get_subtotal(self, obj):
        total = sum((item.product.price or Decimal("0")) * item.quantity for item in obj.items.all())
        return str(total)
