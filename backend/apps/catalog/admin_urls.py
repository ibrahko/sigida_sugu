from django.urls import path
from .admin_views import (
    AdminCategoryListCreateView,
    AdminCategoryDetailView,
    AdminProductListCreateView,
    AdminProductDetailView,
)

urlpatterns = [
    path("categories/", AdminCategoryListCreateView.as_view(), name="admin-categories-list"),
    path("categories/<int:pk>/", AdminCategoryDetailView.as_view(), name="admin-categories-detail"),
    path("products/", AdminProductListCreateView.as_view(), name="admin-products-list"),
    path("products/<int:pk>/", AdminProductDetailView.as_view(), name="admin-products-detail"),
]
