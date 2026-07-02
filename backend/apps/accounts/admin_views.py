from django.contrib.auth import get_user_model
from django.db.models import Count
from rest_framework import generics, filters, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsAdminRole
from .admin_serializers import (
    AdminUserListSerializer,
    AdminUserCreateSerializer,
    AdminUserInviteSerializer,
    AdminUserUpdateSerializer,
)

User = get_user_model()


class AdminUserListCreateView(generics.ListCreateAPIView):
    """
    GET  → liste tous les utilisateurs (admin)
    POST → crée un utilisateur (admin)
    """
    permission_classes = [IsAdminRole]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["username", "email", "first_name", "last_name", "phone"]
    ordering_fields = ["date_joined", "username", "role"]
    ordering = ["-date_joined"]

    def get_queryset(self):
        qs = User.objects.annotate(orders_count=Count("order"))
        role = self.request.query_params.get("role")
        if role:
            qs = qs.filter(role=role)
        return qs

    def get_serializer_class(self):
        return AdminUserCreateSerializer if self.request.method == "POST" else AdminUserListSerializer


class AdminUserInviteView(APIView):
    """
    POST → crée un compte sans mot de passe et envoie les identifiants par email.
    Accessible admin uniquement.
    """
    permission_classes = [IsAdminRole]

    def post(self, request):
        serializer = AdminUserInviteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Envoyer l'email d'invitation avec le mot de passe en clair
        plain_password = getattr(user, "_plain_password", None)
        if plain_password and user.email:
            try:
                from apps.notifications.tasks import send_invitation_email, dispatch
                dispatch(send_invitation_email, user.id, plain_password)
            except Exception:
                pass

        return Response(
            AdminUserListSerializer(user).data,
            status=status.HTTP_201_CREATED,
        )


class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    → détail utilisateur (admin)
    PATCH  → modifier rôle / infos (admin)
    DELETE → désactiver compte (admin) — soft delete via is_active
    """
    permission_classes = [IsAdminRole]
    http_method_names = ["get", "patch", "delete"]

    def get_queryset(self):
        return User.objects.annotate(orders_count=Count("order"))

    def get_serializer_class(self):
        return AdminUserUpdateSerializer if self.request.method == "PATCH" else AdminUserListSerializer

    def destroy(self, request, *args, **kwargs):
        """Soft delete : désactiver le compte au lieu de supprimer."""
        instance = self.get_object()
        instance.is_active = False
        instance.save(update_fields=["is_active"])
        return Response(status=status.HTTP_204_NO_CONTENT)
