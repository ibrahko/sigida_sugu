from django.contrib import admin
from .models import DeliveryZone


@admin.register(DeliveryZone)
class DeliveryZoneAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "fee", "estimated_min_days", "estimated_max_days", "is_active")
    list_filter = ("is_active",)
    search_fields = ("name", "code")