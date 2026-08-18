"""Derive cache-safe favicon assets from the official header mark."""

from __future__ import annotations

import base64
from io import BytesIO
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public" / "images" / "bit-mark-official.png"
OUTPUT = ROOT / "public" / "brand-icons"
VERSION = "v20260818"


def render_mark(size: int) -> Image.Image:
    source = Image.open(SOURCE).convert("RGBA")
    alpha_bbox = source.getchannel("A").getbbox()
    if alpha_bbox is None:
        raise RuntimeError("Official mark has no visible pixels")
    source = source.crop(alpha_bbox)

    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    optical_box = max(1, round(size * 0.82))
    source.thumbnail((optical_box, optical_box), Image.Resampling.LANCZOS)
    left = (size - source.width) // 2
    top = (size - source.height) // 2
    canvas.alpha_composite(source, (left, top))
    return canvas


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    rendered: dict[int, Image.Image] = {}
    for size in (16, 32, 48, 128, 180, 192, 512):
        icon = render_mark(size)
        rendered[size] = icon
        if size != 128:
            icon.save(OUTPUT / f"bit-mark-{VERSION}-{size}.png", "PNG", optimize=True)

    rendered[48].save(
        OUTPUT / f"bit-mark-{VERSION}.ico",
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48)],
        append_images=[rendered[32], rendered[16]],
    )

    png = BytesIO()
    rendered[128].save(png, "PNG", optimize=True)
    encoded = base64.b64encode(png.getvalue()).decode("ascii")
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">'
        f'<image width="128" height="128" href="data:image/png;base64,{encoded}"/>'
        "</svg>\n"
    )
    (OUTPUT / f"bit-mark-{VERSION}.svg").write_text(svg, encoding="utf-8", newline="\n")


if __name__ == "__main__":
    main()
