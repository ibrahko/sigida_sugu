import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from apps.accounts.models import Address, User
from apps.catalog.models import Category, Brand, Product, ProductVariant
from apps.delivery.models import DeliveryZone
from apps.orders.models import Order


@pytest.fixture
def order_context(db):
    user = User.objects.create_user(
        username="orderuser",
        email="order@example.com",
        password="StrongPass123!",
    )
    addr = Address.objects.create(
        user=user,
        label="Maison",
        full_name="Order User",
        phone="+22370000021",
        line1="Hamdallaye",
        city="Bamako",
        region="Bamako",
        country="Mali",
        is_default=True,
    )
    zone = DeliveryZone.objects.create(
        name="Bamako",
        code="BKO",
        fee="1500.00",
        estimated_min_days=1,
        estimated_max_days=2,
        is_active=True,
    )
    cat = Category.objects.create(
        name="Alimentaire",
        slug="alimentaire-ord",
        is_active=True,
        sort_order=1,
    )
    brand = Brand.objects.create(
        name="Sigida Order",
        slug="sigida-order",
        is_active=True,
    )
    product = Product.objects.create(
        category=cat,
        brand=brand,
        name="Riz Order",
        slug="riz-order",
        sku="RIZ-ORD-001",
        short_description="Riz pour commande",
        price="2000.00",
        stock=100,
        track_stock=True,
        is_active=True,
    )
    variant = ProductVariant.objects.create(
        product=product,
        name="1KG",
        sku="RIZ-ORD-001-V1",
        price="2000.00",
        stock=50,
        is_active=True,
    )
    return user, addr, zone, product, variant


@pytest.mark.django_db
class TestOrdersAPI:
    def setup_method(self):
        self.client = APIClient()

    def test_create_order(self, order_context):
        user, addr, zone, product, variant = order_context
        self.client.force_authenticate(user=user)

        url = reverse("orders-list-create")
        payload = {
            "items": [
                {"product_id": product.id, "variant_id": variant.id, "quantity": 2},
            ],
            "delivery_address_id": addr.id,
            "delivery_zone_id": zone.id,
            "delivery_fee": "1500.00",
            "discount_amount": "0.00",
            "notes": "Test order",
        }

        resp = self.client.post(url, payload, format="json")
        assert resp.status_code == 201
        assert resp.data["number"].startswith("SGS")
        assert resp.data["subtotal"] == "4000.00"
        assert resp.data["total"] == "5500.00"

        assert Order.objects.count() == 1
        order = Order.objects.first()
        assert order.items.count() == 1

    def test_list_orders_for_user(self, order_context):
        user, addr, zone, product, variant = order_context
        self.client.force_authenticate(user=user)

        url = reverse("orders-list-create")
        payload = {
            "items": [
                {"product_id": product.id, "variant_id": variant.id, "quantity": 1},
            ],
            "delivery_address_id": addr.id,
            "delivery_zone_id": zone.id,
            "delivery_fee": "1500.00",
            "discount_amount": "0.00",
            "notes": "",
        }

        self.client.post(url, payload, format="json")
        self.client.post(url, payload, format="json")

        resp = self.client.get(url)
        assert resp.status_code == 200
        assert resp.data["count"] == 2