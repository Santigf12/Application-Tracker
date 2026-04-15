import io
import os
import zipfile
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parents[2]
TEMPLATE_PATH = BASE_DIR / "templates" / "Cover_Letter_Template.odt"
OUTPUT_PATH = BASE_DIR / "output"

OUTPUT_PATH.mkdir(parents=True, exist_ok=True)


def escape_xml(text: str) -> str:
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
        .replace("'", "&apos;")
    )


def generate_cover_letter_odt(email: str, company: str, content: str) -> bytes:
    try:
        if not TEMPLATE_PATH.exists():
            raise FileNotFoundError(f"Template not found: {TEMPLATE_PATH}")

        with open(TEMPLATE_PATH, "rb") as f:
            template_bytes = f.read()

        input_zip = zipfile.ZipFile(io.BytesIO(template_bytes), "r")
        output_buffer = io.BytesIO()

        escaped_content = escape_xml(content)
        content_with_line_breaks = (
            escaped_content
            .replace("\n\n", "<text:line-break/><text:line-break/>")
            .replace("\n", "<text:line-break/>")
        )

        with zipfile.ZipFile(output_buffer, "w", zipfile.ZIP_DEFLATED) as output_zip:
            for item in input_zip.infolist():
                file_data = input_zip.read(item.filename)

                if item.filename == "content.xml":
                    content_xml = file_data.decode("utf-8")
                    content_xml = (
                        content_xml.replace("##EMAIL##", escape_xml(email))
                        .replace("##COMPANY##", escape_xml(company))
                        .replace("##CONTENT##", content_with_line_breaks)
                    )
                    output_zip.writestr(item, content_xml.encode("utf-8"))
                else:
                    output_zip.writestr(item, file_data)

        return output_buffer.getvalue()

    except Exception as error:
        print("Error generating cover letter:", error)
        raise RuntimeError("Failed to generate ODT")