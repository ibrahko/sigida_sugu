from rest_framework import generics, permissions
from rest_framework.response import Response

from .models import Order
from .permissions import IsOrderOwnerOrAdmin
from .serializers import OrderCreateSerializer, OrderSerializer


class OrderListCreateAPIView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Order.objects.filter(user=self.request.user)
            .select_related("user", "delivery_address", "delivery_zone")
            .prefetch_related("items__product__images")
            .order_by("-created_at")
        )

    def get_serializer_class(self):
        if self.request.method == "POST":
            return OrderCreateSerializer
        return OrderSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        output = OrderSerializer(order, context={"request": request})
        return Response(output.data, status=201)


class OrderDetailAPIView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated, IsOrderOwnerOrAdmin]

    def get_serializer_class(self):
        return OrderSerializer

    def get_queryset(self):
        return (
            Order.objects.select_related("user", "delivery_address", "delivery_zone")
            .prefetch_related("items__product__images")
            .all()
        )

    def get_object(self):
        obj = super().get_object()
        self.check_object_permissions(self.request, obj)
        return obj

    def partial_update(self, request, *args, **kwargs):
        """Admin uniquement — mise à jour du statut avec envoi d'email."""
        if not request.user.is_staff:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Réservé aux administrateurs.")

        instance = self.get_object()
        old_status = instance.status
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        instance.refresh_from_db()

        # Envoyer un email si le statut a changé
        if instance.status != old_status:
            from apps.notifications.tasks import send_order_status_email, dispatch
            dispatch(send_order_status_email, instance.id)

        return Response(serializer.data)
