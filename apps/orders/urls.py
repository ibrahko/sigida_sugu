from django.urls import path

from .views import OrderDetailAPIView, OrderListCreateAPIView

urlpatterns = [
    path("", OrderListCreateAPIView.as_view(), name="orders-list-create"),
    path("<int:pk>/", OrderDetailAPIView.as_view(), name="orders-detail"),
]