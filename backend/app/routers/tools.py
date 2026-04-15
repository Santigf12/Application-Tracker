import os
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

import requests
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException

from app.helpers.scraper import scrape_job_posting
from app.schemas.tools import CoverLetterRequest, ScrapePostingRequest

load_dotenv()

router = APIRouter()

BASE_DIR = Path(__file__).resolve().parents[2]
TEMPLATES_DIR = BASE_DIR / "templates"

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.1:8b")
OLLAMA_NUM_CTX = int(os.getenv("OLLAMA_NUM_CTX", "4096"))
OLLAMA_NUM_PREDICT = int(os.getenv("OLLAMA_NUM_PREDICT", "700"))
OLLAMA_TEMPERATURE = float(os.getenv("OLLAMA_TEMPERATURE", "0.4"))

def extract_text_from_odt(odt_path: Path) -> str:
    """
    Read visible text from an ODT file by extracting paragraphs from content.xml.
    """
    try:
        with zipfile.ZipFile(odt_path, "r") as zf:
            content_xml = zf.read("content.xml")

        root = ET.fromstring(content_xml)

        namespaces = {
            "text": "urn:oasis:names:tc:opendocument:xmlns:text:1.0",
        }

        paragraphs: list[str] = []
        for node in root.findall(".//text:p", namespaces):
            text = "".join(node.itertext()).strip()
            if text:
                paragraphs.append(text)

        return "\n".join(paragraphs).strip()
    except Exception as error:
        raise RuntimeError(f"Failed to extract text from ODT '{odt_path.name}': {error}") from error


def get_latest_resume_file() -> Path:
    """
    Find the most recently modified resume file in templates/.
    Prefers files named resume-file-* to match your upload flow.
    """
    if not TEMPLATES_DIR.exists():
        raise FileNotFoundError("Templates directory does not exist.")

    candidates = sorted(
        TEMPLATES_DIR.glob("resume-file-*"),
        key=lambda p: p.stat().st_mtime,
        reverse=True,
    )

    if not candidates:
        raise FileNotFoundError("No uploaded resume file found in templates/.")

    return candidates[0]


def get_resume_info() -> str:
    resume_path = get_latest_resume_file()

    if resume_path.suffix.lower() == ".odt":
        resume_text = extract_text_from_odt(resume_path)
    elif resume_path.suffix.lower() in {".txt", ".md"}:
        resume_text = resume_path.read_text(encoding="utf-8").strip()
    else:
        raise RuntimeError(
            f"Unsupported resume format '{resume_path.suffix}'. "
            "For now, use .odt, .txt, or .md."
        )

    if not resume_text:
        raise RuntimeError(f"Resume file '{resume_path.name}' is empty.")

    return resume_text


def call_ollama(prompt: str) -> str:
    try:
        response = requests.post(
            f"{OLLAMA_BASE_URL}/api/generate",
            json={
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "num_ctx": OLLAMA_NUM_CTX,
                    "num_predict": OLLAMA_NUM_PREDICT,
                    "temperature": OLLAMA_TEMPERATURE,
                },
            },
            timeout=(10, 600),  # 10s connect, 10 min read
        )
        response.raise_for_status()
        data = response.json()

        content = (data.get("response") or "").strip()
        if not content:
            raise RuntimeError("Ollama returned an empty response.")

        return content
    except requests.RequestException as error:
        raise RuntimeError(f"Failed to reach Ollama: {error}") from error


@router.post("/cover-letter")
def generate_cover_letter_content(payload: CoverLetterRequest):
    try:
        company = payload.company
        position = payload.position
        job_posting = payload.jobPosting

        if not company or not job_posting:
            raise HTTPException(
                status_code=400,
                detail="Company and job posting details are required",
            )

        resume_info = get_resume_info()

        prompt = f"""
            You are an assistant that writes professional cover letters.

            Write a tailored cover letter for the job below.

            Rules:
            - Use the candidate's actual resume information provided below.
            - Keep it professional, specific, and concise.
            - Do not invent experience not supported by the resume.
            - Do not use placeholders like [Company Name] or [Your Name].
            - Return only the cover letter body text.

            Position Title:
            {position}

            Company Name:
            {company}

            Job Posting Information:
            {job_posting}

            Resume Information:
            {resume_info}
            """.strip()

        cover_letter = call_ollama(prompt)
        return {"content": cover_letter}

    except HTTPException:
        raise
    except FileNotFoundError as error:
        raise HTTPException(status_code=404, detail=str(error))
    except RuntimeError as error:
        print("Error generating cover letter:", error)
        raise HTTPException(status_code=500, detail=str(error))
    except Exception as error:
        print("Unexpected error generating cover letter:", error)
        raise HTTPException(status_code=500, detail="Unexpected server error")


@router.post("/scrape-posting")
def scrape_posting(payload: ScrapePostingRequest):
    try:
        url = str(payload.url)

        if not url:
            raise HTTPException(status_code=400, detail="URL is required")

        response = scrape_job_posting(url)
        return response

    except HTTPException:
        raise
    except Exception as error:
        print("Error scraping job posting:", error)
        raise HTTPException(status_code=500, detail=str(error))