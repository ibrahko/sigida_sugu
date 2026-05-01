import uuid
from decimal import Decimal
from django.db import transaction
from apps.catalog.models import Product, ProductVariant
from .models import Order, OrderItem


class OrderService:
    @staticmethod
    @transaction.atomic
    def create_order(
        *,
        user,
        items,
        delivery_address=None,
        delivery_zone=None,
        delivery_fee=Decimal("0.00"),
        discount_amount=Decimal("0.00"),
        notes="",
    ):
        order = Order.objects.create(
            user=user,
            number=uuid.uuid4().hex[:12].upper(),
            delivery_address=delivery_address,
            delivery_zone=delivery_zone,
            delivery_fee=delivery_fee,
            discount_amount=discount_amount,
            total=Decimal("0.00"),
            subtotal=Decimal("0.00"),
            notes=notes,
        )

        subtotal = Decimal("0.00")

        for item in items:
            product = Product.objects.select_for_update().get(id=item["product_id"], is_active=True)
            variant = None
            variant_name = ""
            sku = product.sku
            unit_price = product.price

            if item.get("variant_id"):
                variant = ProductVariant.objects.select_for_update().get(
                    id=item["variant_id"],
                    product=product,
                    is_active=True,
                )
                variant_name = variant.name
                sku = variant.sku
                unit_price = variant.price

            quantity = int(item["quantity"])

            if product.track_stock:
                if variant:
                    if variant.stock < quantity:
                        raise ValueError(f"Stock insuffisant pour la variante {variant.name}")
                    variant.stock -= quantity
                    variant.save(update_fields=["stock", "updated_at"])
                else:
                    if product.stock < quantity:
                        raise ValueError(f"Stock insuffisant pour le produit {product.name}")
                    product.stock -= quantity
                    product.save(update_fields=["stock", "updated_at"])

            line_total = unit_price * quantity
            subtotal += line_total

            OrderItem.objects.create(
                order=order,
                product=product,
                variant=variant,
                product_name=product.name,
                variant_name=variant_name,
                sku=sku,
                unit_price=unit_price,
                quantity=quantity,
                line_total=line_total,
            )

        order.subtotal = subtotal
        order.total = subtotal + order.delivery_fee - order.discount_amount
        order.save(update_fields=["subtotal", "total", "updated_at"])
        return order