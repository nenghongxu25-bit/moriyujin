import json
import uuid
from pathlib import Path

from PIL import Image


SOURCE = Path("assets/atlas/picture/vfx/water_caustics_01_seamless.png")
OUTPUT_ROOT = Path("assets/atlas/picture/vfx/water_caustics_tiles")
TILE_SIZES = (128, 64)


def laya_meta() -> str:
    return json.dumps(
        {
            "uuid": str(uuid.uuid4()),
            "importer": {
                "textureType": 2,
            },
        },
        indent=2,
    ) + "\n"


def split_tiles(tile_size: int) -> dict:
    with Image.open(SOURCE) as image:
        image.load()
        width, height = image.size
        if width % tile_size != 0 or height % tile_size != 0:
            raise ValueError(f"{SOURCE} size {width}x{height} is not divisible by {tile_size}")

        out_dir = OUTPUT_ROOT / f"{tile_size}x{tile_size}"
        out_dir.mkdir(parents=True, exist_ok=True)

        items = []
        rows = height // tile_size
        cols = width // tile_size
        for row in range(rows):
            for col in range(cols):
                x = col * tile_size
                y = row * tile_size
                tile = image.crop((x, y, x + tile_size, y + tile_size))
                name = f"water_caustics_{tile_size}_{row:02d}_{col:02d}.png"
                out_path = out_dir / name
                tile.save(out_path, "PNG")

                meta_path = out_path.with_suffix(out_path.suffix + ".meta")
                if not meta_path.exists():
                    meta_path.write_text(laya_meta(), encoding="utf-8")

                items.append(
                    {
                        "row": row,
                        "col": col,
                        "x": x,
                        "y": y,
                        "width": tile_size,
                        "height": tile_size,
                        "output": out_path.as_posix(),
                    }
                )

        manifest = {
            "source": SOURCE.as_posix(),
            "tileSize": tile_size,
            "columns": cols,
            "rows": rows,
            "count": len(items),
            "items": items,
        }
        manifest_path = out_dir / "manifest.json"
        manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        return manifest


def main() -> int:
    if not SOURCE.exists():
        raise FileNotFoundError(SOURCE)

    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)
    summary = [split_tiles(size) for size in TILE_SIZES]
    (OUTPUT_ROOT / "manifest.json").write_text(
        json.dumps(
            {
                "source": SOURCE.as_posix(),
                "sets": [
                    {
                        "tileSize": item["tileSize"],
                        "columns": item["columns"],
                        "rows": item["rows"],
                        "count": item["count"],
                    }
                    for item in summary
                ],
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )

    for item in summary:
        print(f"{item['tileSize']}x{item['tileSize']} count={item['count']} grid={item['columns']}x{item['rows']}")
    print(f"output={OUTPUT_ROOT.as_posix()}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
