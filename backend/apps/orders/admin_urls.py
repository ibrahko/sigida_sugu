from django.urls import path
from .admin_views import AdminOrderListView, AdminOrderDetailView

urlpatterns = [
    path("", AdminOrderListView.as_view(), name="admin-orders-list"),
    path("<int:pk>/", AdminOrderDetailView.as_view(), name="admin-orders-detail"),
]
