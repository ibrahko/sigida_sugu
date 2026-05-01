from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import BrandListAPIView, CategoryListAPIView, ProductViewSet

router = DefaultRouter()
router.register("products", ProductViewSet, basename="catalog-products")

urlpatterns = [
    path("categories/", CategoryListAPIView.as_view(), name="catalog-categories"),
    path("brands/", BrandListAPIView.as_view(), name="catalog-brands"),
    path("", include(router.urls)),
]