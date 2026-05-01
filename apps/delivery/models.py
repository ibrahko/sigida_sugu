from django.core.validators import MinValueValidator
from django.db import models
from apps.common.models import TimeStampedModel


class DeliveryZone(TimeStampedModel):
    name = models.CharField(max_length=120, unique=True)
    code = models.CharField(max_length=50, unique=True)
    fee = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    estimated_min_days = models.PositiveIntegerField(default=1)
    estimated_max_days = models.PositiveIntegerField(default=3)
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name