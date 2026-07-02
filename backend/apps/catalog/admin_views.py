"""Vues admin catalogue — rôles staff/admin."""
from rest_framework import generics, filters
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from apps.accounts.permissions import IsCatalogAdmin, IsStaffOrAdmin
from .models import Category, Product
from .serializers import CategorySerializer, ProductListSerializer, ProductDetailSerializer
from .admin_serializers import CategoryWriteSerializer, ProductWriteSerializer


class AdminCategoryListCreateView(generics.ListCreateAPIView):
    """
    GET  → staff ou admin
    POST → admin uniquement
    """
    permission_classes = [IsCatalogAdmin]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "slug"]
    ordering_fields = ["sort_order", "name", "created_at"]
    ordering = ["sort_order", "name"]

    def get_queryset(self):
        return Category.objects.all()

    def get_serializer_class(self):
        return CategoryWriteSerializer if self.request.method == "POST" else CategorySerializer


class AdminCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET         → staff ou admin
    PUT/PATCH   → admin uniquement
    DELETE      → admin uniquement
    """
    permission_classes = [IsCatalogAdmin]
    queryset = Category.objects.all()

    def get_serializer_class(self):
        return CategoryWriteSerializer if self.request.method in ("PUT", "PATCH") else CategorySerializer


class AdminProductListCreateView(generics.ListCreateAPIView):
    """
    GET  → staff ou admin
    POST → admin uniquement
    """
    permission_classes = [IsCatalogAdmin]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "sku", "short_description"]
    ordering_fields = ["created_at", "price", "name", "stock"]
    ordering = ["-created_at"]

    def get_queryset(self):
        qs = (
            Product.objects
            .select_related("category", "brand")
            .prefetch_related("images", "variants")
        )
        category = self.request.query_params.get("category")
        is_active = self.request.query_params.get("is_active")
        if category:
            qs = qs.filter(category_id=category)
        if is_active is not None:
            qs = qs.filter(is_active=is_active in ("1", "true", "True"))
        return qs

    def get_serializer_class(self):
        return ProductWriteSerializer if self.request.method == "POST" else ProductListSerializer


class AdminProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET         → staff ou admin
    PUT/PATCH   → admin uniquement
    DELETE      → admin uniquement
    """
    permission_classes = [IsCatalogAdmin]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return (
            Product.objects
            .select_related("category", "brand")
            .prefetch_related("images", "variants")
        )

    def get_serializer_class(self):
        return ProductWriteSerializer if self.request.method in ("PUT", "PATCH") else ProductDetailSerializer
