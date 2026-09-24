import json
import os

with open(r"e:\Coding Space\aniimo-homeland-guide\data\aniimo_homeland_data.json", "r", encoding="utf-8") as f:
    data = json.load(f)

img_dir = r"e:\Coding Space\aniimo-homeland-guide\public\images"
os.makedirs(img_dir, exist_ok=True)

element_meta = {
    "Fire": {"c1": "#ea580c", "c2": "#f97316", "emoji": "🔥"},
    "Grass": {"c1": "#16a34a", "c2": "#22c55e", "emoji": "🌱"},
    "Water": {"c1": "#0284c7", "c2": "#0ea5e9", "emoji": "💧"},
    "Earth": {"c1": "#b45309", "c2": "#d97706", "emoji": "⛰️"},
    "Lightning": {"c1": "#ca8a04", "c2": "#eab308", "emoji": "⚡"},
    "Ice": {"c1": "#0284c7", "c2": "#38bdf8", "emoji": "❄️"},
    "Wind": {"c1": "#0d9488", "c2": "#14b8a6", "emoji": "🍃"},
    "Dark": {"c1": "#7e22ce", "c2": "#a855f7", "emoji": "🌑"},
    "Light": {"c1": "#d97706", "c2": "#fbbf24", "emoji": "✨"}
}

for item in data:
    name = item["name"]
    dex_id = item["id"]
    elem = item.get("element", "Fire")
    meta = element_meta.get(elem, {"c1": "#475569", "c2": "#64748b", "emoji": "🐾"})
    
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad_{dex_id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{meta['c1']}"/>
      <stop offset="60%" stop-color="{meta['c2']}"/>
      <stop offset="100%" stop-color="#0b1120"/>
    </linearGradient>
    <radialGradient id="glow_{dex_id}" cx="50%" cy="45%" r="45%">
      <stop offset="0%" stop-color="white" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="transparent"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bgGrad_{dex_id})"/>
  <circle cx="200" cy="100" r="75" fill="url(#glow_{dex_id})"/>
  
  <!-- Particles -->
  <circle cx="70" cy="50" r="16" fill="white" opacity="0.12"/>
  <circle cx="330" cy="160" r="24" fill="white" opacity="0.1"/>
  <circle cx="320" cy="60" r="12" fill="white" opacity="0.18"/>
  <circle cx="90" cy="180" r="8" fill="white" opacity="0.25"/>

  <!-- Creature Crest Container -->
  <g transform="translate(155, 55)">
    <circle cx="45" cy="45" r="42" fill="rgba(15, 23, 42, 0.45)" stroke="rgba(255,255,255,0.4)" stroke-width="2.5"/>
    <text x="45" y="58" font-size="40" text-anchor="middle" font-family="sans-serif">{meta['emoji']}</text>
  </g>

  <!-- Name & Type Banner -->
  <text x="200" y="175" font-family="'Outfit', sans-serif" font-weight="800" font-size="22" fill="#ffffff" text-anchor="middle" letter-spacing="1.5">{name.upper()}</text>
  <text x="200" y="205" font-family="'JetBrains Mono', monospace" font-weight="600" font-size="13" fill="#cbd5e1" text-anchor="middle">No. {dex_id} • {elem.upper()} TYPE</text>
</svg>"""

    # Save as {id}.svg and fallback
    file_path = os.path.join(img_dir, f"{dex_id}.svg")
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(svg)

print(f"Generated {len(data)} SVG portraits in {img_dir}")

