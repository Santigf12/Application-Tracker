"""
resume_data.py
Shared helpers for turning the DB profile into a resume DOCX.

Used by both /api/resume/generate and /api/pdf/merged so the two
endpoints always build the resume the same way.
"""

import json

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.personal import EDUCATION, PERSONAL, PUBLICATIONS
from app.helpers.profile_data import fetch_full_profile
from app.helpers.resume_builder import build_resume


def build_pool(profile: dict, include_publications: bool = True) -> dict:
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


def build_default_manifest(profile: dict) -> dict:
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


def get_resume_docx(db: Session, application_id: str | None = None) -> bytes:
    """
    Build a resume DOCX and return the raw bytes.

    If application_id has a saved tailored resume, use it. Otherwise fall
    back to the default manifest (everything in the profile).
    """
    profile = fetch_full_profile(db)
    manifest = build_default_manifest(profile)
    include_publications = True

    if application_id:
        row = db.execute(
            text("""
                SELECT include_publications, manifest
                FROM tailored_resumes
                WHERE job_application_id = :id
            """),
            {"id": application_id},
        ).fetchone()

        if row:
            saved = row._mapping["manifest"]
            if isinstance(saved, str):
                saved = json.loads(saved)

            # Saved manifests only contain experiences/projects, so keep the
            # default skill_groups for any key that's missing.
            manifest = {**manifest, **saved}
            include_publications = bool(row._mapping["include_publications"])

    pool = build_pool(profile, include_publications=include_publications)
    return build_resume(manifest, pool)