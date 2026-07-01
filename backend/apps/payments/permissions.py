from rest_framework.permissions import BasePermission


class IsPaymentOwnerOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user and request.user.is_staff:
            return True
        return obj.order.user_id == request.user.id