import os
import subprocess
from pathlib import Path


def convert_file(file_path: str) -> str:
    input_path = Path(file_path)

    if not input_path.exists():
        raise FileNotFoundError(f"Error: File not found - {file_path}")

    output_file_path = str(input_path.with_suffix(".pdf"))

    command = [
        "soffice",
        "--headless",
        "--convert-to",
        "pdf",
        str(input_path),
        "--outdir",
        str(input_path.parent),
    ]

    result = subprocess.run(
        command,
        capture_output=True,
        text=True,
    )

    if result.returncode != 0:
        raise RuntimeError(
            f"LibreOffice conversion error: {result.stderr or result.stdout}"
        )

    if not os.path.exists(output_file_path):
        raise RuntimeError("Conversion failed: Output PDF not found.")

    print(f"Successfully converted: {output_file_path}")
    return output_file_path