import json
import math
from pathlib import Path

from PIL import Image


WIDTH = 1334
HEIGHT = 750
WATER = Path("assets/tileset/water.png")
GRASS = Path("assets/tileset/grass.png")
MASK = Path("assets/atlas/picture/decorate/lake.png")
OUT_DIR = Path("assets/tileset/baked")
OUT_IMAGE = OUT_DIR / "ceshi_water_grass_mask_preview.png"
OUT_VALUE = OUT_DIR / "ceshi_mask_values_preview.png"
OUT_META_UUID = "65d4d893-d5e6-4f2d-a9ab-1b2c62d6f421"


def smooth_noise(x: int, y: int) -> float:
    n = (x * 374761393 + y * 668265263) & 0xFFFFFFFF
    n = (n ^ (n >> 13)) * 1274126177 & 0xFFFFFFFF
    return ((n ^ (n >> 16)) & 0xFFFF) / 65535.0


def tile_sample(image: Image.Image, x: int, y: int):
    return image.getpixel((x % image.width, y % image.height))


def mix_color(a, b, t: float):
    return tuple(round(a[i] * (1.0 - t) + b[i] * t) for i in range(4))


def build_mask_values(mask: Image.Image) -> Image.Image:
    small = mask.convert("RGBA")
    inside = []
    edge_points = []

    for y in range(small.height):
        row = []
        for x in range(small.width):
            row.append(small.getpixel((x, y))[3] > 8)
        inside.append(row)

    for y in range(small.height):
        for x in range(small.width):
            center = inside[y][x]
            for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                if 0 <= nx < small.width and 0 <= ny < small.height and inside[ny][nx] != center:
                    edge_points.append((x, y))
                    break

    value = Image.new("L", small.size, 255)
    for y in range(small.height):
        for x in range(small.width):
            best2 = 10**9
            for ex, ey in edge_points:
                dx = x - ex
                dy = y - ey
                d2 = dx * dx + dy * dy
                if d2 < best2:
                    best2 = d2

            dist = math.sqrt(best2) + (smooth_noise(x, y) - 0.5) * 4.0
            if inside[y][x]:
                if dist <= 5:
                    v = 0.5
                elif dist <= 14:
                    v = 0.3
                else:
                    v = 0.0
            else:
                if dist <= 5:
                    v = 0.5
                elif dist <= 14:
                    v = 0.8
                else:
                    v = 1.0

            value.putpixel((x, y), round(v * 255))

    return value.resize((WIDTH, HEIGHT), Image.Resampling.NEAREST)


def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    water = Image.open(WATER).convert("RGBA")
    grass = Image.open(GRASS).convert("RGBA")
    mask = Image.open(MASK).convert("RGBA")
    values = build_mask_values(mask)

    output = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 255))
    for y in range(HEIGHT):
        for x in range(WIDTH):
            t = values.getpixel((x, y)) / 255.0
            water_color = tile_sample(water, x, y)
            grass_color = tile_sample(grass, x, y)
            output.putpixel((x, y), mix_color(water_color, grass_color, t))

    output.save(OUT_IMAGE)
    values.save(OUT_VALUE)

    meta = {
        "uuid": OUT_META_UUID,
        "importer": {
            "textureType": 2,
        },
    }
    OUT_IMAGE.with_suffix(".png.meta").write_text(json.dumps(meta, indent=2) + "\n", encoding="utf-8")
    OUT_VALUE.with_suffix(".png.meta").write_text(
        json.dumps(
            {
                "uuid": "e2b54064-5575-4380-99c0-0c4965c9ba4b",
                "importer": {
                    "textureType": 2,
                },
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )

    print(f"baked={OUT_IMAGE.as_posix()}")
    print(f"valueMap={OUT_VALUE.as_posix()}")
    print(f"uuid={OUT_META_UUID}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
