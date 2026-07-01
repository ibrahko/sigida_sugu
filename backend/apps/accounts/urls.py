from django.urls import path

from .views import (
    AccountSummaryView,
    AddressDetailAPIView,
    AddressListCreateAPIView,
    MeAPIView,
    RegisterAPIView,
    LoginAPIView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
)

urlpatterns = [
    path("login/", LoginAPIView.as_view(), name="accounts-login"),
    path("register/", RegisterAPIView.as_view(), name="accounts-register"),
    path("me/", MeAPIView.as_view(), name="accounts-me"),
    path("summary/", AccountSummaryView.as_view(), name="accounts-summary"),
    path("addresses/", AddressListCreateAPIView.as_view(), name="accounts-address-list"),
    path("addresses/<int:pk>/", AddressDetailAPIView.as_view(), name="accounts-address-detail"),
    path("password-reset/", PasswordResetRequestView.as_view(), name="accounts-password-reset"),
    path("password-reset/confirm/", PasswordResetConfirmView.as_view(), name="accounts-password-reset-confirm"),
]
