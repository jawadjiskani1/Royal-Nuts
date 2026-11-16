#!/usr/bin/env python3
"""
Generates the illustrated placeholder artwork used by the storefront:

  public/products/<slug>.svg    one per sample product
  public/categories/<slug>.svg  one per category tile
  public/hero/*.svg             hero scene + floating nuts

These are stylised illustrations, NOT photographs. Replace them with real
product photos (upload through the admin dashboard once it exists, or drop
files in /public and point `images` at them). Re-run with:

    python3 scripts/art/generate_art.py
"""
import os
import random

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
PUBLIC = os.path.join(ROOT, "public")

NAVY, NAVY7, GOLD, GOLD_L, GOLD_D = "#0B1F3A", "#14305A", "#D4AF65", "#EBD6A4", "#A98536"


def lg(gid, c1, c2, x1=0, y1=0, x2=1, y2=1):
    return (f'<linearGradient id="{gid}" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}">'
            f'<stop offset="0" stop-color="{c1}"/><stop offset="1" stop-color="{c2}"/></linearGradient>')


# ---------------------------------------------------------------- items ----
# Each item is drawn around (0,0). `scale` makes different foods look
# proportionate next to each other.
PALETTES = {
    "almond": ("#D8A76F", "#8A5528"),
    "cashew": ("#F7E6BE", "#D4AC6A"),
    "pshell": ("#EFE1BE", "#BFA574"),
    "pshell_roast": ("#DDBF86", "#A47B42"),
    "pkernel": ("#A6CF72", "#4C8A2C"),
    "walnut": ("#CFA673", "#7A4F2C"),
    "date_ajwa": ("#55302A", "#1C0E0B"),
    "date_mabroom": ("#A25A32", "#55280F"),
    "raisin_gold": ("#EFC866", "#B3821C"),
    "raisin_dark": ("#92551F", "#4A2A0E"),
    "fig": ("#85507F", "#3A1E3A"),
    "peanut": ("#EBCB98", "#BD9156"),
}


def all_gradient_defs():
    return "".join(lg(f"g-{k}", a, b) for k, (a, b) in PALETTES.items())


def almond():
    return ('<path d="M0,-36 C14,-22 24,2 14,26 C9,38 -9,38 -14,26 C-24,2 -14,-22 0,-36Z" fill="url(#g-almond)" '
            'stroke="#5A3414" stroke-opacity=".35" stroke-width="1.2"/>'
            '<path d="M-7,-20 C-13,-4 -12,12 -7,24" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="3" stroke-linecap="round"/>'
            '<path d="M3,-28 C9,-8 9,12 4,28" fill="none" stroke="#5A3414" stroke-opacity=".25" stroke-width="1"/>')


def cashew():
    return ('<path d="M-27,-4 C-27,-24 4,-34 24,-20 C35,-12 31,3 22,6 C14,9 9,3 3,6 C-5,9 -9,26 -21,25 C-31,23 -28,6 -27,-4Z" '
            'fill="url(#g-cashew)" stroke="#8A6A2E" stroke-opacity=".4" stroke-width="1.2"/>'
            '<path d="M-17,-8 C-8,-21 8,-24 18,-16" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="3" stroke-linecap="round"/>')


def pistachio(roast=False, salted=False):
    shell = "pshell_roast" if roast else "pshell"
    out = (f'<path d="M0,-30 C16,-24 20,-2 14,18 C10,30 -10,30 -14,18 C-20,-2 -16,-24 0,-30Z" fill="url(#g-{shell})" '
           'stroke="#7B6338" stroke-opacity=".45" stroke-width="1.2"/>'
           '<path d="M0,-21 C9,-16 11,-2 7,14 C4,22 -4,22 -7,14 C-11,-2 -9,-16 0,-21Z" fill="url(#g-pkernel)" '
           'stroke="#2F5A18" stroke-opacity=".35" stroke-width="1"/>'
           '<path d="M-3,-12 C-5,-2 -4,8 -2,14" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2" stroke-linecap="round"/>')
    if salted:
        out += "".join(f'<circle cx="{x}" cy="{y}" r="1.5" fill="#fff" fill-opacity=".9"/>'
                       for x, y in [(-12, -8), (12, -4), (-10, 14), (11, 12), (-6, -22), (8, -18), (0, 26)])
    return out


def walnut():
    return ('<ellipse rx="30" ry="27" fill="url(#g-walnut)" stroke="#4A2F14" stroke-opacity=".4" stroke-width="1.2"/>'
            '<path d="M0,-26 C-6,-10 6,8 0,26" fill="none" stroke="#4A2F14" stroke-opacity=".5" stroke-width="1.8"/>'
            '<path d="M-19,-12 C-13,-6 -13,6 -19,12 M19,-12 C13,-6 13,6 19,12 M-9,-17 C-5,-10 -5,-4 -9,3 M10,-15 C6,-8 6,0 10,6 M-8,12 C-4,16 -3,20 -6,23" '
            'fill="none" stroke="#4A2F14" stroke-opacity=".35" stroke-width="1.4" stroke-linecap="round"/>'
            '<path d="M-22,-10 C-18,-18 -10,-23 -2,-24" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="3" stroke-linecap="round"/>')


def date(kind="ajwa"):
    g = f"date_{kind}"
    return (f'<path d="M0,-30 C14,-28 20,-8 17,12 C14,28 6,32 0,32 C-6,32 -14,28 -17,12 C-20,-8 -14,-28 0,-30Z" fill="url(#g-{g})" '
            'stroke="#000" stroke-opacity=".35" stroke-width="1.2"/>'
            '<path d="M-10,-14 C-4,-10 -4,-4 -10,0 M8,-8 C3,-4 3,4 8,8 M-6,12 C-2,16 2,16 6,12" fill="none" stroke="#000" '
            'stroke-opacity=".3" stroke-width="1.4" stroke-linecap="round"/>'
            '<path d="M-9,-20 C-13,-6 -12,8 -8,20" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="3.5" stroke-linecap="round"/>')


def raisin(kind="gold"):
    g = f"raisin_{kind}"
    return (f'<path d="M0,-17 C9,-17 13,-7 12,3 C11,13 5,18 0,18 C-6,18 -12,13 -12,3 C-13,-7 -9,-17 0,-17Z" fill="url(#g-{g})" '
            'stroke="#000" stroke-opacity=".3" stroke-width="1"/>'
            '<path d="M-6,-8 C-2,-5 -2,-1 -6,2 M5,-4 C2,-1 2,4 5,7 M-3,8 C0,10 2,10 4,8" fill="none" stroke="#000" stroke-opacity=".25" '
            'stroke-width="1.1" stroke-linecap="round"/>'
            '<path d="M-6,-11 C-9,-4 -8,4 -6,10" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2" stroke-linecap="round"/>')


def fig():
    return ('<path d="M0,-34 C4,-34 6,-30 6,-26 C20,-16 28,6 18,24 C12,34 -12,34 -18,24 C-28,6 -20,-16 -6,-26 C-6,-30 -4,-34 0,-34Z" '
            'fill="url(#g-fig)" stroke="#1E0E1D" stroke-opacity=".4" stroke-width="1.2"/>'
            '<path d="M-12,-14 C-16,0 -14,14 -9,24" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="3.5" stroke-linecap="round"/>'
            '<path d="M0,-24 C6,-6 6,12 2,28 M-8,-10 C-5,4 -5,14 -4,24" fill="none" stroke="#1E0E1D" stroke-opacity=".25" stroke-width="1"/>')


def peanut():
    return ('<path d="M0,-35 C13,-35 19,-26 17,-15 C16,-8 12,-5 12,-2 C12,1 17,4 19,12 C21,26 12,36 0,36 C-12,36 -21,26 -19,12 '
            'C-17,4 -12,1 -12,-2 C-12,-5 -16,-8 -17,-15 C-19,-26 -13,-35 0,-35Z" fill="url(#g-peanut)" stroke="#7A5524" stroke-opacity=".4" stroke-width="1.2"/>'
            + "".join(f'<circle cx="{x}" cy="{y}" r="1.1" fill="#7A5524" fill-opacity=".45"/>'
                      for x, y in [(-6, -24), (5, -22), (-9, -12), (8, -10), (0, -16), (-8, 14), (7, 16), (0, 22), (-3, 28), (9, 26), (-12, 22)]))


# key -> (svg builder, scale)
ITEMS = {
    "almond": (almond, 1.12), "cashew": (cashew, 1.12), "pistachio": (lambda: pistachio(False, False), 1.2),
    "pistachio_roast": (lambda: pistachio(True, False), 1.2), "pistachio_salted": (lambda: pistachio(False, True), 1.2),
    "walnut": (walnut, 1.15), "date_ajwa": (lambda: date("ajwa"), 1.15), "date_mabroom": (lambda: date("mabroom"), 1.15),
    "raisin_gold": (lambda: raisin("gold"), 1.55), "raisin_dark": (lambda: raisin("dark"), 1.55),
    "fig": (fig, 1.15), "peanut": (peanut, 1.0),
}


def place(key, x, y, rot, mult=1.0):
    fn, base = ITEMS[key]
    return f'<g transform="translate({x:.1f},{y:.1f}) rotate({rot:.0f}) scale({base * mult:.3f})">{fn()}</g>'


# ---------------------------------------------------------------- scene ----
def sparkle(x, y, s, op=0.8):
    return (f'<path transform="translate({x},{y}) scale({s})" d="M0,-10 C1,-3 3,-1 10,0 C3,1 1,3 0,10 C-1,3 -3,1 -10,0 C-3,-1 -1,-3 0,-10Z" '
            f'fill="{GOLD}" fill-opacity="{op}"/>')


def arches(cx, bottom, cy, radii):
    """Concentric arches (same centre, shrinking radius): the Royal Nuts motif."""
    out = []
    for r, op in zip(radii, (.55, .4, .28)):
        out.append(f'<path d="M{cx - r:.0f},{bottom} V{cy} A{r},{r} 0 0 1 {cx + r:.0f},{cy} V{bottom}" '
                   f'fill="none" stroke="{GOLD}" stroke-opacity="{op}" stroke-width="2"/>')
    return "".join(out)


def bowl(cx, rim_y, rx, depth, items_fn, rows, rng, scatter):
    ry = rx * 0.16
    parts = []
    # soft ground shadow
    parts.append(f'<ellipse cx="{cx}" cy="{rim_y + depth + 14}" rx="{rx * 0.95:.0f}" ry="{ry * 1.1:.0f}" fill="#000" fill-opacity=".22" filter="url(#blur)"/>')
    # foot
    parts.append(f'<rect x="{cx - rx * 0.34:.0f}" y="{rim_y + depth - 6}" width="{rx * 0.68:.0f}" height="16" rx="4" fill="#07142A"/>')
    # interior
    parts.append(f'<ellipse cx="{cx}" cy="{rim_y}" rx="{rx}" ry="{ry:.0f}" fill="#06122A"/>')
    # heap, drawn top row first so lower rows overlap
    n_rows = len(rows)
    for i in range(n_rows - 1, -1, -1):
        y, n = rows[i]
        row_w = 2 * rx * 0.84 * (1 - i * (0.62 / max(n_rows, 1)))
        for j in range(n):
            t = 0.5 if n == 1 else j / (n - 1)
            x = cx - row_w / 2 + t * row_w + rng.uniform(-9, 9)
            parts.append(place(items_fn(rng), x, y + rng.uniform(-6, 6), rng.uniform(-75, 75), rng.uniform(0.92, 1.08)))
    # bowl body (covers the lower part of the heap)
    body = (f'M{cx - rx},{rim_y} A{rx},{ry:.0f} 0 0 0 {cx + rx},{rim_y} '
            f'C{cx + rx},{rim_y + depth * .85:.0f} {cx + rx * .55:.0f},{rim_y + depth} {cx},{rim_y + depth} '
            f'C{cx - rx * .55:.0f},{rim_y + depth} {cx - rx},{rim_y + depth * .85:.0f} {cx - rx},{rim_y}Z')
    parts.append(f'<path d="{body}" fill="url(#bowl-body)"/>')
    parts.append(f'<path d="M{cx - rx * .985:.0f},{rim_y + depth * .22:.0f} A{rx * .985:.0f},{ry * 1.05:.0f} 0 0 0 {cx + rx * .985:.0f},{rim_y + depth * .22:.0f}" '
                 f'fill="none" stroke="{GOLD_L}" stroke-opacity=".85" stroke-width="3"/>')
    parts.append(f'<path d="M{cx - rx},{rim_y} A{rx},{ry:.0f} 0 0 0 {cx + rx},{rim_y}" fill="none" stroke="{GOLD}" stroke-width="5"/>')
    parts.append(f'<path d="M{cx - rx * .8:.0f},{rim_y + depth * .35:.0f} C{cx - rx * .75:.0f},{rim_y + depth * .7:.0f} {cx - rx * .45:.0f},{rim_y + depth * .9:.0f} {cx - rx * .2:.0f},{rim_y + depth * .95:.0f}" '
                 'fill="none" stroke="#fff" stroke-opacity=".12" stroke-width="8" stroke-linecap="round"/>')
    # scattered pieces on the ground in front
    for (dx, dy, mult) in scatter:
        x, y = cx + dx, rim_y + depth + dy
        parts.append(f'<ellipse cx="{x:.0f}" cy="{y + 14:.0f}" rx="18" ry="4.5" fill="#000" fill-opacity=".2" filter="url(#blur)"/>')
        parts.append(place(items_fn(rng), x, y, rng.uniform(-90, 90), mult))
    return "".join(parts)


def common_defs():
    return (all_gradient_defs()
            + lg("bowl-body", "#1B3C6B", "#07142A", 0, 0, 1, 0).replace('<stop offset="1"', '<stop offset=".55" stop-color="#0B1F3A"/><stop offset="1"')
            + '<filter id="blur" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>')


def product_scene(item_weights, seed, bg=("#FBF6EA", "#EBD6A4")):
    rng = random.Random(seed)
    keys, weights = zip(*item_weights.items())

    def pick(r):
        return r.choices(keys, weights)[0]

    rows = [(352, 9), (322, 8), (292, 6), (264, 4), (240, 2)]
    scatter = [(-205, 14, 1.0), (-150, 36, 0.9), (-232, 40, 0.85), (178, 22, 1.0), (222, 44, 0.9), (140, 46, 0.85)]
    body = bowl(300, 362, 188, 150, pick, rows, rng, scatter)
    return wrap(600, 600, bg, False, body)


def wrap(w, h, bg, dark, body, extra_top=""):
    cx = w / 2
    if dark:
        back = (f'<rect width="{w}" height="{h}" fill="url(#bg)"/>' + arches(cx, h, 300, (270, 225, 180)))
        bgdef = lg("bg", "#14305A", "#0B1F3A", 0.5, 0, 0.5, 1)
    else:
        back = (f'<rect width="{w}" height="{h}" fill="url(#bg)"/>'
                f'<path d="M{cx - 195},470 V270 A195,195 0 0 1 {cx + 195},270 V470Z" fill="#fff" fill-opacity=".38"/>'
                + arches(cx, 470, 270, (205, 170, 135)) + sparkle(96, 120, 1.0) + sparkle(512, 168, .8) + sparkle(470, 90, .55) + sparkle(120, 330, .6))
        bgdef = lg("bg", bg[0], bg[1], 0.5, 0, 0.5, 1)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" role="img" aria-hidden="true">'
            f'<defs>{common_defs()}{bgdef}</defs>{back}{extra_top}{body}</svg>')


def gift_scene(seed):
    rng = random.Random(seed)
    cx = 300
    box = f'''
<ellipse cx="{cx}" cy="548" rx="200" ry="20" fill="#000" fill-opacity=".22" filter="url(#blur)"/>
<rect x="{cx - 150}" y="352" width="300" height="190" rx="8" fill="url(#bowl-body)"/>
<rect x="{cx - 150}" y="352" width="300" height="190" rx="8" fill="none" stroke="{GOLD}" stroke-opacity=".6" stroke-width="2"/>
<rect x="{cx - 22}" y="352" width="44" height="190" fill="{GOLD}"/>
<rect x="{cx - 22}" y="352" width="44" height="190" fill="url(#shine)"/>
<rect x="{cx - 168}" y="296" width="336" height="64" rx="8" fill="url(#bowl-body)"/>
<rect x="{cx - 168}" y="296" width="336" height="64" rx="8" fill="none" stroke="{GOLD}" stroke-width="3"/>
<rect x="{cx - 22}" y="296" width="44" height="64" fill="{GOLD}"/>
<rect x="{cx - 22}" y="296" width="44" height="64" fill="url(#shine)"/>
<rect x="{cx - 150}" y="430" width="128" height="3" fill="{GOLD}" fill-opacity=".55"/>
<rect x="{cx + 22}" y="430" width="128" height="3" fill="{GOLD}" fill-opacity=".55"/>
<path d="M{cx},296 C{cx - 30},248 {cx - 96},238 {cx - 90},276 C{cx - 86},300 {cx - 40},302 {cx},296Z" fill="{GOLD}" stroke="{GOLD_D}" stroke-width="2"/>
<path d="M{cx},296 C{cx + 30},248 {cx + 96},238 {cx + 90},276 C{cx + 86},300 {cx + 40},302 {cx},296Z" fill="{GOLD}" stroke="{GOLD_D}" stroke-width="2"/>
<path d="M{cx - 70},276 C{cx - 56},268 {cx - 40},278 {cx - 14},292 M{cx + 70},276 C{cx + 56},268 {cx + 40},278 {cx + 14},292" fill="none" stroke="{GOLD_D}" stroke-opacity=".6" stroke-width="2"/>
<path d="M{cx - 10},300 C{cx - 30},330 {cx - 44},346 {cx - 52},362 L{cx - 30},362 C{cx - 22},344 {cx - 8},324 {cx},304Z" fill="{GOLD}" stroke="{GOLD_D}" stroke-width="1.5"/>
<path d="M{cx + 10},300 C{cx + 30},330 {cx + 44},346 {cx + 52},362 L{cx + 30},362 C{cx + 22},344 {cx + 8},324 {cx},304Z" fill="{GOLD}" stroke="{GOLD_D}" stroke-width="1.5"/>
<ellipse cx="{cx}" cy="298" rx="15" ry="13" fill="{GOLD_L}" stroke="{GOLD_D}" stroke-width="2"/>
<g transform="translate({cx + 86},470)">
  <rect x="-34" y="-30" width="68" height="60" rx="3" fill="#F8F4EA" stroke="{GOLD}" stroke-width="1.5"/>
  <path d="M-14,20 V0 C-14,-12 -7,-18 0,-18 S14,-12 14,0 V20" fill="none" stroke="{GOLD_D}" stroke-width="2"/>
  <circle cx="0" cy="4" r="4" fill="{GOLD_D}"/>
</g>'''
    shine = '<linearGradient id="shine" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></linearGradient>'
    pick_keys = ["almond", "cashew", "pistachio", "walnut", "date_mabroom", "raisin_gold"]
    scatter = ""
    for dx, dy, m in [(-210, 520, 1.0), (-160, 548, .9), (-236, 556, .85), (196, 534, 1.0), (236, 556, .9), (150, 552, .85)]:
        k = rng.choice(pick_keys)
        scatter += (f'<ellipse cx="{cx + dx}" cy="{dy + 14}" rx="18" ry="4.5" fill="#000" fill-opacity=".2" filter="url(#blur)"/>'
                    + place(k, cx + dx, dy, rng.uniform(-90, 90), m))
    svg = wrap(600, 600, ("#F3EEE0", "#D8C79A"), False, box + scatter)
    return svg.replace("</defs>", shine + "</defs>", 1)


def hero_scene():
    rng = random.Random(7)
    keys = ["almond", "almond", "cashew", "cashew", "pistachio", "walnut", "raisin_gold", "date_mabroom"]
    rows = [(572, 10), (540, 9), (508, 8), (476, 7), (446, 6), (418, 4), (392, 2)]
    scatter = [(-228, 16, 1.1), (-170, 40, 1.0), (-258, 44, .95), (200, 24, 1.1), (246, 48, 1.0), (150, 50, .95)]
    body = bowl(300, 590, 225, 150, lambda r: r.choice(keys), rows, rng, scatter)
    sparkles = sparkle(96, 160, 1.2) + sparkle(520, 250, 1.0) + sparkle(470, 110, .7) + sparkle(70, 400, .7) + sparkle(540, 420, .6)
    return wrap(600, 800, None, True, sparkles + body)


def floating(key, mult=1.8):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-60 -60 120 120" aria-hidden="true">'
            f'<defs>{all_gradient_defs()}</defs>{place(key, 0, 0, 0, mult)}</svg>')


# ----------------------------------------------------------------- main ----
PRODUCTS = {
    "premium-almonds": ({"almond": 1}, 1, ("#FBF6EA", "#EBD6A4")),
    "premium-cashews": ({"cashew": 1}, 2, ("#FCF7EA", "#EFDDB0")),
    "roasted-pistachios": ({"pistachio_roast": 1}, 3, ("#F6F5E4", "#DCE5B8")),
    "salted-pistachios": ({"pistachio_salted": 1}, 4, ("#F7F8EA", "#E1EAC4")),
    "premium-walnuts": ({"walnut": 1}, 5, ("#F9F1E3", "#E6CFA6")),
    "ajwa-dates": ({"date_ajwa": 1}, 6, ("#F8EEDD", "#E0C28F")),
    "mabroom-dates": ({"date_mabroom": 1}, 7, ("#F9EFDF", "#E6C99A")),
    "golden-raisins": ({"raisin_gold": 1}, 8, ("#FCF5E0", "#EDD58F")),
    "mixed-dry-fruits": ({"almond": 2, "cashew": 2, "pistachio": 1, "walnut": 1, "raisin_gold": 2, "date_mabroom": 1}, 9, ("#FBF6EA", "#EBD6A4")),
}
CATEGORIES = {
    "almonds": ({"almond": 1}, 11, ("#FBF6EA", "#EBD6A4")),
    "cashews": ({"cashew": 1}, 12, ("#FCF7EA", "#EFDDB0")),
    "pistachios": ({"pistachio": 1}, 13, ("#F6F5E4", "#DCE5B8")),
    "walnuts": ({"walnut": 1}, 14, ("#F9F1E3", "#E6CFA6")),
    "raisins": ({"raisin_gold": 1, "raisin_dark": 1}, 15, ("#FCF5E0", "#EDD58F")),
    "dates": ({"date_ajwa": 1, "date_mabroom": 1}, 16, ("#F8EEDD", "#E0C28F")),
    "figs": ({"fig": 1}, 17, ("#F6EEF2", "#DCC3D3")),
    "peanuts": ({"peanut": 1}, 18, ("#FBF3E4", "#EBD3A3")),
    "mixed-nuts": ({"almond": 2, "cashew": 2, "pistachio": 1, "walnut": 1, "raisin_gold": 2, "peanut": 1}, 19, ("#FBF6EA", "#EBD6A4")),
}


def write(rel, svg):
    path = os.path.join(PUBLIC, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(svg)
    print("wrote", rel, f"({len(svg) // 1024} KB)")


def main():
    for slug, (w, seed, bg) in PRODUCTS.items():
        write(f"products/{slug}.svg", product_scene(w, seed, bg))
    write("products/royal-gift-box.svg", gift_scene(10))
    for slug, (w, seed, bg) in CATEGORIES.items():
        write(f"categories/{slug}.svg", product_scene(w, seed, bg))
    write("categories/gift-boxes.svg", gift_scene(20))
    write("hero/hero.svg", hero_scene())
    for k in ["almond", "cashew", "pistachio", "walnut"]:
        write(f"hero/float-{k}.svg", floating(k))


if __name__ == "__main__":
    main()
