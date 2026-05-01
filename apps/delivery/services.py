from .models import DeliveryZone


class DeliveryService:
    @staticmethod
    def get_zone_by_code(code):
        return DeliveryZone.objects.filter(code=code, is_active=True).first()