import logging
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.conf import settings
from django.db.models import Sum
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import Address
from .permissions import IsOwnerOrAdmin
from .serializers import AddressSerializer, RegisterSerializer, UserDetailSerializer, LoginSerializer
from apps.orders.models import Order

User = get_user_model()
logger = logging.getLogger(__name__)




class LoginAPIView(TokenObtainPairView):
    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

class RegisterAPIView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def perform_create(self, serializer):
        user = serializer.save()
        if user.email:
            from apps.notifications.tasks import send_welcome_email, dispatch
            dispatch(send_welcome_email, user.id)


class MeAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserDetailSerializer(request.user)
        return Response(serializer.data)


class AddressListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user).order_by("-is_default", "-created_at")

    def perform_create(self, serializer):
        serializer.save()


class AddressDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def get_object(self):
        obj = super().get_object()
        self.check_object_permissions(self.request, obj)
        return obj


class PasswordResetRequestView(APIView):
    """POST /accounts/password-reset/ — envoie un email avec le lien de reset."""
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        email = request.data.get("email", "").strip().lower()
        # Toujours répondre 200 pour ne pas révéler si l'email existe
        try:
            user = User.objects.get(email__iexact=email)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:5173")
            reset_url = f"{frontend_url}/reinitialiser-mot-de-passe/{uid}/{token}/"
            send_mail(
                subject="Réinitialisation de ton mot de passe Sigida Sugu",
                message=(
                    f"Bonjour {user.first_name or user.username},\n\n"
                    f"Clique sur ce lien pour réinitialiser ton mot de passe :\n{reset_url}\n\n"
                    f"Ce lien expire dans 24h. Si tu n'as pas fait cette demande, ignore cet email.\n\n"
                    f"— L'équipe Sigida Sugu"
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True,
            )
            logger.info("Password reset sent to %s", email)
        except User.DoesNotExist:
            pass  # Ne pas révéler que l'email n'existe pas

        return Response({"detail": "Si cet email est associé à un compte, un lien a été envoyé."})


class PasswordResetConfirmView(APIView):
    """POST /accounts/password-reset/confirm/ — valide le token et change le mot de passe."""
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        uid = request.data.get("uid", "")
        token = request.data.get("token", "")
        new_password = request.data.get("new_password", "")

        if not uid or not token or not new_password:
            return Response({"detail": "uid, token et new_password sont requis."}, status=400)

        if len(new_password) < 8:
            return Response({"new_password": ["Minimum 8 caractères."]}, status=400)

        try:
            pk = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=pk)
        except (User.DoesNotExist, ValueError, TypeError):
            return Response({"detail": "Lien invalide."}, status=400)

        if not default_token_generator.check_token(user, token):
            return Response({"detail": "Lien expiré ou invalide."}, status=400)

        user.set_password(new_password)
        user.save(update_fields=["password"])
        return Response({"detail": "Mot de passe mis à jour avec succès."})


class AccountSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        orders = Order.objects.filter(user=user)
        last_order = orders.order_by('-created_at').first()
        total_spent = orders.aggregate(total=Sum('total'))['total'] or 0

        return Response({
            "orders_count": orders.count(),
            "total_spent": total_spent,
            "last_order": {
                "id": last_order.id,
                "number": last_order.number,
                "status": last_order.status,
                "total": last_order.total,
                "currency": last_order.currency,
                "created_at": last_order.created_at,
            } if last_order else None,
        })