#!/usr/bin/env python3
"""
Baixa as texturas do modo 3D do Poly Haven (https://polyhaven.com), todas
CC0 (https://polyhaven.com/license), redimensiona, comprime e grava em
public/texturas/, junto com o arquivo de créditos.

Uso: python3 scripts/fetch_assets.py   (requer Pillow: pip install pillow)

Os arquivos gerados ficam no repositório: o site publicado não depende do
Poly Haven estar no ar. Este script existe para documentar a origem e
permitir baixar de novo (outra resolução, outra textura).
"""
import io
import json
import pathlib
import urllib.request
from datetime import date

from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "texturas"
API = "https://api.polyhaven.com"

# id no jogo -> (asset do Poly Haven, lado em pixels, uso)
TEXTURES = {
    "parede": ("white_plaster_02", 1024, "paredes de adobe caiado"),
    "telhado": ("thatch_roof_angled", 1024, "telhado de palha"),
    "campo": ("forrest_ground_01", 1024, "chão do campo"),
    "terra": ("clay_floor_001", 1024, "terreiro e chão de terra batida"),
    "madeira": ("brown_planks_04", 512, "porta, mesa, banco e baú"),
    "eucalipto": ("bark_bluegum", 512, "troncos dos eucaliptos"),
    "casca": ("bark_brown_02", 512, "tronco do ombú e postes"),
}
# mapa no jogo -> chave na API do Poly Haven
MAPS = {"diff": "Diffuse", "nor": "nor_gl", "arm": "arm"}


def get(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "pericia-historica-assets"})
    with urllib.request.urlopen(req, timeout=120) as r:
        return r.read()


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    credits = []
    for game_id, (asset, size, use) in TEXTURES.items():
        info = json.loads(get(f"{API}/info/{asset}"))
        files = json.loads(get(f"{API}/files/{asset}"))
        folder = OUT / game_id
        folder.mkdir(exist_ok=True)
        for name, key in MAPS.items():
            url = files[key]["1k"]["jpg"]["url"]
            img = Image.open(io.BytesIO(get(url))).convert("RGB")
            if img.width != size:
                img = img.resize((size, size), Image.LANCZOS)
            # Normais aguentam menos compressão (artefatos viram relevo falso).
            quality = 90 if name == "nor" else 80
            img.save(folder / f"{name}.jpg", "JPEG", quality=quality, optimize=True, progressive=True)
        authors = ", ".join(info.get("authors", {}).keys())
        dims = info.get("dimensions") or [0, 0]
        credits.append((game_id, asset, info.get("name", asset), authors, use, dims[0] / 1000))
        print(f"{game_id:10} <- {asset} ({authors})")

    lines = [
        "# Créditos das texturas do modo 3D",
        "",
        "Todas as texturas vêm do [Poly Haven](https://polyhaven.com) e são licenciadas como",
        "[CC0](https://polyhaven.com/license) (domínio público): uso livre, inclusive comercial e",
        "redistribuição, sem exigência de atribuição. Os créditos abaixo são por reconhecimento.",
        "",
        f"Baixadas em {date.today().isoformat()} por `scripts/fetch_assets.py` (resolução 1k, redimensionadas e",
        "recomprimidas em JPEG). Cada pasta tem `diff.jpg` (cor), `nor.jpg` (normal, convenção OpenGL) e",
        "`arm.jpg` (oclusão, rugosidade e metal nos canais R, G e B).",
        "",
        "| Pasta | Asset | Autores | Uso no jogo | Tamanho real |",
        "|---|---|---|---|---|",
    ]
    for game_id, asset, name, authors, use, metres in credits:
        lines.append(f"| `{game_id}` | [{name}](https://polyhaven.com/a/{asset}) | {authors} | {use} | {metres:.2f} m |")
    (OUT / "CREDITOS.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
