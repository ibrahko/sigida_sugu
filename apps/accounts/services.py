from django.db import transaction
from .models import Address


class AddressService:
    @staticmethod
    @transaction.atomic
    def set_default_address(address):
        Address.objects.filter(user=address.user, is_default=True).exclude(pk=address.pk).update(is_default=False)
        address.is_default = True
        address.save(update_fields=["is_default", "updated_at"])
        return address