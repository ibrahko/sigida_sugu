import random
import uuid
from decimal import Decimal
from pathlib import Path

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.accounts.models import Address
from apps.cart.models import Cart, CartItem
from apps.catalog.models import Brand, Category, Product, ProductImage, ProductVariant
from apps.delivery.models import DeliveryZone
from apps.orders.models import Order, OrderItem
from apps.payments.models import PaymentTransaction


class Command(BaseCommand):
    help = "Seed advanced demo data for Sigida Sugu"

    @transaction.atomic
    def handle(self, *args, **options):
        User = get_user_model()

        self.stdout.write(self.style.WARNING("Starting advanced seed..."))

        media_root = Path(settings.MEDIA_ROOT)
        demo_dir = media_root / "demo" / "products"

        if not demo_dir.exists():
            self.stdout.write(
                self.style.ERROR(
                    f"Demo image directory not found: {demo_dir}. "
                    f"Run: python scripts/generate_demo_images.py"
                )
            )
            return

        admin_user, _ = User.objects.get_or_create(
            username="admin",
            defaults={
                "email": "admin@sigidasugu.com",
                "first_name": "Admin",
                "last_name": "Sigida",
                "phone": "+22370000001",
                "role": "admin",
                "is_staff": True,
                "is_superuser": True,
            },
        )
        admin_user.set_password("Admin12345!")
        admin_user.is_staff = True
        admin_user.is_superuser = True
        admin_user.role = "admin"
        admin_user.save()

        customers_data = [
            {
                "username": "clientdemo1",
                "email": "client1@sigidasugu.com",
                "first_name": "Awa",
                "last_name": "Traore",
                "phone": "+22370000011",
            },
            {
                "username": "clientdemo2",
                "email": "client2@sigidasugu.com",
                "first_name": "Moussa",
                "last_name": "Keita",
                "phone": "+22370000012",
            },
            {
                "username": "clientdemo3",
                "email": "client3@sigidasugu.com",
                "first_name": "Fatou",
                "last_name": "Coulibaly",
                "phone": "+22370000013",
            },
        ]

        customers = []
        for data in customers_data:
            user, _ = User.objects.get_or_create(
                username=data["username"],
                defaults={
                    "email": data["email"],
                    "first_name": data["first_name"],
                    "last_name": data["last_name"],
                    "phone": data["phone"],
                    "role": "customer",
                },
            )
            user.set_password("Client12345!")
            user.role = "customer"
            user.save()
            customers.append(user)

        address_defaults = [
            {
                "label": "Maison",
                "full_name": "Awa Traore",
                "phone": "+22370000011",
                "line1": "Hamdallaye ACI 2000",
                "city": "Bamako",
                "region": "Bamako",
                "country": "Mali",
                "landmark": "Près du rond-point",
            },
            {
                "label": "Bureau",
                "full_name": "Moussa Keita",
                "phone": "+22370000012",
                "line1": "Badalabougou Est",
                "city": "Bamako",
                "region": "Bamako",
                "country": "Mali",
                "landmark": "Immeuble bleu",
            },
            {
                "label": "Maison",
                "full_name": "Fatou Coulibaly",
                "phone": "+22370000013",
                "line1": "Kalaban Coura",
                "city": "Bamako",
                "region": "Bamako",
                "country": "Mali",
                "landmark": "Près du marché",
            },
        ]

        customer_addresses = []
        for idx, user in enumerate(customers):
            address, _ = Address.objects.get_or_create(
                user=user,
                label=address_defaults[idx]["label"],
                defaults={
                    "full_name": address_defaults[idx]["full_name"],
                    "phone": address_defaults[idx]["phone"],
                    "line1": address_defaults[idx]["line1"],
                    "line2": "",
                    "city": address_defaults[idx]["city"],
                    "region": address_defaults[idx]["region"],
                    "country": address_defaults[idx]["country"],
                    "postal_code": "",
                    "landmark": address_defaults[idx]["landmark"],
                    "is_default": True,
                },
            )
            customer_addresses.append(address)

        zones = []
        for zone_data in [
            {"name": "Bamako", "code": "BKO", "fee": Decimal("1500.00"), "estimated_min_days": 1, "estimated_max_days": 2},
            {"name": "Kati", "code": "KATI", "fee": Decimal("2500.00"), "estimated_min_days": 1, "estimated_max_days": 3},
            {"name": "Sikasso", "code": "SIK", "fee": Decimal("4000.00"), "estimated_min_days": 2, "estimated_max_days": 4},
            {"name": "Segou", "code": "SEG", "fee": Decimal("3500.00"), "estimated_min_days": 2, "estimated_max_days": 4},
        ]:
            zone, _ = DeliveryZone.objects.get_or_create(
                code=zone_data["code"],
                defaults={**zone_data, "is_active": True},
            )
            zones.append(zone)

        categories_data = [
            {"name": "Alimentaire", "slug": "alimentaire", "description": "Produits alimentaires"},
            {"name": "Boissons", "slug": "boissons", "description": "Boissons du quotidien"},
            {"name": "Maison", "slug": "maison", "description": "Articles pour la maison"},
            {"name": "Électroménager", "slug": "electromenager", "description": "Petits appareils et accessoires"},
            {"name": "High-Tech", "slug": "high-tech", "description": "Téléphones et accessoires"},
        ]

        categories = {}
        for idx, cat_data in enumerate(categories_data, start=1):
            category, _ = Category.objects.get_or_create(
                slug=cat_data["slug"],
                defaults={
                    "name": cat_data["name"],
                    "description": cat_data["description"],
                    "is_active": True,
                    "sort_order": idx,
                },
            )
            categories[cat_data["slug"]] = category

        brands_data = [
            {"name": "Sigida Local", "slug": "sigida-local"},
            {"name": "Mali House", "slug": "mali-house"},
            {"name": "Tech One", "slug": "tech-one"},
            {"name": "Daily Home", "slug": "daily-home"},
            {"name": "Fresh Market", "slug": "fresh-market"},
        ]

        brands = {}
        for brand_data in brands_data:
            brand, _ = Brand.objects.get_or_create(
                slug=brand_data["slug"],
                defaults={"name": brand_data["name"], "is_active": True},
            )
            brands[brand_data["slug"]] = brand

        products_data = [
            {
                "name": "Riz 25KG Premium",
                "slug": "riz-25kg-premium",
                "sku": "RIZ-25KG-001",
                "category": "alimentaire",
                "brand": "sigida-local",
                "price": Decimal("18500.00"),
                "compare_at_price": Decimal("20000.00"),
                "cost_price": Decimal("16000.00"),
                "stock": 50,
                "weight": Decimal("25.00"),
                "featured": True,
                "short_description": "Sac de riz premium 25KG",
                "description": "Riz premium adapté aux besoins des familles et commerces.",
                "variants": [("25KG", "RIZ-25KG-001-V1", Decimal("18500.00"), 35)],
            },
            {
                "name": "Huile 20L",
                "slug": "huile-20l",
                "sku": "HUILE-20L-001",
                "category": "alimentaire",
                "brand": "fresh-market",
                "price": Decimal("24500.00"),
                "compare_at_price": Decimal("26000.00"),
                "cost_price": Decimal("22000.00"),
                "stock": 25,
                "weight": Decimal("20.00"),
                "featured": True,
                "short_description": "Bidon d'huile 20 litres",
                "description": "Huile alimentaire pour usage domestique et commercial.",
                "variants": [("20L", "HUILE-20L-001-V1", Decimal("24500.00"), 20)],
            },
            {
                "name": "Sucre 5KG",
                "slug": "sucre-5kg",
                "sku": "SUCRE-5KG-001",
                "category": "alimentaire",
                "brand": "fresh-market",
                "price": Decimal("4750.00"),
                "compare_at_price": Decimal("5000.00"),
                "cost_price": Decimal("4200.00"),
                "stock": 70,
                "weight": Decimal("5.00"),
                "featured": True,
                "short_description": "Sucre blanc 5KG",
                "description": "Sac de sucre blanc pour consommation familiale.",
                "variants": [("5KG", "SUCRE-5KG-001-V1", Decimal("4750.00"), 55)],
            },
            {
                "name": "Lait en poudre",
                "slug": "lait-en-poudre",
                "sku": "LAIT-001",
                "category": "alimentaire",
                "brand": "fresh-market",
                "price": Decimal("3500.00"),
                "compare_at_price": Decimal("3800.00"),
                "cost_price": Decimal("3000.00"),
                "stock": 90,
                "weight": Decimal("1.00"),
                "featured": False,
                "short_description": "Lait en poudre 900g",
                "description": "Lait en poudre de qualité pour toute la famille.",
                "variants": [("900G", "LAIT-001-V1", Decimal("3500.00"), 70)],
            },
            {
                "name": "Savon ménage",
                "slug": "savon-menage",
                "sku": "SAVON-001",
                "category": "maison",
                "brand": "daily-home",
                "price": Decimal("750.00"),
                "compare_at_price": Decimal("900.00"),
                "cost_price": Decimal("500.00"),
                "stock": 200,
                "weight": Decimal("0.25"),
                "featured": False,
                "short_description": "Savon de ménage",
                "description": "Savon pratique pour le ménage quotidien.",
                "variants": [("Standard", "SAVON-001-V1", Decimal("750.00"), 160)],
            },
            {
                "name": "Seau plastique robuste",
                "slug": "seau-plastique-robuste",
                "sku": "SEAU-001",
                "category": "maison",
                "brand": "mali-house",
                "price": Decimal("3500.00"),
                "compare_at_price": Decimal("4000.00"),
                "cost_price": Decimal("2500.00"),
                "stock": 80,
                "weight": Decimal("1.50"),
                "featured": False,
                "short_description": "Seau solide pour la maison",
                "description": "Seau plastique multi-usage.",
                "variants": [("Standard", "SEAU-001-V1", Decimal("3500.00"), 80)],
            },
            {
                "name": "Balai ménager",
                "slug": "balai-menager",
                "sku": "BALAI-001",
                "category": "maison",
                "brand": "daily-home",
                "price": Decimal("2200.00"),
                "compare_at_price": Decimal("2500.00"),
                "cost_price": Decimal("1600.00"),
                "stock": 65,
                "weight": Decimal("1.20"),
                "featured": False,
                "short_description": "Balai ménager durable",
                "description": "Balai résistant pour usage quotidien.",
                "variants": [("Standard", "BALAI-001-V1", Decimal("2200.00"), 60)],
            },
            {
                "name": "Casserole inox",
                "slug": "casserole-inox",
                "sku": "CASS-001",
                "category": "maison",
                "brand": "mali-house",
                "price": Decimal("9500.00"),
                "compare_at_price": Decimal("10500.00"),
                "cost_price": Decimal("7000.00"),
                "stock": 30,
                "weight": Decimal("2.30"),
                "featured": True,
                "short_description": "Casserole inox durable",
                "description": "Casserole inox pour cuisine domestique.",
                "variants": [("Moyenne", "CASS-001-V1", Decimal("9500.00"), 22)],
            },
            {
                "name": "Ventilateur 18P",
                "slug": "ventilateur-18p",
                "sku": "VENT-001",
                "category": "electromenager",
                "brand": "mali-house",
                "price": Decimal("28500.00"),
                "compare_at_price": Decimal("30000.00"),
                "cost_price": Decimal("24000.00"),
                "stock": 18,
                "weight": Decimal("6.00"),
                "featured": True,
                "short_description": "Ventilateur 18 pouces",
                "description": "Ventilateur puissant pour maison et bureau.",
                "variants": [("18P", "VENT-001-V1", Decimal("28500.00"), 15)],
            },
            {
                "name": "Ampoule LED 12W",
                "slug": "ampoule-led-12w",
                "sku": "AMP-001",
                "category": "electromenager",
                "brand": "daily-home",
                "price": Decimal("1200.00"),
                "compare_at_price": Decimal("1500.00"),
                "cost_price": Decimal("800.00"),
                "stock": 150,
                "weight": Decimal("0.10"),
                "featured": False,
                "short_description": "Ampoule LED économique",
                "description": "Ampoule LED 12W à faible consommation.",
                "variants": [("12W", "AMP-001-V1", Decimal("1200.00"), 120)],
            },
            {
                "name": "Eau minérale pack",
                "slug": "eau-minerale-pack",
                "sku": "EAU-001",
                "category": "boissons",
                "brand": "fresh-market",
                "price": Decimal("3000.00"),
                "compare_at_price": Decimal("3300.00"),
                "cost_price": Decimal("2400.00"),
                "stock": 100,
                "weight": Decimal("9.00"),
                "featured": False,
                "short_description": "Pack d'eau minérale",
                "description": "Eau minérale en pack pour maison et événements.",
                "variants": [("Pack 6", "EAU-001-V1", Decimal("3000.00"), 80)],
            },
            {
                "name": "Jus Ananas",
                "slug": "jus-ananas",
                "sku": "JUS-001",
                "category": "boissons",
                "brand": "fresh-market",
                "price": Decimal("1800.00"),
                "compare_at_price": Decimal("2000.00"),
                "cost_price": Decimal("1400.00"),
                "stock": 90,
                "weight": Decimal("1.00"),
                "featured": False,
                "short_description": "Jus d'ananas naturel",
                "description": "Boisson rafraîchissante goût ananas.",
                "variants": [("1L", "JUS-001-V1", Decimal("1800.00"), 75)],
            },
            {
                "name": "Tomate concentrée",
                "slug": "tomate-concentree",
                "sku": "TOM-001",
                "category": "alimentaire",
                "brand": "sigida-local",
                "price": Decimal("950.00"),
                "compare_at_price": Decimal("1100.00"),
                "cost_price": Decimal("700.00"),
                "stock": 140,
                "weight": Decimal("0.20"),
                "featured": False,
                "short_description": "Tomate concentrée",
                "description": "Tomate concentrée pour cuisine quotidienne.",
                "variants": [("Boîte", "TOM-001-V1", Decimal("950.00"), 110)],
            },
            {
                "name": "Spaghetti 500G",
                "slug": "spaghetti-500g",
                "sku": "SPAG-001",
                "category": "alimentaire",
                "brand": "fresh-market",
                "price": Decimal("850.00"),
                "compare_at_price": Decimal("1000.00"),
                "cost_price": Decimal("600.00"),
                "stock": 160,
                "weight": Decimal("0.50"),
                "featured": False,
                "short_description": "Spaghetti 500g",
                "description": "Pâtes alimentaires pour repas rapides.",
                "variants": [("500G", "SPAG-001-V1", Decimal("850.00"), 130)],
            },
            {
                "name": "Farine 1KG",
                "slug": "farine-1kg",
                "sku": "FAR-001",
                "category": "alimentaire",
                "brand": "sigida-local",
                "price": Decimal("900.00"),
                "compare_at_price": Decimal("1000.00"),
                "cost_price": Decimal("650.00"),
                "stock": 120,
                "weight": Decimal("1.00"),
                "featured": False,
                "short_description": "Farine de qualité 1KG",
                "description": "Farine pour cuisine et pâtisserie.",
                "variants": [("1KG", "FAR-001-V1", Decimal("900.00"), 100)],
            },
            {
                "name": "Thé vert",
                "slug": "the-vert",
                "sku": "THE-001",
                "category": "boissons",
                "brand": "sigida-local",
                "price": Decimal("1250.00"),
                "compare_at_price": Decimal("1500.00"),
                "cost_price": Decimal("850.00"),
                "stock": 95,
                "weight": Decimal("0.25"),
                "featured": False,
                "short_description": "Thé vert en sachets",
                "description": "Thé vert de qualité pour consommation quotidienne.",
                "variants": [("Boîte", "THE-001-V1", Decimal("1250.00"), 80)],
            },
            {
                "name": "Téléphone Smart X1",
                "slug": "telephone-smart-x1",
                "sku": "TEL-001",
                "category": "high-tech",
                "brand": "tech-one",
                "price": Decimal("85000.00"),
                "compare_at_price": Decimal("92000.00"),
                "cost_price": Decimal("76000.00"),
                "stock": 12,
                "weight": Decimal("0.30"),
                "featured": True,
                "short_description": "Smartphone entrée de gamme",
                "description": "Téléphone intelligent pour usage quotidien.",
                "variants": [("64GB", "TEL-001-V1", Decimal("85000.00"), 8)],
            },
            {
                "name": "Écouteurs Bluetooth",
                "slug": "ecouteurs-bluetooth",
                "sku": "ECO-001",
                "category": "high-tech",
                "brand": "tech-one",
                "price": Decimal("12000.00"),
                "compare_at_price": Decimal("14000.00"),
                "cost_price": Decimal("9000.00"),
                "stock": 40,
                "weight": Decimal("0.15"),
                "featured": True,
                "short_description": "Écouteurs sans fil",
                "description": "Écouteurs Bluetooth compacts.",
                "variants": [("Standard", "ECO-001-V1", Decimal("12000.00"), 35)],
            },
            {
                "name": "Chargeur rapide",
                "slug": "chargeur-rapide",
                "sku": "CHG-001",
                "category": "high-tech",
                "brand": "tech-one",
                "price": Decimal("6500.00"),
                "compare_at_price": Decimal("7500.00"),
                "cost_price": Decimal("4800.00"),
                "stock": 55,
                "weight": Decimal("0.20"),
                "featured": False,
                "short_description": "Chargeur rapide USB",
                "description": "Chargeur rapide compatible multi-appareils.",
                "variants": [("20W", "CHG-001-V1", Decimal("6500.00"), 45)],
            },
            {
                "name": "Powerbank 10000mAh",
                "slug": "powerbank-10000mah",
                "sku": "PWB-001",
                "category": "high-tech",
                "brand": "tech-one",
                "price": Decimal("15000.00"),
                "compare_at_price": Decimal("17000.00"),
                "cost_price": Decimal("12000.00"),
                "stock": 28,
                "weight": Decimal("0.40"),
                "featured": True,
                "short_description": "Batterie externe 10000mAh",
                "description": "Powerbank pratique pour téléphone et accessoires.",
                "variants": [("10000mAh", "PWB-001-V1", Decimal("15000.00"), 25)],
            },
        ]

        created_products = []

        for item in products_data:
            product, _ = Product.objects.get_or_create(
                sku=item["sku"],
                defaults={
                    "category": categories[item["category"]],
                    "brand": brands[item["brand"]],
                    "name": item["name"],
                    "slug": item["slug"],
                    "short_description": item["short_description"],
                    "description": item["description"],
                    "price": item["price"],
                    "compare_at_price": item["compare_at_price"],
                    "cost_price": item["cost_price"],
                    "stock": item["stock"],
                    "track_stock": True,
                    "is_active": True,
                    "is_featured": item["featured"],
                    "weight": item["weight"],
                    "meta_title": item["name"],
                    "meta_description": f"{item['name']} disponible sur Sigida Sugu",
                },
            )

            image_relative_path = f"demo/products/{item['slug']}.svg"
            ProductImage.objects.get_or_create(
                product=product,
                alt_text=item["name"],
                defaults={
                    "image": image_relative_path,
                    "sort_order": 1,
                    "is_primary": True,
                },
            )

            for variant_name, variant_sku, variant_price, variant_stock in item["variants"]:
                ProductVariant.objects.get_or_create(
                    sku=variant_sku,
                    defaults={
                        "product": product,
                        "name": variant_name,
                        "price": variant_price,
                        "stock": variant_stock,
                        "is_active": True,
                    },
                )

            created_products.append(product)

        for user in customers:
            cart, _ = Cart.objects.get_or_create(user=user)
            sample_products = random.sample(created_products, 3)
            for product in sample_products:
                variant = product.variants.first()
                CartItem.objects.get_or_create(
                    cart=cart,
                    product=product,
                    variant=variant,
                    defaults={
                        "quantity": random.randint(1, 3),
                    },
                )

        order_statuses = [
            Order.Status.PENDING,
            Order.Status.PAID,
            Order.Status.PREPARING,
            Order.Status.SHIPPED,
            Order.Status.DELIVERED,
            Order.Status.CANCELLED,
        ]

        for i in range(6):
            user = customers[i % len(customers)]
            address = customer_addresses[i % len(customer_addresses)]
            zone = zones[i % len(zones)]
            selected_products = random.sample(created_products, 2)

            order_number = f"SGS{1000 + i}"

            order, created = Order.objects.get_or_create(
                number=order_number,
                defaults={
                    "user": user,
                    "status": order_statuses[i],
                    "delivery_address": address,
                    "delivery_zone": zone,
                    "subtotal": Decimal("0.00"),
                    "delivery_fee": zone.fee,
                    "discount_amount": Decimal("0.00"),
                    "total": Decimal("0.00"),
                    "currency": "XOF",
                    "notes": "Commande de démonstration",
                },
            )

            if created:
                subtotal = Decimal("0.00")
                for product in selected_products:
                    variant = product.variants.first()
                    quantity = random.randint(1, 2)
                    unit_price = variant.price if variant else product.price
                    line_total = unit_price * quantity
                    subtotal += line_total

                    OrderItem.objects.create(
                        order=order,
                        product=product,
                        variant=variant,
                        product_name=product.name,
                        variant_name=variant.name if variant else "",
                        sku=variant.sku if variant else product.sku,
                        unit_price=unit_price,
                        quantity=quantity,
                        line_total=line_total,
                    )

                order.subtotal = subtotal
                order.total = subtotal + order.delivery_fee - order.discount_amount
                order.save(update_fields=["subtotal", "total", "updated_at"])

                payment_status = (
                    PaymentTransaction.Status.SUCCESS
                    if order.status in [Order.Status.PAID, Order.Status.PREPARING, Order.Status.SHIPPED, Order.Status.DELIVERED]
                    else PaymentTransaction.Status.PENDING
                )

                PaymentTransaction.objects.create(
                    order=order,
                    provider=PaymentTransaction.Provider.INTOUCH if i % 2 == 0 else PaymentTransaction.Provider.COD,
                    status=payment_status,
                    amount=order.total,
                    currency=order.currency,
                    internal_reference=uuid.uuid4().hex,
                    provider_reference=f"DEMO-{order.number}",
                    raw_request={"demo": True, "order_number": order.number},
                    raw_response={"demo": True, "status": payment_status},
                )

        self.stdout.write(self.style.SUCCESS("Advanced seed completed successfully."))
        self.stdout.write(self.style.SUCCESS("Admin: admin / Admin12345!"))
        self.stdout.write(self.style.SUCCESS("Clients: clientdemo1, clientdemo2, clientdemo3 / Client12345!"))
        self.stdout.write(self.style.SUCCESS(f"Products seeded: {len(products_data)}"))
        self.stdout.write(self.style.SUCCESS("Orders seeded: 6"))