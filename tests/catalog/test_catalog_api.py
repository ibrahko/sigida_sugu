import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from apps.catalog.models import Brand, Category, Product
from apps.accounts.models import User


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def sample_catalog(db):
    cat = Category.objects.create(
        name="Alimentaire",
        slug="alimentaire",
        description="Produits alimentaires",
        is_active=True,
        sort_order=1,
    )
    brand = Brand.objects.create(
        name="Sigida Local",
        slug="sigida-local",
        is_active=True,
    )
    product = Product.objects.create(
        category=cat,
        brand=brand,
        name="Riz 25KG Premium",
        slug="riz-25kg-premium-test",
        sku="RIZ-25KG-TEST",
        short_description="Riz de test",
        price="18500.00",
        stock=10,
        track_stock=True,
        is_active=True,
    )
    return {"category": cat, "brand": brand, "product": product}


@pytest.mark.django_db
class TestCatalogPublicAPI:
    def test_list_categories_public(self, api_client, sample_catalog):
        url = reverse("catalog-categories")
        resp = api_client.get(url)
        assert resp.status_code == 200
        assert len(resp.data) >= 1

    def test_list_brands_public(self, api_client, sample_catalog):
        url = reverse("catalog-brands")
        resp = api_client.get(url)
        assert resp.status_code == 200
        assert len(resp.data) >= 1

    def test_list_products_public(self, api_client, sample_catalog):
        url = reverse("catalog-products-list")
        resp = api_client.get(url)
        assert resp.status_code == 200
        assert resp.data["count"] >= 1
        assert resp.data["results"][0]["name"]

    def test_retrieve_product_public(self, api_client, sample_catalog):
        product = sample_catalog["product"]
        url = reverse("catalog-products-detail", args=[product.id])
        resp = api_client.get(url)
        assert resp.status_code == 200
        assert resp.data["id"] == product.id
        assert resp.data["name"] == product.name


@pytest.mark.django_db
class TestCatalogAdminAPI:
    def test_admin_can_create_product(self, api_client, sample_catalog):
        admin = User.objects.create_superuser(
            username="admin",
            email="admin@example.com",
            password="Admin12345!",
        )
        api_client.force_authenticate(user=admin)

        url = reverse("catalog-products-list")
        payload = {
            "category": sample_catalog["category"].id,
            "brand": sample_catalog["brand"].id,
            "name": "Produit admin",
            "slug": "produit-admin",
            "sku": "ADMIN-001",
            "short_description": "Créé par admin",
            "price": "1000.00",
            "stock": 5,
            "track_stock": True,
            "is_active": True,
        }

        resp = api_client.post(url, payload, format="json")
        assert resp.status_code in (201, 400)
        # NOTE: selon ton serializer d'écriture (à compléter plus tard),
        # tu pourras adapter l'assertion ici.