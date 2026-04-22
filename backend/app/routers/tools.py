import json
import os
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException
from openai import OpenAI
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.helpers.scraper import scrape_job_posting
from app.schemas.tools import (
    CoverLetterRequest,
    ScrapePostingRequest,
    TailoredProfileRequest,
)

load_dotenv()

router = APIRouter()

BASE_DIR = Path(__file__).resolve().parents[2]
TEMPLATES_DIR = BASE_DIR / "templates"

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_ORG_ID = os.getenv("OPENAI_ORG_ID")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-5.4-mini")

if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY is not set.")

openai_client = OpenAI(
    api_key=OPENAI_API_KEY,
    organization=OPENAI_ORG_ID or None,
)

EDUCATION = [
    {
        "degree": "Bachelor of Science in Software Engineering",
        "institution": "Schulich School of Engineering, University of Calgary | Calgary, Alberta",
        "date": "Expected to graduate in April 2026.",
    }
]

PUBLICATIONS = [
    {
        "citation": (
            "Atkin, D., Fuentes, S., & Yadid-Pecht, O. (2025). "
            "Women in Entrepreneurship: Effective Strategies for Online "
            "Training and Development. International Journal of Innovative "
            "Business Strategies, 11(1), 782–789."
        ),
        "url": "https://doi.org/10.20533/ijibs.2046.3626.2025.0096",
    }
]

TAILOR_PROFILE_SCHEMA = {
    "type": "object",
    "additionalProperties": False,
    "properties": {
        "include_publication": {"type": "boolean"},
        "selected_experiences": {
            "type": "array",
            "items": {
                "type": "object",
                "additionalProperties": False,
                "properties": {
                    "id": {"type": "string"},
                    "selected_bullet_ids": {
                        "type": "array",
                        "items": {"type": "string"},
                    },
                },
                "required": ["id", "selected_bullet_ids"],
            },
        },
        "selected_projects": {
            "type": "array",
            "items": {
                "type": "object",
                "additionalProperties": False,
                "properties": {
                    "id": {"type": "string"},
                    "selected_bullet_ids": {
                        "type": "array",
                        "items": {"type": "string"},
                    },
                },
                "required": ["id", "selected_bullet_ids"],
            },
        },
        "notes": {"type": "string"},
    },
    "required": [
        "include_publication",
        "selected_experiences",
        "selected_projects",
        "notes",
    ],
}


def extract_text_from_odt(odt_path: Path) -> str:
    try:
        with zipfile.ZipFile(odt_path, "r") as zf:
            content_xml = zf.read("content.xml")

        root = ET.fromstring(content_xml)
        namespaces = {
            "text": "urn:oasis:names:tc:opendocument:xmlns:text:1.0",
        }

        paragraphs: list[str] = []
        for node in root.findall(".//text:p", namespaces):
            text_value = "".join(node.itertext()).strip()
            if text_value:
                paragraphs.append(text_value)

        return "\n".join(paragraphs).strip()
    except Exception as error:
        raise RuntimeError(
            f"Failed to extract text from ODT '{odt_path.name}': {error}"
        ) from error


def get_latest_resume_file() -> Path:
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


def call_openai_text(prompt: str) -> str:
    try:
        response = openai_client.responses.create(
            model=OPENAI_MODEL,
            input=prompt,
        )

        content = response.output_text.strip()
        if not content:
            raise RuntimeError("OpenAI returned an empty response.")

        return content
    except Exception as error:
        raise RuntimeError(f"Failed to reach OpenAI: {error}") from error


def call_openai_json(prompt: str, schema: dict) -> dict:
    try:
        response = openai_client.responses.create(
            model=OPENAI_MODEL,
            input=prompt,
            text={
                "format": {
                    "type": "json_schema",
                    "name": "tailored_profile_selection",
                    "schema": schema,
                    "strict": True,
                }
            },
        )

        content = response.output_text.strip()
        if not content:
            raise RuntimeError("OpenAI returned an empty structured response.")

        return json.loads(content)
    except json.JSONDecodeError as error:
        raise RuntimeError(
            f"Failed to parse OpenAI JSON response: {error}"
        ) from error
    except Exception as error:
        raise RuntimeError(f"Failed to reach OpenAI: {error}") from error


def clamp_selected_experiences(selected_experiences: list[dict]) -> list[dict]:
    total_bullets = 0
    clamped: list[dict] = []

    for item in selected_experiences:
        if "id" not in item:
            continue

        bullet_ids = item.get("selected_bullet_ids", [])
        if total_bullets >= 6:
            break

        remaining = 6 - total_bullets
        trimmed = bullet_ids[:remaining]

        if not trimmed:
            continue

        clamped.append({
            "id": item["id"],
            "selected_bullet_ids": trimmed,
        })
        total_bullets += len(trimmed)

    return clamped


def clamp_selected_projects(selected_projects: list[dict]) -> list[dict]:
    clamped: list[dict] = []

    for item in selected_projects[:2]:
        if "id" not in item:
            continue

        bullet_ids = item.get("selected_bullet_ids", [])[:3]

        if not bullet_ids:
            continue

        clamped.append({
            "id": item["id"],
            "selected_bullet_ids": bullet_ids,
        })

    return clamped


def get_full_profile_data(db: Session) -> dict:
    skill_groups_query = text("""
        SELECT id, title, position
        FROM skill_groups
        ORDER BY position ASC, title ASC;
    """)
    skill_groups = [dict(row._mapping) for row in db.execute(skill_groups_query)]

    for group in skill_groups:
        skills_query = text("""
            SELECT id, skill_group_id, name, position
            FROM skills
            WHERE skill_group_id = :skill_group_id
            ORDER BY position ASC, name ASC;
        """)
        skills = db.execute(skills_query, {"skill_group_id": group["id"]})
        group["skills"] = [dict(row._mapping) for row in skills]

    experiences_query = text("""
        SELECT
            id,
            title,
            company,
            location,
            start_date,
            end_date,
            description,
            position
        FROM experiences
        ORDER BY position ASC, start_date DESC;
    """)
    experiences = [dict(row._mapping) for row in db.execute(experiences_query)]

    for exp in experiences:
        bullets_query = text("""
            SELECT id, experience_id, content, position
            FROM exp_bullets
            WHERE experience_id = :experience_id
            ORDER BY position ASC;
        """)
        bullets = db.execute(bullets_query, {"experience_id": exp["id"]})
        exp["bullets"] = [dict(row._mapping) for row in bullets]

    projects_query = text("""
        SELECT
            id,
            name,
            start_date,
            end_date,
            stack,
            links,
            description,
            position
        FROM projects
        ORDER BY position ASC, start_date DESC;
    """)
    projects = [dict(row._mapping) for row in db.execute(projects_query)]

    for project in projects:
        bullets_query = text("""
            SELECT id, project_id, content, position
            FROM proj_bullets
            WHERE project_id = :project_id
            ORDER BY position ASC;
        """)
        bullets = db.execute(bullets_query, {"project_id": project["id"]})
        project["bullets"] = [dict(row._mapping) for row in bullets]

    return {
        "education": EDUCATION,
        "publications": PUBLICATIONS,
        "skill_groups": skill_groups,
        "experiences": experiences,
        "projects": projects,
    }


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

        cover_letter = call_openai_text(prompt)
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


@router.post("/tailor-profile")
def tailor_profile(payload: TailoredProfileRequest, db: Session = Depends(get_db)):
    try:
        if not payload.position or not payload.jobPosting:
            raise HTTPException(
                status_code=400,
                detail="Position and job posting are required",
            )

        profile = get_full_profile_data(db)

        prompt = f"""
You are helping tailor a resume to a specific job posting.

Your task:
- Review the candidate profile and the target job posting.
- Choose the most relevant experience bullets and project bullets.
- Decide whether the publication should be included.
- If including the publication makes sense, it is acceptable to include fewer bullets elsewhere.
- Prefer relevance and strength over quantity.
- Do not invent any content.
- Only select from the provided data.

Hard constraints:
- Do NOT choose skill groups. Skill groups will always be included separately.
- Select experience bullets only from the provided experience bullet IDs.
- Select project bullets only from the provided project bullet IDs.
- Select at most 6 experience bullets TOTAL across all experiences.
- Select at most 2 projects TOTAL.
- Select exactly 2 projects if 2 relevant projects are available.
- For this decision, treat infrastructure, deployment, databases, containerization, security, and backend application work as relevant for backend-leaning roles.
- Only select 1 project if a second project would clearly weaken the resume.
- Select at most 3 bullets per selected project.
- If the publication is not clearly relevant, set include_publication to false.
- Favor bullets that best match backend development, APIs, data/reporting, infrastructure, testing, debugging, deployment, documentation, and TypeScript/React when relevant to the posting.

Selection guidance:
- Prefer the strongest, most resume-worthy bullets.
- Exclude weak, redundant, or less relevant bullets.
- Keep only projects that strengthen the application for this job.
- Education is always included separately.

Return only valid JSON matching the required schema.

Target Position:
{payload.position}

Target Company:
{payload.company or ""}

Job Posting:
{payload.jobPosting}

Candidate Profile JSON:
{json.dumps(profile, ensure_ascii=False)}
        """.strip()

        decision = call_openai_json(prompt, TAILOR_PROFILE_SCHEMA)

        decision["selected_experiences"] = clamp_selected_experiences(
            decision.get("selected_experiences", [])
        )
        decision["selected_projects"] = clamp_selected_projects(
            decision.get("selected_projects", [])
        )

        include_publication = bool(decision.get("include_publication", False))

        selected_experience_map = {
            item["id"]: set(item.get("selected_bullet_ids", []))
            for item in decision.get("selected_experiences", [])
            if "id" in item
        }

        selected_project_map = {
            item["id"]: set(item.get("selected_bullet_ids", []))
            for item in decision.get("selected_projects", [])
            if "id" in item
        }

        tailored_experiences = []
        for exp in profile["experiences"]:
            if exp["id"] not in selected_experience_map:
                continue

            allowed_bullet_ids = selected_experience_map[exp["id"]]
            selected_bullets = [
                bullet for bullet in exp["bullets"]
                if bullet["id"] in allowed_bullet_ids
            ]

            if not selected_bullets:
                continue

            tailored_experiences.append({
                **exp,
                "bullets": selected_bullets,
            })

        tailored_projects = []
        for project in profile["projects"]:
            if project["id"] not in selected_project_map:
                continue

            allowed_bullet_ids = selected_project_map[project["id"]]
            selected_bullets = [
                bullet for bullet in project["bullets"]
                if bullet["id"] in allowed_bullet_ids
            ]

            if not selected_bullets:
                continue

            tailored_projects.append({
                **project,
                "bullets": selected_bullets,
            })

        return {
            "education": EDUCATION,
            "publications": PUBLICATIONS if include_publication else [],
            "skill_groups": profile["skill_groups"],
            "experiences": tailored_experiences,
            "projects": tailored_projects,
            "meta": {
                "position": payload.position,
                "company": payload.company,
                "include_publication": include_publication,
                "notes": decision.get("notes", ""),
                "model": OPENAI_MODEL,
            },
        }

    except HTTPException:
        raise
    except RuntimeError as error:
        print("Error tailoring profile:", error)
        raise HTTPException(status_code=500, detail=str(error))
    except Exception as error:
        print("Unexpected error tailoring profile:", error)
        raise HTTPException(status_code=500, detail="Unexpected server error")