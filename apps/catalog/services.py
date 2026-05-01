from django.db.models import Q
from .models import Product


class ProductQueryService:
    @staticmethod
    def get_public_products(query=None, category_slug=None, brand_slug=None):
        qs = Product.objects.filter(is_active=True).select_related("category", "brand").prefetch_related("images", "variants")
        if query:
            qs = qs.filter(Q(name__icontains=query) | Q(sku__icontains=query))
        if category_slug:
            qs = qs.filter(category__slug=category_slug)
        if brand_slug:
            qs = qs.filter(brand__slug=brand_slug)
        return qs