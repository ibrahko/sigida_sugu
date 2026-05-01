from rest_framework.permissions import BasePermission


class IsCartOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user and request.user.is_staff:
            return True
        cart = getattr(obj, "cart", None)
        if cart is not None:
            return cart.user_id == request.user.id
        return getattr(obj, "user_id", None) == request.user.id