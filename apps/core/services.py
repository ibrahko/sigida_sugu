from .models import AuditLog


class AuditService:
    @staticmethod
    def log(*, action, entity_type, entity_id, actor_id=None, metadata=None):
        return AuditLog.objects.create(
            action=action,
            entity_type=entity_type,
            entity_id=str(entity_id),
            actor_id=actor_id,
            metadata=metadata or {},
        )