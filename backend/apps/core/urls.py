from django.urls import path

from .views import AuditLogListAPIView, health, ready

urlpatterns = [
    path("health/", health, name="health"),
    path("ready/", ready, name="ready"),
    path("api/v1/audit-logs/", AuditLogListAPIView.as_view(), name="audit-logs"),
]