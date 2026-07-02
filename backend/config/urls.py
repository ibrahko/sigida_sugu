from django.contrib import admin
from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),

    path("", include("apps.core.urls")),
    path("api/v1/", include("apps.core.api_urls")),

    path("api/v1/accounts/", include("apps.accounts.urls")),
    path("api/v1/catalog/", include("apps.catalog.urls")),
    path("api/v1/cart/", include("apps.cart.urls")),
    path("api/v1/orders/", include("apps.orders.urls")),
    path("api/v1/payments/", include("apps.payments.urls")),
    path("api/v1/delivery/", include("apps.delivery.urls")),

    # ── Backoffice admin ──────────────────────────────────────────────────────
    path("api/v1/admin/catalog/", include("apps.catalog.admin_urls")),
    path("api/v1/admin/orders/", include("apps.orders.admin_urls")),
    path("api/v1/admin/users/", include("apps.accounts.admin_urls")),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)