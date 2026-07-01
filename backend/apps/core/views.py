from django.db import connections
from django.http import JsonResponse
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import AuditLog
from .serializers import AuditLogSerializer


def health(request):
    return JsonResponse({"status": "ok", "service": "sigida-sugu"})


def ready(request):
    try:
        connections["default"].cursor()
        return JsonResponse({"status": "ready"})
    except Exception:
        return JsonResponse({"status": "not_ready"}, status=503)


class HealthAPIView(APIView):
    permission_classes = []
    authentication_classes = []

    def get(self, request):
        return Response({"status": "ok", "version": "v1"})


class AuditLogListAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        queryset = AuditLog.objects.all().order_by("-created_at")[:100]
        serializer = AuditLogSerializer(queryset, many=True)
        return Response(serializer.data)