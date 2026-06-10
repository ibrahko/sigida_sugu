from rest_framework import filters, generics, permissions, viewsets
from rest_framework.permissions import AllowAny, IsAdminUser

from .models import Brand, Category, Product
from .serializers import (
    BrandSerializer,
    CategorySerializer,
    ProductDetailSerializer,
    ProductListSerializer,
)


class CategoryListAPIView(generics.ListAPIView):
    queryset = Category.objects.filter(is_active=True).order_by("sort_order", "name")
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    authentication_classes = []


class BrandListAPIView(generics.ListAPIView):
    queryset = Brand.objects.filter(is_active=True).order_by("name")
    serializer_class = BrandSerializer
    permission_classes = [AllowAny]
    authentication_classes = []


class ProductViewSet(viewsets.ModelViewSet):
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    ordering_fields = ["created_at", "price", "name"]
    ordering = ["-created_at"]
    search_fields = ["name", "sku", "short_description"]

    def get_queryset(self):
        queryset = (
            Product.objects
            .select_related("category", "brand")
            .prefetch_related("images", "variants")
        )

        if getattr(self, "action", None) in ["list", "retrieve"]:
            queryset = queryset.filter(is_active=True)

        category_slug = self.request.query_params.get("category")
        brand_slug = self.request.query_params.get("brand")
        featured = self.request.query_params.get("featured")

        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)

        if brand_slug:
            queryset = queryset.filter(brand__slug=brand_slug)

        if featured in ["1", "true", "True"]:
            queryset = queryset.filter(is_featured=True)

        return queryset

    def get_serializer_class(self):
        if getattr(self, "action", None) == "retrieve":
            return ProductDetailSerializer
        return ProductListSerializer

    def get_permissions(self):
        if getattr(self, "action", None) in ["list", "retrieve"]:
            return [AllowAny()]
        return [IsAdminUser()]

    def get_authenticators(self):
        if getattr(self, "action", None) in ["list", "retrieve"]:
            return []
        return super().get_authenticators()