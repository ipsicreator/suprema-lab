from __future__ import annotations

import json
import shutil
import sys
from pathlib import Path

import fitz
from PIL import Image
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas


ROOT = Path(r"C:\Users\chris\Desktop\수프리마랩")
RAW_MANIFEST = ROOT / "outputs" / "adiga_2028_raw_manifest.json"
RAW_DIR = ROOT / "outputs" / "adiga_2028_raw"
PDF_DIR = ROOT / "outputs" / "adiga_2028_pdf"
FAILED_DIR = ROOT / "outputs" / "adiga_2028_pdf_failed"
TMP_DIR = ROOT / ".tmp" / "adiga_svg"

sys.path.insert(0, str(ROOT / ".cache" / "pylibs"))

from rhwp import parse as parse_hwp  # noqa: E402


def normalize_pdf_name(member: str) -> str:
    return Path(member).stem + ".pdf"


def render_svg_to_pdf_page(svg_text: str, out_pdf: Path) -> None:
    tmp_svg = TMP_DIR / (out_pdf.stem + ".svg")
    tmp_svg.write_text(svg_text, encoding="utf-8")
    svg_doc = fitz.open(tmp_svg)
    page = svg_doc[0]
    pix = page.get_pixmap(matrix=fitz.Matrix(1, 1), alpha=False)
    image = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)

    out_pdf.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(out_pdf), pagesize=(pix.width, pix.height))
    c.drawImage(ImageReader(image), 0, 0, width=pix.width, height=pix.height)
    c.showPage()
    c.save()


def convert_hwp_like_to_pdf(input_path: Path, output_path: Path) -> tuple[bool, str]:
    try:
        doc = parse_hwp(str(input_path))
        output_path.parent.mkdir(parents=True, exist_ok=True)
        if output_path.exists():
            output_path.unlink()

        page_count = doc.page_count
        if page_count <= 0:
            return False, "page_count <= 0"

        # Use per-page SVG rendering to preserve layout as a standard PDF.
        writer = canvas.Canvas(str(output_path))
        for page_index in range(page_count):
            svg_text = doc.render_svg(page_index)
            tmp_svg = TMP_DIR / f"{input_path.stem}_p{page_index + 1}.svg"
            tmp_svg.write_text(svg_text, encoding="utf-8")
            svg_doc = fitz.open(tmp_svg)
            svg_page = svg_doc[0]
            pix = svg_page.get_pixmap(matrix=fitz.Matrix(1, 1), alpha=False)
            image = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
            writer.setPageSize((pix.width, pix.height))
            writer.drawImage(ImageReader(image), 0, 0, width=pix.width, height=pix.height)
            writer.showPage()
        writer.save()
        return True, ""
    except Exception as exc:  # noqa: BLE001
        return False, f"{type(exc).__name__}: {exc}"


def main() -> None:
    TMP_DIR.mkdir(parents=True, exist_ok=True)
    PDF_DIR.mkdir(parents=True, exist_ok=True)
    FAILED_DIR.mkdir(parents=True, exist_ok=True)

    manifest = json.loads(RAW_MANIFEST.read_text(encoding="utf-8"))
    converted = 0
    failed = []

    for item in manifest:
        raw_path = Path(item["raw_path"])
        pdf_path = PDF_DIR / item["school"] / normalize_pdf_name(item["member"])
        pdf_path.parent.mkdir(parents=True, exist_ok=True)

        if pdf_path.exists() and pdf_path.stat().st_size > 0:
            converted += 1
            continue

        if item["suffix"] == ".pdf":
            shutil.copyfile(raw_path, pdf_path)
            converted += 1
            continue

        ok, error = convert_hwp_like_to_pdf(raw_path, pdf_path)
        if ok:
            converted += 1
        else:
            failed.append(
                {
                    "school": item["school"],
                    "member": item["member"],
                    "raw_path": str(raw_path),
                    "error": error,
                }
            )
            failed_pdf = FAILED_DIR / item["school"] / normalize_pdf_name(item["member"])
            failed_pdf.parent.mkdir(parents=True, exist_ok=True)
            failed_pdf.write_text(error, encoding="utf-8")

    summary = {
        "total": len(manifest),
        "converted": converted,
        "failed_count": len(failed),
        "failed": failed,
        "pdf_dir": str(PDF_DIR),
        "failed_dir": str(FAILED_DIR),
    }
    (ROOT / "outputs" / "adiga_2028_pdf_summary.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
