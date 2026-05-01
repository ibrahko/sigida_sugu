from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models
from apps.common.models import TimeStampedModel
from apps.catalog.models import Product, ProductVariant


class Cart(TimeStampedModel):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="cart")

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return f"Cart - {self.user}"


class CartItem(TimeStampedModel):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="cart_items")
    variant = models.ForeignKey(ProductVariant, on_delete=models.SET_NULL, related_name="cart_items", blank=True, null=True)
    quantity = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(fields=["cart", "product", "variant"], name="unique_cart_product_variant")
        ]

    def __str__(self):
        return f"{self.cart.user} - {self.product.name}"