"""
Templates d'emails transactionnels Sigida Sugu.
Chaque fonction retourne (subject, text_body, html_body).
"""
from django.conf import settings

BRAND_COLOR = "#1c3a2d"
ACCENT_COLOR = "#d4a853"
FRONTEND_URL = getattr(settings, "FRONTEND_URL", "http://localhost:5173")

STATUS_LABELS = {
    "pending":   "En attente",
    "paid":      "Payée",
    "preparing": "En préparation",
    "shipped":   "Expédiée",
    "delivered": "Livrée",
    "cancelled": "Annulée",
    "refunded":  "Remboursée",
}

STATUS_MESSAGES = {
    "paid":      "Ton paiement a été confirmé. Nous préparons ta commande.",
    "preparing": "Nous préparons ta commande. Elle sera bientôt prête à expédier.",
    "shipped":   "Ta commande est en route ! Le livreur passera dans les délais prévus.",
    "delivered": "Ta commande a été livrée. Merci de ta confiance !",
    "cancelled": "Ta commande a été annulée. Si tu as payé, tu seras remboursé.",
    "refunded":  "Le remboursement a été initié. Il apparaîtra sous 3-5 jours ouvrés.",
}


def _base_html(content: str, preheader: str = "") -> str:
    return f"""<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Sigida Sugu</title>
</head>
<body style="margin:0;padding:0;background:#f5f4f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
{f'<div style="display:none;max-height:0;overflow:hidden;">{preheader}</div>' if preheader else ''}
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f4f0;padding:32px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

      <!-- Header -->
      <tr><td style="background:{BRAND_COLOR};border-radius:16px 16px 0 0;padding:28px 40px;">
        <a href="{FRONTEND_URL}" style="text-decoration:none;">
          <span style="font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.5px;">
            Sigida<span style="color:{ACCENT_COLOR};">Sugu</span>
          </span>
        </a>
      </td></tr>

      <!-- Body -->
      <tr><td style="background:#ffffff;padding:40px;border-left:1px solid #e8e6df;border-right:1px solid #e8e6df;">
        {content}
      </td></tr>

      <!-- Footer -->
      <tr><td style="background:#f5f4f0;border-radius:0 0 16px 16px;padding:24px 40px;border:1px solid #e8e6df;border-top:none;">
        <p style="margin:0;font-size:12px;color:#888;text-align:center;">
          Sigida Sugu · Bamako, Mali<br>
          <a href="{FRONTEND_URL}" style="color:{BRAND_COLOR};text-decoration:none;">sigidasugu.com</a>
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>"""


def _btn(text: str, url: str) -> str:
    return f"""<a href="{url}" style="display:inline-block;background:{BRAND_COLOR};color:#fff;font-size:14px;font-weight:700;text-decoration:none;padding:14px 28px;border-radius:10px;margin-top:24px;">{text}</a>"""


def _items_table(items) -> str:
    rows = ""
    for item in items:
        rows += f"""<tr>
          <td style="padding:10px 0;border-bottom:1px solid #f0ede6;font-size:14px;color:#222;">{item.product_name}{f' — {item.variant_name}' if item.variant_name else ''}</td>
          <td style="padding:10px 0;border-bottom:1px solid #f0ede6;text-align:center;font-size:14px;color:#666;">×{item.quantity}</td>
          <td style="padding:10px 0;border-bottom:1px solid #f0ede6;text-align:right;font-size:14px;font-weight:700;color:#222;">{int(item.line_total):,} FCFA</td>
        </tr>"""
    return f"""<table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr>
        <th style="text-align:left;font-size:11px;text-transform:uppercase;color:#888;padding-bottom:8px;border-bottom:2px solid #f0ede6;">Article</th>
        <th style="text-align:center;font-size:11px;text-transform:uppercase;color:#888;padding-bottom:8px;border-bottom:2px solid #f0ede6;">Qté</th>
        <th style="text-align:right;font-size:11px;text-transform:uppercase;color:#888;padding-bottom:8px;border-bottom:2px solid #f0ede6;">Total</th>
      </tr>
      {rows}
    </table>"""


# ── 1. Bienvenue ──────────────────────────────────────────────────────────────

def welcome_email(user) -> tuple[str, str, str]:
    name = user.first_name or user.username
    subject = f"Bienvenue sur Sigida Sugu, {name} !"
    text = (
        f"Bienvenue {name},\n\n"
        "Ton compte Sigida Sugu est créé. Tu peux maintenant parcourir le catalogue, "
        "commander et payer en Mobile Money.\n\n"
        f"→ Commencer : {FRONTEND_URL}/produits\n\n"
        "— L'équipe Sigida Sugu"
    )
    html = _base_html(f"""
        <h1 style="margin:0 0 8px;font-size:26px;font-weight:900;color:#111;">Bienvenue, {name} ! 👋</h1>
        <p style="margin:0 0 16px;color:#555;font-size:15px;line-height:1.6;">
          Ton compte Sigida Sugu est prêt. Parcours des milliers de produits et commande en quelques clics,
          avec paiement Mobile Money.
        </p>
        <ul style="margin:0 0 24px;padding-left:20px;color:#555;font-size:14px;line-height:2;">
          <li>🛒 Commande en ligne 24h/24</li>
          <li>📱 Paiement Mobile Money (Orange, Moov, Sama)</li>
          <li>🚚 Livraison à Bamako</li>
        </ul>
        {_btn("Découvrir le catalogue", f"{FRONTEND_URL}/produits")}
    """, preheader=f"Bienvenue {name} — ton compte est prêt !")
    return subject, text, html


# ── 2. Confirmation de commande ───────────────────────────────────────────────

def order_confirmation_email(order) -> tuple[str, str, str]:
    name = order.user.first_name or order.user.username
    subject = f"Commande {order.number} confirmée — Sigida Sugu"
    order_url = f"{FRONTEND_URL}/commandes/{order.id}"

    items_text = "\n".join(
        f"  - {i.product_name} x{i.quantity} : {int(i.line_total):,} FCFA"
        for i in order.items.all()
    )
    text = (
        f"Bonjour {name},\n\n"
        f"Ta commande {order.number} a été enregistrée.\n\n"
        f"Articles :\n{items_text}\n\n"
        f"Sous-total : {int(order.subtotal):,} FCFA\n"
        f"Livraison  : {int(order.delivery_fee):,} FCFA\n"
        f"Total      : {int(order.total):,} FCFA\n\n"
        f"Suis ta commande : {order_url}\n\n"
        "— L'équipe Sigida Sugu"
    )

    zone_text = ""
    if order.delivery_zone:
        z = order.delivery_zone
        zone_text = f"""<p style="margin:16px 0 0;font-size:14px;color:#555;">
          🚚 <strong>{z.name}</strong> — livraison estimée {z.estimated_min_days}–{z.estimated_max_days} jour(s).
        </p>"""

    html = _base_html(f"""
        <p style="margin:0 0 4px;font-size:12px;font-weight:700;text-transform:uppercase;color:{BRAND_COLOR};letter-spacing:.08em;">Commande confirmée</p>
        <h1 style="margin:0 0 8px;font-size:24px;font-weight:900;color:#111;">Merci, {name} !</h1>
        <p style="margin:0 0 24px;color:#555;font-size:15px;">
          Ta commande <strong>{order.number}</strong> a bien été reçue. Nous te tiendrons informé(e) à chaque étape.
        </p>

        {_items_table(order.items.all())}

        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size:13px;color:#888;padding:6px 0;">Sous-total</td>
            <td style="text-align:right;font-size:13px;color:#888;padding:6px 0;">{int(order.subtotal):,} FCFA</td>
          </tr>
          <tr>
            <td style="font-size:13px;color:#888;padding:6px 0;">Livraison</td>
            <td style="text-align:right;font-size:13px;color:#888;padding:6px 0;">{int(order.delivery_fee):,} FCFA</td>
          </tr>
          <tr>
            <td style="font-size:16px;font-weight:900;color:#111;padding-top:12px;border-top:2px solid #f0ede6;">Total</td>
            <td style="text-align:right;font-size:18px;font-weight:900;color:{BRAND_COLOR};padding-top:12px;border-top:2px solid #f0ede6;">{int(order.total):,} FCFA</td>
          </tr>
        </table>

        {zone_text}
        {_btn("Suivre ma commande", order_url)}
    """, preheader=f"Commande {order.number} — {int(order.total):,} FCFA")
    return subject, text, html


# ── 3. Changement de statut ───────────────────────────────────────────────────

def order_status_email(order) -> tuple[str, str, str] | None:
    if order.status not in STATUS_MESSAGES:
        return None
    name = order.user.first_name or order.user.username
    label = STATUS_LABELS.get(order.status, order.status)
    message = STATUS_MESSAGES[order.status]
    subject = f"Commande {order.number} — {label}"
    order_url = f"{FRONTEND_URL}/commandes/{order.id}"

    # Icône selon statut
    icons = {
        "paid": "✅", "preparing": "📦", "shipped": "🚚",
        "delivered": "🎉", "cancelled": "❌", "refunded": "↩️",
    }
    icon = icons.get(order.status, "📋")

    text = (
        f"Bonjour {name},\n\n"
        f"Ta commande {order.number} est maintenant : {label}\n\n"
        f"{message}\n\n"
        f"Détails : {order_url}\n\n"
        "— L'équipe Sigida Sugu"
    )
    html = _base_html(f"""
        <p style="margin:0 0 4px;font-size:12px;font-weight:700;text-transform:uppercase;color:{BRAND_COLOR};letter-spacing:.08em;">Mise à jour de commande</p>
        <h1 style="margin:0 0 8px;font-size:24px;font-weight:900;color:#111;">{icon} {label}</h1>
        <p style="margin:0 0 8px;font-size:14px;color:#888;">Commande <strong>{order.number}</strong></p>
        <div style="background:#f5f4f0;border-left:4px solid {BRAND_COLOR};border-radius:8px;padding:16px 20px;margin:20px 0;">
          <p style="margin:0;font-size:15px;color:#333;line-height:1.6;">{message}</p>
        </div>
        {_btn("Voir le détail", order_url)}
    """, preheader=f"{order.number} — {label}")
    return subject, text, html
