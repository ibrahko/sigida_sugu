"""
Vue de bootstrap — crée le premier superadmin.
Protégée par une clé secrète définie dans les variables d'environnement.
N'est accessible que si SETUP_SECRET_KEY est défini côté serveur.
"""
import os
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, serializers

User = get_user_model()


class SetupAdminSerializer(serializers.Serializer):
    secret        = serializers.CharField()
    username      = serializers.CharField(min_length=3)
    email         = serializers.EmailField()
    first_name    = serializers.CharField(required=False, default="")
    last_name     = serializers.CharField(required=False, default="")
    password      = serializers.CharField(min_length=8)

    def validate_secret(self, value):
        expected = os.getenv("SETUP_SECRET_KEY", "")
        if not expected:
            raise serializers.ValidationError(
                "La fonctionnalité de setup est désactivée sur ce serveur."
            )
        if value != expected:
            raise serializers.ValidationError("Clé secrète incorrecte.")
        return value

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Ce nom d'utilisateur est déjà pris.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Cet email est déjà utilisé.")
        return value.lower()


class SetupAdminView(APIView):
    """
    POST /api/v1/setup/
    Crée un superadmin. Requiert la clé secrète SETUP_SECRET_KEY.
    Aucune authentification requise (c'est le but : bootstrapper le premier compte).
    """
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        # Désactivé si pas de clé définie
        if not os.getenv("SETUP_SECRET_KEY"):
            return Response(
                {"detail": "Setup désactivé."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = SetupAdminSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        d = serializer.validated_data

        user = User(
            username=d["username"],
            email=d["email"],
            first_name=d.get("first_name", ""),
            last_name=d.get("last_name", ""),
            role="admin",
            is_staff=True,
            is_superuser=True,
            is_active=True,
        )
        user.set_password(d["password"])
        user.save()

        return Response(
            {
                "detail": "Compte admin créé avec succès.",
                "username": user.username,
                "email": user.email,
                "role": user.role,
            },
            status=status.HTTP_201_CREATED,
        )

    def get(self, request):
        """Vérifie si le setup est disponible (sans exposer la clé)."""
        if not os.getenv("SETUP_SECRET_KEY"):
            return Response({"available": False})
        admin_exists = User.objects.filter(role="admin").exists()
        return Response({"available": True, "admin_exists": admin_exists})
