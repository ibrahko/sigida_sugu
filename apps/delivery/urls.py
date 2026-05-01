from django.urls import path

from .views import DeliveryZoneDetailAPIView, DeliveryZoneListCreateAPIView

urlpatterns = [
    path("", DeliveryZoneListCreateAPIView.as_view(), name="delivery-zones"),
    path("<int:pk>/", DeliveryZoneDetailAPIView.as_view(), name="delivery-zone-detail"),
]