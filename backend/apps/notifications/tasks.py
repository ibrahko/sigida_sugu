import logging
from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings

logger = logging.getLogger(__name__)


def _send(subject: str, text: str, html: str, to: str) -> None:
    """Envoie un email. En dev, affiche dans la console."""
    try:
        send_mail(
            subject=subject,
            message=text,
            html_message=html,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[to],
            fail_silently=False,
        )
        logger.info("Email envoyé à %s : %s", to, subject)
    except Exception as exc:
        logger.error("Échec envoi email à %s : %s", to, exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_welcome_email(self, user_id: int) -> None:
    from django.contrib.auth import get_user_model
    from .emails import welcome_email
    User = get_user_model()
    try:
        user = User.objects.get(pk=user_id)
        if not user.email:
            return
        subject, text, html = welcome_email(user)
        _send(subject, text, html, user.email)
    except Exception as exc:
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_order_confirmation_email(self, order_id: int) -> None:
    from apps.orders.models import Order
    from .emails import order_confirmation_email
    try:
        order = (
            Order.objects
            .select_related("user", "delivery_zone", "delivery_address")
            .prefetch_related("items")
            .get(pk=order_id)
        )
        if not order.user.email:
            return
        subject, text, html = order_confirmation_email(order)
        _send(subject, text, html, order.user.email)
    except Exception as exc:
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_order_status_email(self, order_id: int) -> None:
    from apps.orders.models import Order
    from .emails import order_status_email
    try:
        order = (
            Order.objects
            .select_related("user", "delivery_zone")
            .prefetch_related("items")
            .get(pk=order_id)
        )
        if not order.user.email:
            return
        result = order_status_email(order)
        if result is None:
            return
        subject, text, html = result
        _send(subject, text, html, order.user.email)
    except Exception as exc:
        raise self.retry(exc=exc)


def dispatch(task, *args, **kwargs) -> None:
    """
    Lance la task via Celery si disponible, sinon l'exécute en synchrone.
    Permet de ne pas crasher en dev sans Redis.
    """
    try:
        task.delay(*args, **kwargs)
    except Exception:
        logger.warning("Celery indisponible — exécution synchrone de %s", task.name)
        task(*args, **kwargs)
