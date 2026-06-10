from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
OUTPUT_DIR = BASE_DIR / "media" / "demo" / "products"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

products = [
    ("riz-25kg-premium", "#C89B3C", "#F7E7B6"),
    ("huile-20l", "#C96A1B", "#F8D7A8"),
    ("sucre-5kg", "#6FA8DC", "#D9ECFF"),
    ("lait-en-poudre", "#8E7CC3", "#E6E0F8"),
    ("savon-menage", "#76A5AF", "#D8EEF2"),
    ("seau-plastique-robuste", "#3D85C6", "#DCEBFA"),
    ("balai-menager", "#93C47D", "#E4F3DA"),
    ("casserole-inox", "#999999", "#F2F2F2"),
    ("ventilateur-18p", "#674EA7", "#E5DDF7"),
    ("ampoule-led-12w", "#F1C232", "#FFF2BF"),
    ("eau-minerale-pack", "#3C78D8", "#DDEBFF"),
    ("jus-ananas", "#E69138", "#FBE3C5"),
    ("tomate-concentree", "#CC4125", "#F7D8D2"),
    ("spaghetti-500g", "#B45F06", "#F6DEC5"),
    ("farine-1kg", "#D9D2C3", "#FAF6ED"),
    ("the-vert", "#6AA84F", "#E0F0D7"),
    ("telephone-smart-x1", "#222222", "#DDDDDD"),
    ("ecouteurs-bluetooth", "#0B5394", "#D9E9F7"),
    ("chargeur-rapide", "#444444", "#EAEAEA"),
    ("powerbank-10000mah", "#5B5B5B", "#EFEFEF"),
]

svg_template = """<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="{bg1}"/>
      <stop offset="100%" stop-color="{bg2}"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="1200" fill="url(#bg)"/>
  <circle cx="980" cy="220" r="180" fill="rgba(255,255,255,0.12)"/>
  <circle cx="220" cy="980" r="220" fill="rgba(255,255,255,0.10)"/>
  <rect x="160" y="220" width="880" height="560" rx="40" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.35)" stroke-width="6"/>
  <text x="600" y="520" text-anchor="middle" font-size="72" font-family="Arial, sans-serif" fill="#ffffff" font-weight="700">{title}</text>
  <text x="600" y="610" text-anchor="middle" font-size="36" font-family="Arial, sans-serif" fill="#ffffff" opacity="0.9">Sigida Sugu Demo Product</text>
</svg>
"""

for slug, bg1, bg2 in products:
    title = slug.replace("-", " ").title()
    content = svg_template.format(title=title, bg1=bg1, bg2=bg2)
    (OUTPUT_DIR / f"{slug}.svg").write_text(content, encoding="utf-8")

print(f"{len(products)} demo SVG images generated in {OUTPUT_DIR}")