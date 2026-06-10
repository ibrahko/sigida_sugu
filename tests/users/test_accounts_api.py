import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from apps.accounts.models import Address, User


@pytest.mark.django_db
class TestAccountsAPI:
    def setup_method(self):
        self.client = APIClient()

    def test_register_creates_user(self):
        url = reverse("accounts-register")
        payload = {
            "username": "newuser",
            "first_name": "New",
            "last_name": "User",
            "email": "newuser@example.com",
            "phone": "+22370000099",
            "password": "StrongPass123!",
        }

        resp = self.client.post(url, payload, format="json")
        assert resp.status_code == 201
        assert User.objects.filter(username="newuser").exists()

    def test_me_requires_auth(self):
        url = reverse("accounts-me")
        resp = self.client.get(url)
        assert resp.status_code == 403 or resp.status_code == 401

    def test_me_returns_user_data(self):
        user = User.objects.create_user(
            username="meuser",
            email="me@example.com",
            password="StrongPass123!",
        )

        self.client.force_authenticate(user=user)
        url = reverse("accounts-me")

        resp = self.client.get(url)
        assert resp.status_code == 200
        assert resp.data["username"] == "meuser"
        assert resp.data["email"] == "me@example.com"

    def test_addresses_crud(self):
        user = User.objects.create_user(
            username="addruser",
            email="addr@example.com",
            password="StrongPass123!",
        )

        self.client.force_authenticate(user=user)

        list_url = reverse("accounts-address-list")

        payload = {
            "label": "Maison",
            "full_name": "Addr User",
            "phone": "+22370000055",
            "line1": "Hamdallaye ACI",
            "line2": "",
            "city": "Bamako",
            "region": "Bamako",
            "country": "Mali",
            "postal_code": "",
            "landmark": "Près du rond-point",
            "is_default": True,
        }

        resp = self.client.post(list_url, payload, format="json")
        assert resp.status_code == 201
        addr_id = resp.data["id"]

        addr = Address.objects.get(id=addr_id)
        assert addr.user == user
        assert addr.is_default is True

        detail_url = reverse("accounts-address-detail", args=[addr_id])
        resp = self.client.patch(detail_url, {"city": "TestCity"}, format="json")
        assert resp.status_code == 200
        assert resp.data["city"] == "TestCity"

        resp = self.client.delete(detail_url)
        assert resp.status_code in (204, 200)
        assert not Address.objects.filter(id=addr_id).exists()