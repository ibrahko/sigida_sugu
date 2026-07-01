from django.db import transaction
from .models import Cart, CartItem


class CartService:
    @staticmethod
    def get_or_create_cart(user):
        cart, _ = Cart.objects.get_or_create(user=user)
        return cart

    @staticmethod
    @transaction.atomic
    def add_item(user, product, quantity=1, variant=None):
        cart = CartService.get_or_create_cart(user)

        # Vérification du stock avant ajout
        if product.track_stock:
            if variant:
                available = variant.stock
                label = f"variante « {variant.name} »"
            else:
                available = product.stock
                label = f"produit « {product.name} »"

            # Tenir compte des unités déjà dans le panier
            existing_qty = 0
            try:
                existing_item = CartItem.objects.get(cart=cart, product=product, variant=variant)
                existing_qty = existing_item.quantity
            except CartItem.DoesNotExist:
                pass

            if existing_qty + quantity > available:
                raise ValueError(
                    f"Stock insuffisant pour le {label}. "
                    f"Disponible : {available}, déjà au panier : {existing_qty}, demandé : {quantity}."
                )

        item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            variant=variant,
            defaults={"quantity": quantity},
        )
        if not created:
            item.quantity += quantity
            item.save(update_fields=["quantity", "updated_at"])
        return item