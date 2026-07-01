from rest_framework import serializers
from .models import DeliveryZone


class DeliveryZoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryZone
        fields = (
            "id",
            "name",
            "code",
            "fee",
            "estimated_min_days",
            "estimated_max_days",
            "is_active",
        )