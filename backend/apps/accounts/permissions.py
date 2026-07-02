from rest_framework.permissions import BasePermission, SAFE_METHODS


# ── Helpers ───────────────────────────────────────────────────────────────────

def _role(user, *roles):
    return bool(user and user.is_authenticated and user.role in roles)


# ── Permissions publiques ─────────────────────────────────────────────────────

class IsOwnerOrAdmin(BasePermission):
    """Propriétaire de l'objet ou staff/admin."""

    def has_object_permission(self, request, view, obj):
        if _role(request.user, "staff", "admin"):
            return True
        return getattr(obj, "user_id", None) == request.user.id


class IsAdminOrReadOnly(BasePermission):
    """Lecture publique, écriture admin seulement."""

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return _role(request.user, "admin")


# ── Permissions backoffice ────────────────────────────────────────────────────

class IsStaffOrAdmin(BasePermission):
    """Staff ou admin — accès backoffice lecture + commandes."""

    def has_permission(self, request, view):
        return _role(request.user, "staff", "admin")


class IsAdminRole(BasePermission):
    """Admin uniquement — écriture catalogue, gestion utilisateurs."""

    def has_permission(self, request, view):
        return _role(request.user, "admin")


class IsCatalogAdmin(BasePermission):
    """
    Lecture catalogue → staff ou admin.
    Écriture catalogue → admin uniquement.
    """

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return _role(request.user, "staff", "admin")
        return _role(request.user, "admin")
