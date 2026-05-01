from django.contrib.auth.models import AbstractUser
from django.db import models
from apps.common.models import TimeStampedModel


class User(AbstractUser, TimeStampedModel):
    class Role(models.TextChoices):
        CUSTOMER = "customer", "Customer"
        STAFF = "staff", "Staff"
        ADMIN = "admin", "Admin"

    phone = models.CharField(max_length=32, blank=True, db_index=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.CUSTOMER, db_index=True)
    is_phone_verified = models.BooleanField(default=False)
    is_email_verified = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.get_full_name() or self.username


class Address(TimeStampedModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="addresses")
    label = models.CharField(max_length=120)
    full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=32)
    line1 = models.CharField(max_length=255)
    line2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=120, default="Bamako")
    region = models.CharField(max_length=120, blank=True)
    country = models.CharField(max_length=120, default="Mali")
    postal_code = models.CharField(max_length=30, blank=True)
    landmark = models.CharField(max_length=255, blank=True)
    is_default = models.BooleanField(default=False, db_index=True)

    class Meta:
        ordering = ["-is_default", "-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "label"],
                name="unique_user_address_label",
            )
        ]

    def __str__(self):
        return f"{self.user} - {self.label}"