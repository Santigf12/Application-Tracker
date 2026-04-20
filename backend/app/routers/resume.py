from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from typing import Optional
from io import BytesIO

from app.helpers.resume_builder import build_resume
from app.core.db import get_db

router = APIRouter()


# ── Request / response models ─────────────────────────────────────────────────

class SkillGroupManifest(BaseModel):
    id: str
    skills: list[str]


class ExperienceManifest(BaseModel):
    id: str
    bullets: list[str]


class ProjectManifest(BaseModel):
    id: str
    include: bool = True
    bullets: list[str]


class ResumeRequest(BaseModel):
    """
    Optional body. If omitted entirely, the route pulls the full profile
    from the database and includes everything (useful as a baseline).
    """
    skill_groups: Optional[list[SkillGroupManifest]] = None
    experiences: Optional[list[ExperienceManifest]] = None
    projects: Optional[list[ProjectManifest]] = None
    include_publications: bool = True


# ── Hardcoded personal info ───────────────────────────────────────────────────

PERSONAL = {
    "name": "Santiago Fuentes",
    "phone": "(825) 365-0075",
    "email": "jobs@fuentes.it.com",
    "location": "Calgary, Alberta, T3C 1N6",
    "links": [
        {"label": "GitHub", "url": "https://github.com/Santigf12"},
        {"label": "Personal", "url": "https://santigf12.github.io/"},
    ],
}

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


# ── DB helpers ────────────────────────────────────────────────────────────────

def _fetch_full_profile(db: Session) -> dict:
    skill_groups = [
        dict(row._mapping)
        for row in db.execute(text("""
            SELECT id, title, position
            FROM skill_groups
            ORDER BY position ASC, title ASC
        """))
    ]
    for group in skill_groups:
        rows = db.execute(text("""
            SELECT id, name, position
            FROM skills
            WHERE skill_group_id = :gid
            ORDER BY position ASC, name ASC
        """), {"gid": group["id"]})
        group["skills"] = [dict(r._mapping) for r in rows]

    experiences = [
        dict(row._mapping)
        for row in db.execute(text("""
            SELECT id, title, company, location, start_date, end_date, description, position
            FROM experiences
            ORDER BY position ASC, start_date DESC
        """))
    ]
    for exp in experiences:
        rows = db.execute(text("""
            SELECT id, content, position
            FROM exp_bullets
            WHERE experience_id = :eid
            ORDER BY position ASC
        """), {"eid": exp["id"]})
        exp["bullets"] = [dict(r._mapping) for r in rows]

    projects = [
        dict(row._mapping)
        for row in db.execute(text("""
            SELECT id, name, start_date, end_date, stack, links, description, position
            FROM projects
            ORDER BY position ASC, start_date DESC
        """))
    ]
    for proj in projects:
        rows = db.execute(text("""
            SELECT id, content, position
            FROM proj_bullets
            WHERE project_id = :pid
            ORDER BY position ASC
        """), {"pid": proj["id"]})
        proj["bullets"] = [dict(r._mapping) for r in rows]

    return {
        "skill_groups": skill_groups,
        "experiences": experiences,
        "projects": projects,
    }


def _build_pool(profile: dict, include_publications: bool = True) -> dict:
    pool = {
        "personal": PERSONAL,
        "education": EDUCATION,
        "publications": PUBLICATIONS if include_publications else [],
        "skill_groups": {},
        "skills": {},
        "experiences": {},
        "exp_bullets": {},
        "projects": {},
        "proj_bullets": {},
    }

    for group in profile["skill_groups"]:
        pool["skill_groups"][group["id"]] = {"title": group["title"]}
        for skill in group["skills"]:
            pool["skills"][skill["id"]] = {"name": skill["name"]}

    for exp in profile["experiences"]:
        pool["experiences"][exp["id"]] = {
            "title": exp["title"],
            "company": exp["company"],
            "location": exp.get("location", ""),
            "start_date": exp["start_date"],
            "end_date": exp["end_date"],
            "description": exp.get("description", ""),
        }
        for bullet in exp["bullets"]:
            pool["exp_bullets"][bullet["id"]] = {"content": bullet["content"]}

    for proj in profile["projects"]:
        pool["projects"][proj["id"]] = {
            "name": proj["name"],
            "start_date": proj.get("start_date"),
            "end_date": proj.get("end_date"),
            "stack": proj.get("stack"),
            "links": proj.get("links"),
            "description": proj.get("description", ""),
        }
        for bullet in proj["bullets"]:
            pool["proj_bullets"][bullet["id"]] = {"content": bullet["content"]}

    return pool


def _build_default_manifest(profile: dict) -> dict:
    return {
        "skill_groups": [
            {
                "id": group["id"],
                "skills": [s["id"] for s in group["skills"]],
            }
            for group in profile["skill_groups"]
        ],
        "experiences": [
            {
                "id": exp["id"],
                "bullets": [b["id"] for b in exp["bullets"]],
            }
            for exp in profile["experiences"]
        ],
        "projects": [
            {
                "id": proj["id"],
                "include": True,
                "bullets": [b["id"] for b in proj["bullets"]],
            }
            for proj in profile["projects"]
        ],
    }


@router.post("/generate")
def generate_resume(
    req: Optional[ResumeRequest] = None,
    db: Session = Depends(get_db),
):
    try:
        profile = _fetch_full_profile(db)
        include_publications = True if req is None else req.include_publications
        pool = _build_pool(profile, include_publications=include_publications)

        no_manifest = (
            req is None
            or (
                req.skill_groups is None
                and req.experiences is None
                and req.projects is None
            )
        )

        if no_manifest:
            manifest = _build_default_manifest(profile)
        else:
            default_manifest = _build_default_manifest(profile)
            manifest = {
                "skill_groups": (
                    [sg.model_dump() for sg in req.skill_groups]
                    if req.skill_groups is not None
                    else default_manifest["skill_groups"]
                ),
                "experiences": (
                    [e.model_dump() for e in req.experiences]
                    if req.experiences is not None
                    else default_manifest["experiences"]
                ),
                "projects": (
                    [p.model_dump() for p in req.projects]
                    if req.projects is not None
                    else default_manifest["projects"]
                ),
            }

        docx_bytes = build_resume(manifest, pool)

        return StreamingResponse(
            BytesIO(docx_bytes),
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": 'attachment; filename="resume.docx"'},
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))