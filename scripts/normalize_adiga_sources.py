from __future__ import annotations

import json
import shutil
import subprocess
import zipfile
from pathlib import Path


ROOT = Path(r"C:\Users\chris\Desktop\수프리마랩")
ZIP_DIR = ROOT / ".tmp" / "adiga_2028_zips"
RAW_DIR = ROOT / "outputs" / "adiga_2028_raw"
PDF_DIR = ROOT / "outputs" / "adiga_2028_pdf"
MANIFEST_PATH = ROOT / "outputs" / "adiga_2028_manifest.json"
CONVERT_PS1 = ROOT / "scripts" / "convert_hwp_to_pdf.ps1"


def school_name_from_member(member: str) -> str:
    base = Path(member).name
    if "[" in base:
        return base.split("[", 1)[0]
    return Path(base).stem


def normalize_pdf_name(member: str) -> str:
    base = Path(member).name
    if base.lower().endswith((".pdf", ".hwp", ".hwpx")):
        return Path(base).stem + ".pdf"
    return Path(base).name + ".pdf"


def main() -> None:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    PDF_DIR.mkdir(parents=True, exist_ok=True)

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
                raw_school_dir = RAW_DIR / school
                pdf_school_dir = PDF_DIR / school
                raw_school_dir.mkdir(parents=True, exist_ok=True)
                pdf_school_dir.mkdir(parents=True, exist_ok=True)

                raw_path = raw_school_dir / Path(member).name
                pdf_path = pdf_school_dir / normalize_pdf_name(member)

                if not raw_path.exists():
                    with archive.open(member) as src, raw_path.open("wb") as dst:
                        shutil.copyfileobj(src, dst)

                status = "pdf"
                error = ""
                if suffix == ".pdf":
                    if not pdf_path.exists():
                        shutil.copyfile(raw_path, pdf_path)
                else:
                    cmd = [
                        "powershell",
                        "-NoProfile",
                        "-ExecutionPolicy",
                        "Bypass",
                        "-File",
                        str(CONVERT_PS1),
                        str(raw_path),
                        str(pdf_path),
                    ]
                    proc = subprocess.run(cmd, capture_output=True, text=True)
                    if proc.returncode != 0 or not pdf_path.exists():
                        status = "failed"
                        error = (proc.stderr or proc.stdout or "").strip()

                manifest.append(
                    {
                        "zip": zip_path.name,
                        "member": member,
                        "school": school,
                        "suffix": suffix,
                        "raw_path": str(raw_path),
                        "pdf_path": str(pdf_path),
                        "status": status,
                        "error": error,
                    }
                )

    MANIFEST_PATH.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(
        {
            "zip_files": [p.name for p in zip_files],
            "count": len(manifest),
            "pdf_count": sum(1 for item in manifest if item["status"] == "pdf"),
            "failed_count": sum(1 for item in manifest if item["status"] == "failed"),
            "manifest": str(MANIFEST_PATH),
        },
        ensure_ascii=False,
        indent=2,
    ))


if __name__ == "__main__":
    main()
