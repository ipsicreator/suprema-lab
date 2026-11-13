from __future__ import annotations

import json
import shutil
import zipfile
from pathlib import Path


ROOT = Path(r"C:\Users\chris\Desktop\수프리마랩")
ZIP_DIR = ROOT / ".tmp" / "adiga_2028_zips"
RAW_DIR = ROOT / "outputs" / "adiga_2028_raw"
MANIFEST_PATH = ROOT / "outputs" / "adiga_2028_raw_manifest.json"


def school_name_from_member(member: str) -> str:
    base = Path(member).name
    if "[" in base:
        return base.split("[", 1)[0]
    return Path(base).stem


def main() -> None:
    RAW_DIR.mkdir(parents=True, exist_ok=True)

    manifest: list[dict[str, str]] = []
    zip_files = sorted(ZIP_DIR.glob("*.zip"))
    if not zip_files:
        raise SystemExit(f"No ZIP files found in {ZIP_DIR}")

    for zip_path in zip_files:
        with zipfile.ZipFile(zip_path, "r") as archive:
            for member in archive.namelist():
                suffix = Path(member).suffix.lower()
                if suffix not in {".pdf", ".hwp", ".hwpx"}:
                    continue

                school = school_name_from_member(member)
                school_dir = RAW_DIR / school
                school_dir.mkdir(parents=True, exist_ok=True)

                raw_path = school_dir / Path(member).name
                if not raw_path.exists():
                    with archive.open(member) as src, raw_path.open("wb") as dst:
                        shutil.copyfileobj(src, dst)

                manifest.append(
                    {
                        "zip": zip_path.name,
                        "member": member,
                        "school": school,
                        "suffix": suffix,
                        "raw_path": str(raw_path),
                    }
                )

    MANIFEST_PATH.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(
        {
            "zip_files": [p.name for p in zip_files],
            "count": len(manifest),
            "manifest": str(MANIFEST_PATH),
        },
        ensure_ascii=False,
        indent=2,
    ))


if __name__ == "__main__":
    main()
