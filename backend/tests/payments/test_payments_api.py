import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from apps.accounts.models import Address, User
from apps.catalog.models import Brand, Category, Product, ProductVariant
from apps.delivery.models import DeliveryZone
from apps.orders.models import Order
from apps.payments.models import PaymentTransaction


@pytest.fixture
def order_for_payment(db):
    user = User.objects.create_user(
        username="payuser",
        email="pay@example.com",
        password="StrongPass123!",
        phone="+22370000031",
    )
    addr = Address.objects.create(
        user=user,
        label="Maison",
        full_name="Pay User",
        phone=user.phone,
        line1="Kalaban",
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
        slug="alimentaire-pay",
        is_active=True,
        sort_order=1,
    )
    brand = Brand.objects.create(
        name="Sigida Pay",
        slug="sigida-pay",
        is_active=True,
    )
    product = Product.objects.create(
        category=cat,
        brand=brand,
        name="Riz Pay",
        slug="riz-pay",
        sku="RIZ-PAY-001",
        short_description="Riz pour paiement",
        price="2500.00",
        stock=50,
        track_stock=True,
        is_active=True,
    )
    variant = ProductVariant.objects.create(
        product=product,
        name="1KG",
        sku="RIZ-PAY-001-V1",
        price="2500.00",
        stock=30,
        is_active=True,
    )

    order = Order.objects.create(
        user=user,
        number="SGS9001",
        status=Order.Status.PENDING,
        delivery_address=addr,
        delivery_zone=zone,
        subtotal="5000.00",
        delivery_fee=zone.fee,
        discount_amount="0.00",
        total="6500.00",
        currency="XOF",
    )

    return user, order


@pytest.mark.django_db
class TestPaymentsAPI:
    def setup_method(self):
        self.client = APIClient()

    def test_initialize_intouch_payment(self, order_for_payment):
        user, order = order_for_payment
        self.client.force_authenticate(user=user)

        url = reverse("payments-intouch-initialize")
        payload = {"order_id": order.id}

        resp = self.client.post(url, payload, format="json")
        assert resp.status_code == 201
        assert resp.data["transaction"]["order"]["id"] == order.id
        assert resp.data["transaction"]["provider"] == "intouch"
        assert "provider_payload" in resp.data

        assert PaymentTransaction.objects.count() == 1
        tx = PaymentTransaction.objects.first()
        assert tx.order == order
        assert tx.amount == order.total


    def test_intouch_webhook_accepts_payload(self, client, db):
        url = reverse("payments-intouch-webhook")
        payload = {
            "event_id": "DEMO-EVENT-001",
            "transactionId": "DEMO-TX-001",
            "status": "SUCCESS",
        }

        resp = client.post(url, payload, content_type="application/json")
        assert resp.status_code == 202
        assert resp.json()["status"] == "accepted"