"""Vues admin commandes — staff et admin."""
from rest_framework import generics, filters
from apps.accounts.permissions import IsStaffOrAdmin
from .models import Order
from .serializers import OrderSerializer


class AdminOrderListView(generics.ListAPIView):
    """Toutes les commandes — staff ou admin."""
    permission_classes = [IsStaffOrAdmin]
    serializer_class = OrderSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["number", "user__email", "user__first_name", "user__last_name"]
    ordering_fields = ["created_at", "total", "status"]
    ordering = ["-created_at"]

    def get_queryset(self):
        qs = (
            Order.objects
            .select_related("user", "delivery_address", "delivery_zone")
            .prefetch_related("items__product__images")
        )
        status_filter = self.request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs


class AdminOrderDetailView(generics.RetrieveUpdateAPIView):
    """Détail et mise à jour statut — staff ou admin."""
    permission_classes = [IsStaffOrAdmin]
    serializer_class = OrderSerializer

    def get_queryset(self):
        return (
            Order.objects
            .select_related("user", "delivery_address", "delivery_zone")
            .prefetch_related("items__product__images")
        )

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        old_status = instance.status
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        instance.refresh_from_db()
        if instance.status != old_status:
            try:
                from apps.notifications.tasks import send_order_status_email, dispatch
                dispatch(send_order_status_email, instance.id)
            except Exception:
                pass
        from rest_framework.response import Response
        return Response(serializer.data)
