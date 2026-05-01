from rest_framework import generics, permissions
from rest_framework.response import Response

from .models import Order
from .permissions import IsOrderOwnerOrAdmin
from .serializers import OrderCreateSerializer, OrderSerializer


class OrderListCreateAPIView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = (
            Order.objects.filter(user=self.request.user)
            .select_related("user", "delivery_address", "delivery_zone")
            .prefetch_related("items__product__images")
            .order_by("-created_at")
        )
        return queryset

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


class OrderDetailAPIView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated, IsOrderOwnerOrAdmin]

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