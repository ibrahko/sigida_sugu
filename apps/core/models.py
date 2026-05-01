from django.db import models
from apps.common.models import TimeStampedModel


class AuditLog(TimeStampedModel):
    actor_id = models.PositiveBigIntegerField(blank=True, null=True, db_index=True)
    action = models.CharField(max_length=120, db_index=True)
    entity_type = models.CharField(max_length=120, db_index=True)
    entity_id = models.CharField(max_length=120, db_index=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.action} - {self.entity_type}"