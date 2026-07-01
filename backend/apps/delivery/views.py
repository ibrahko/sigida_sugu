from rest_framework import generics, permissions

from .models import DeliveryZone
from .permissions import IsAdminOrReadOnly
from .serializers import DeliveryZoneSerializer


class DeliveryZoneListCreateAPIView(generics.ListCreateAPIView):
    queryset = DeliveryZone.objects.filter(is_active=True).order_by("name")
    serializer_class = DeliveryZoneSerializer
    permission_classes = [IsAdminOrReadOnly]


class DeliveryZoneDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = DeliveryZone.objects.all().order_by("name")
    serializer_class = DeliveryZoneSerializer
    permission_classes = [permissions.IsAdminUser]