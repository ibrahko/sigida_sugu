from django.urls import path

from .views import AddToCartAPIView, CartItemDetailAPIView, MyCartAPIView

urlpatterns = [
    path("me/", MyCartAPIView.as_view(), name="cart-me"),
    path("items/add/", AddToCartAPIView.as_view(), name="cart-add-item"),
    path("items/<int:pk>/", CartItemDetailAPIView.as_view(), name="cart-item-detail"),
]