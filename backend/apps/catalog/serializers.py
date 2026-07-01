from rest_framework import serializers
from .models import Brand, Category, Product, ProductImage, ProductVariant


class CategoryNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "name", "slug")


class BrandNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ("id", "name", "slug")


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ("id", "image", "alt_text", "sort_order", "is_primary")


class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = ("id", "name", "sku", "price", "stock", "is_active")


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "name", "slug", "description", "image", "is_active", "sort_order")


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ("id", "name", "slug", "is_active")


class ProductListSerializer(serializers.ModelSerializer):
    category = CategoryNestedSerializer(read_only=True)
    brand = BrandNestedSerializer(read_only=True)
    primary_image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            "id",
            "name",
            "slug",
            "sku",
            "short_description",
            "price",
            "compare_at_price",
            "stock",
            "is_featured",
            "category",
            "brand",
            "primary_image",
        )

    def get_primary_image(self, obj):
        primary = next((img for img in obj.images.all() if img.is_primary), None)
        if not primary and obj.images.all():
            primary = obj.images.all()[0]
        return ProductImageSerializer(primary).data if primary else None


class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategoryNestedSerializer(read_only=True)
    brand = BrandNestedSerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = (
            "id",
            "name",
            "slug",
            "sku",
            "short_description",
            "description",
            "price",
            "compare_at_price",
            "cost_price",
            "stock",
            "track_stock",
            "is_active",
            "is_featured",
            "weight",
            "meta_title",
            "meta_description",
            "category",
            "brand",
            "images",
            "variants",
            "created_at",
            "updated_at",
        )