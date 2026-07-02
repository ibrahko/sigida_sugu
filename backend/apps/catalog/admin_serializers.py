"""Serializers d'écriture réservés au backoffice admin."""
import re
from rest_framework import serializers
from .models import Brand, Category, Product, ProductImage, ProductVariant


class CategoryWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "name", "slug", "description", "image", "is_active", "sort_order")

    def validate_slug(self, value):
        if not value:
            return value
        qs = Category.objects.filter(slug=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Ce slug est déjà utilisé.")
        return value

    def validate_name(self, value):
        if not value:
            return value
        slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
        if not self.initial_data.get("slug"):
            self.initial_data["slug"] = slug
        return value


class ProductVariantWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = ("id", "name", "sku", "price", "stock", "is_active")


class ProductImageWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ("id", "image", "alt_text", "sort_order", "is_primary")


class ProductWriteSerializer(serializers.ModelSerializer):
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source="category", write_only=True
    )
    brand_id = serializers.PrimaryKeyRelatedField(
        queryset=Brand.objects.all(), source="brand", write_only=True,
        required=False, allow_null=True
    )
    category = serializers.SerializerMethodField(read_only=True)
    brand = serializers.SerializerMethodField(read_only=True)
    images = serializers.SerializerMethodField(read_only=True)
    variants = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Product
        fields = (
            "id", "name", "slug", "sku",
            "short_description", "description",
            "price", "compare_at_price", "cost_price",
            "stock", "track_stock",
            "is_active", "is_featured", "weight",
            "meta_title", "meta_description",
            "category_id", "brand_id",
            "category", "brand",
            "images", "variants",
            "created_at",
        )
        read_only_fields = ("id", "created_at")

    def get_category(self, obj):
        return {"id": obj.category.id, "name": obj.category.name} if obj.category else None

    def get_brand(self, obj):
        return {"id": obj.brand.id, "name": obj.brand.name} if obj.brand else None

    def get_images(self, obj):
        from .serializers import ProductImageSerializer
        return ProductImageSerializer(obj.images.all(), many=True).data

    def get_variants(self, obj):
        from .serializers import ProductVariantSerializer
        return ProductVariantSerializer(obj.variants.all(), many=True).data

    def validate_slug(self, value):
        if not value:
            return value
        qs = Product.objects.filter(slug=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Ce slug est déjà utilisé.")
        return value

    def validate(self, attrs):
        # Auto-slug from name if not provided
        if not attrs.get("slug") and attrs.get("name"):
            slug = re.sub(r"[^a-z0-9]+", "-", attrs["name"].lower()).strip("-")
            attrs["slug"] = slug
        return attrs
