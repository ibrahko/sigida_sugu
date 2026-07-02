from django.urls import path
from .admin_views import AdminUserListCreateView, AdminUserDetailView, AdminUserInviteView

urlpatterns = [
    path("", AdminUserListCreateView.as_view(), name="admin-users-list"),
    path("invite/", AdminUserInviteView.as_view(), name="admin-users-invite"),
    path("<int:pk>/", AdminUserDetailView.as_view(), name="admin-users-detail"),
]
