from django.urls import path
from .views import BrandListAPIView, CategoryListAPIView, ProductDetailAPIView, ProductListAPIView

urlpatterns = [
    path("categories/", CategoryListAPIView.as_view(), name="catalog-categories"),
    path("brands/", BrandListAPIView.as_view(), name="catalog-brands"),
    path("products/", ProductListAPIView.as_view(), name="catalog-products-list"),
    path("products/<int:pk>/", ProductDetailAPIView.as_view(), name="catalog-products-detail"),
]
