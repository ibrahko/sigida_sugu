from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.catalog.models import Product, ProductVariant
from .models import Cart, CartItem
from .permissions import IsCartOwner
from .serializers import CartSerializer
from .services import CartService


class MyCartAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        cart = CartService.get_or_create_cart(request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)


class AddToCartAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        product_id = request.data.get("product_id")
        variant_id = request.data.get("variant_id")
        quantity = int(request.data.get("quantity", 1))

        product = Product.objects.get(id=product_id, is_active=True)
        variant = None
        if variant_id:
            variant = ProductVariant.objects.get(id=variant_id, product=product, is_active=True)

        item = CartService.add_item(
            user=request.user,
            product=product,
            quantity=quantity,
            variant=variant,
        )
        cart = item.cart
        serializer = CartSerializer(cart)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CartItemDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CartSerializer
    permission_classes = [permissions.IsAuthenticated, IsCartOwner]

    def get_queryset(self):
        return CartItem.objects.filter(cart__user=self.request.user)

    def get(self, request, *args, **kwargs):
        item = self.get_object()
        self.check_object_permissions(request, item)
        serializer = CartSerializer(item.cart)
        return Response(serializer.data)

    def patch(self, request, *args, **kwargs):
        item = self.get_object()
        self.check_object_permissions(request, item)
        quantity = int(request.data.get("quantity", item.quantity))
        item.quantity = max(1, quantity)
        item.save(update_fields=["quantity", "updated_at"])
        return Response(CartSerializer(item.cart).data)

    def delete(self, request, *args, **kwargs):
        item = self.get_object()
        self.check_object_permissions(request, item)
        cart = item.cart
        item.delete()
        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)