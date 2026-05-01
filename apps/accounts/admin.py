from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from .models import Address, User


class AddressInline(admin.TabularInline):
    model = Address
    extra = 0


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    list_display = (
        "username",
        "email",
        "phone",
        "role",
        "is_active",
        "is_staff",
        "created_at",
    )
    list_filter = ("role", "is_active", "is_staff", "is_superuser")
    search_fields = ("username", "email", "first_name", "last_name", "phone")
    inlines = [AddressInline]

    fieldsets = DjangoUserAdmin.fieldsets + (
        (
            "Marketplace",
            {
                "fields": (
                    "phone",
                    "role",
                    "is_phone_verified",
                    "is_email_verified",
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )
    readonly_fields = ("created_at", "updated_at")


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ("user", "label", "city", "country", "is_default", "created_at")
    list_filter = ("city", "country", "is_default")
    search_fields = ("user__username", "full_name", "phone", "line1")