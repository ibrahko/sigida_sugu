# tests/cart/test_cart_api.py
import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.cart.models import Cart
from apps.catalog.models import Category, Brand, Product, ProductVariant


@pytest.fixture
def user_with_product(db):
    user = User.objects.create_user(
        username="cartuser",
        email="cart@example.com",
        password="StrongPass123!",
    )
    cat = Category.objects.create(
        name="Alimentaire",
        slug="alimentaire-cart",
        is_active=True,
        sort_order=1,
    )
    brand = Brand.objects.create(
        name="Sigida Cart",
        slug="sigida-cart",
        is_active=True,
    )
    product = Product.objects.create(
        category=cat,
        brand=brand,
        name="Riz Cart",
        slug="riz-cart",
        sku="RIZ-CART-001",
        short_description="Riz pour le panier",
        price="1500.00",
        stock=100,
        track_stock=True,
        is_active=True,
    )
    variant = ProductVariant.objects.create(
        product=product,
        name="1KG",
        sku="RIZ-CART-001-V1",
        price="1500.00",
        stock=50,
        is_active=True,
    )
    return user, product, variant


@pytest.mark.django_db
class TestCartAPI:
    def setup_method(self):
        self.client = APIClient()

    def test_add_to_cart_and_get_cart(self, user_with_product):
        user, product, variant = user_with_product
        self.client.force_authenticate(user=user)

        url_add = reverse("cart-add-item")
        payload = {
            "product_id": product.id,
            "variant_id": variant.id,
            "quantity": 2,
        }

        resp = self.client.post(url_add, payload, format="json")
        assert resp.status_code == 201
        assert resp.data["items"][0]["product_name"] == product.name
        assert resp.data["items"][0]["quantity"] == 2

        url_cart = reverse("cart-me")
        resp = self.client.get(url_cart)
        assert resp.status_code == 200
        assert len(resp.data["items"]) == 1

    def test_update_cart_item_quantity(self, user_with_product):
        user, product, variant = user_with_product
        self.client.force_authenticate(user=user)

        cart = Cart.objects.create(user=user)
        item = cart.items.create(product=product, variant=variant, quantity=1)

        url_item = reverse("cart-item-detail", args=[item.id])
        resp = self.client.patch(url_item, {"quantity": 3}, format="json")
        assert resp.status_code == 200
        assert resp.data["items"][0]["quantity"] == 3

    def test_delete_cart_item(self, user_with_product):
        user, product, variant = user_with_product
        self.client.force_authenticate(user=user)

        cart = Cart.objects.create(user=user)
        item = cart.items.create(product=product, variant=variant, quantity=1)

        url_item = reverse("cart-item-detail", args=[item.id])
        resp = self.client.delete(url_item)
        assert resp.status_code == 200
        assert resp.data["items"] == []