from rest_framework import serializers
from apps.catalog.serializers import ProductImageSerializer, ProductVariantSerializer
from .models import Cart, CartItem


class CartItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_sku = serializers.CharField(source="product.sku", read_only=True)
    product_price = serializers.DecimalField(source="product.price", max_digits=12, decimal_places=2, read_only=True)
    variant = ProductVariantSerializer(read_only=True)
    primary_image = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = (
            "id",
            "product",
            "product_name",
            "product_sku",
            "product_price",
            "variant",
            "quantity",
            "primary_image",
            "created_at",
            "updated_at",
        )

    def get_primary_image(self, obj):
        primary = obj.product.images.filter(is_primary=True).first() or obj.product.images.first()
        return ProductImageSerializer(primary).data if primary else None


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)

    class Meta:
        model = Cart
        fields = ("id", "user", "items", "created_at", "updated_at")