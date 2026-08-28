import io
import json
import re
import tarfile
import uuid
from pathlib import Path

from PIL import Image


PACKAGE = Path("assets/atlas/picture/vfx/The 2DFX Hit and Slashes Vol.1.unitypackage")
OUTPUT_DIR = Path("assets/atlas/picture/vfx/2dfx_hit_slashes")
UNITY_PREFIX = "Assets/Inguz Media Studio/The 2DFX Hit and Slashes Vol.1/"
IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".psd"}


def clean_name(name: str) -> str:
    stem = Path(name).stem
    stem = re.sub(r"[^0-9A-Za-z_\-]+", "_", stem).strip("_")
    stem = re.sub(r"_+", "_", stem)
    return stem.lower()


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


def collect_entries(package: Path):
    entries = {}
    with tarfile.open(package, "r:gz") as tf:
        for member in tf.getmembers():
            parts = member.name.split("/")
            if len(parts) == 2 and parts[1] == "pathname":
                f = tf.extractfile(member)
                if not f:
                    continue
                entries[parts[0]] = f.read().decode("utf-8", errors="replace").strip()
    return entries


def image_entries(entries):
    for entry_id, unity_path in sorted(entries.items(), key=lambda item: item[1].lower()):
        ext = Path(unity_path).suffix.lower()
        if ext not in IMAGE_EXTS:
            continue
        if "/Sprites/" not in unity_path:
            continue
        yield entry_id, unity_path, ext


def write_png(data: bytes, output_path: Path) -> tuple[int, int]:
    with Image.open(io.BytesIO(data)) as image:
        image.load()
        if image.mode not in ("RGBA", "RGB"):
            image = image.convert("RGBA")
        output_path.parent.mkdir(parents=True, exist_ok=True)
        image.save(output_path, "PNG")
        return image.size


def main() -> int:
    if not PACKAGE.exists():
        raise FileNotFoundError(PACKAGE)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    entries = collect_entries(PACKAGE)
    manifest = []
    failures = []

    with tarfile.open(PACKAGE, "r:gz") as tf:
        for entry_id, unity_path, ext in image_entries(entries):
            asset_member_name = f"{entry_id}/asset"
            member = tf.getmember(asset_member_name)
            f = tf.extractfile(member)
            if not f:
                failures.append({"source": unity_path, "error": "missing asset stream"})
                continue

            data = f.read()
            output_name = clean_name(Path(unity_path).name) + ".png"
            output_path = OUTPUT_DIR / output_name

            try:
                width, height = write_png(data, output_path)
            except Exception as exc:
                raw_path = OUTPUT_DIR / (clean_name(Path(unity_path).name) + ext)
                raw_path.write_bytes(data)
                failures.append({"source": unity_path, "raw": raw_path.as_posix(), "error": str(exc)})
                continue

            meta_path = output_path.with_suffix(output_path.suffix + ".meta")
            if not meta_path.exists():
                meta_path.write_text(laya_meta(), encoding="utf-8")

            manifest.append(
                {
                    "source": unity_path,
                    "output": output_path.as_posix(),
                    "width": width,
                    "height": height,
                }
            )

    manifest_path = OUTPUT_DIR / "manifest.json"
    manifest_path.write_text(
        json.dumps(
            {
                "sourcePackage": PACKAGE.as_posix(),
                "count": len(manifest),
                "items": manifest,
                "failures": failures,
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )

    print(f"converted={len(manifest)}")
    print(f"failures={len(failures)}")
    print(f"output={OUTPUT_DIR.as_posix()}")
    print(f"manifest={manifest_path.as_posix()}")
    return 0 if not failures else 1


if __name__ == "__main__":
    raise SystemExit(main())
