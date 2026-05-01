from django.urls import path

from .views import (
    AddressDetailAPIView,
    AddressListCreateAPIView,
    MeAPIView,
    RegisterAPIView,
)

urlpatterns = [
    path("register/", RegisterAPIView.as_view(), name="accounts-register"),
    path("me/", MeAPIView.as_view(), name="accounts-me"),
    path("addresses/", AddressListCreateAPIView.as_view(), name="accounts-address-list"),
    path("addresses/<int:pk>/", AddressDetailAPIView.as_view(), name="accounts-address-detail"),
]