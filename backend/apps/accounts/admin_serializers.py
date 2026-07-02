from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class AdminUserListSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    orders_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "phone",
            "role",
            "is_active",
            "is_staff",
            "date_joined",
            "orders_count",
        )

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username

    def get_orders_count(self, obj):
        return getattr(obj, "orders_count", 0)


class AdminUserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = (
            "username",
            "email",
            "first_name",
            "last_name",
            "phone",
            "role",
            "password",
            "is_active",
        )

    def create(self, validated_data):
        password = validated_data.pop("password")
        role = validated_data.get("role", "customer")
        # Sync is_staff avec le rôle
        validated_data["is_staff"] = role in ("staff", "admin")
        validated_data["is_superuser"] = role == "admin"
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class AdminUserInviteSerializer(serializers.ModelSerializer):
    """Crée un compte sans mot de passe — génère un mdp aléatoire et envoie un email d'invitation."""

    class Meta:
        model = User
        fields = (
            "username",
            "email",
            "first_name",
            "last_name",
            "phone",
            "role",
        )

    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError("L'email est obligatoire pour envoyer l'invitation.")
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Un compte avec cet email existe déjà.")
        return value.lower()

    def create(self, validated_data):
        import secrets
        import string

        role = validated_data.get("role", "customer")
        validated_data["is_staff"] = role in ("staff", "admin")
        validated_data["is_superuser"] = role == "admin"
        validated_data["is_active"] = True

        # Mot de passe aléatoire sécurisé
        alphabet = string.ascii_letters + string.digits + "!@#$%"
        password = "".join(secrets.choice(alphabet) for _ in range(14))

        user = User(**validated_data)
        user.set_password(password)
        user.save()

        # Stocker le mdp en clair temporairement pour l'email (pas persisté)
        user._plain_password = password
        return user


class AdminUserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "email",
            "first_name",
            "last_name",
            "phone",
            "role",
            "is_active",
        )

    def update(self, instance, validated_data):
        role = validated_data.get("role", instance.role)
        # Sync is_staff avec le rôle
        validated_data["is_staff"] = role in ("staff", "admin")
        validated_data["is_superuser"] = role == "admin"
        return super().update(instance, validated_data)
