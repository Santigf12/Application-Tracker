import json
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.schemas.applications import (
    ApplicationCreate,
    ApplicationUpdate,
    CoverLetterSave,
    ResumeSave,
    ResumeManifest,
)

router = APIRouter()

DATETIME_FIELDS = ("added", "applied")


# ── Time helpers ──────────────────────────────────────────────────────────────
# Contract: the database stores UTC (session time_zone is pinned to +00:00 in
# core/db.py). The API sends and receives ISO 8601 with an explicit zone, and
# the browser converts to the viewer's local time.

def utc_now_naive() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def to_utc_naive(value: datetime | None) -> datetime | None:
    """Normalize an incoming datetime to naive UTC for storage."""
    if value is None:
        return None
    if value.tzinfo is None:
        # No zone supplied: assume it is already UTC.
        return value
    return value.astimezone(timezone.utc).replace(tzinfo=None)


def to_iso_utc(value: datetime | None) -> str | None:
    """Serialize a naive-UTC datetime from the DB as e.g. 2026-11-26T17:48:45Z."""
    if value is None:
        return None
    return value.strftime("%Y-%m-%dT%H:%M:%SZ")


def serialize_row(row: dict) -> dict:
    for field in DATETIME_FIELDS:
        if field in row:
            row[field] = to_iso_utc(row[field])
    return row


# ── Applications ──────────────────────────────────────────────────────────────

@router.get("/")
def get_all_applications(db: Session = Depends(get_db)):
    try:
        query = text("""
            SELECT 
                id, 
                title, 
                company, 
                location,
                url 
                length, 
                added, 
                applied, 
                status, 
                posting
            FROM job_applications;
        """)
        result = db.execute(query)
        return [serialize_row(dict(row._mapping)) for row in result]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{id}")
def get_application_by_id(id: str, db: Session = Depends(get_db)):
    try:
        query = text("""
            SELECT 
                id, 
                title, 
                company, 
                location, 
                url,
                length, 
                added,
                applied,
                status, 
                posting,
                coverletter,
                resume
            FROM job_applications
            WHERE id = :id;
        """)
        result = db.execute(query, {"id": id}).fetchone()

        if not result:
            raise HTTPException(status_code=404, detail="Application not found")

        return serialize_row(dict(result._mapping))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/")
def create_application(payload: ApplicationCreate, db: Session = Depends(get_db)):
    try:
        query = text("""
            INSERT INTO job_applications (
                title, company, location, length, url, posting, status, added
            )
            VALUES (
                :title, :company, :location, :length, :url, :posting, :status, :added
            );
        """)

        db.execute(
            query,
            {
                "title": payload.title,
                "company": payload.company,
                "location": payload.location,
                "length": payload.length,
                "url": payload.url,
                "posting": payload.posting,
                "status": payload.status,
                "added": utc_now_naive(),
            },
        )
        db.commit()

        return {"success": True, "message": "Application created"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{id}")
def update_application(
    id: str,
    payload: ApplicationUpdate,
    db: Session = Depends(get_db),
):
    try:
        applied = to_utc_naive(payload.applied)
        added = to_utc_naive(payload.added)

        query = text("""
            UPDATE job_applications 
            SET
                title = :title,
                company = :company,
                location = :location,
                length = :length,
                url = :url,
                posting = :posting,
                status = :status,
                applied = :applied,
                added = COALESCE(:added, added)
            WHERE id = :id;
        """)

        db.execute(
            query,
            {
                "id": id,
                "title": payload.title,
                "company": payload.company,
                "location": payload.location,
                "length": payload.length,
                "url": payload.url,
                "posting": payload.posting,
                "status": payload.status,
                "applied": applied,
                "added": added,
            },
        )
        db.commit()

        return {
            "title": payload.title,
            "company": payload.company,
            "location": payload.location,
            "length": payload.length,
            "url": payload.url,
            "posting": payload.posting,
            "status": payload.status,
            "applied": to_iso_utc(applied),
            "added": to_iso_utc(added),
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{id}")
def delete_application(id: str, db: Session = Depends(get_db)):
    try:
        query = text("""
            DELETE FROM job_applications
            WHERE id = :id;
        """)
        db.execute(query, {"id": id})
        db.commit()

        return {"success": True, "message": "Application deleted"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{id}")
def save_cover_letter(
    id: str,
    payload: CoverLetterSave,
    db: Session = Depends(get_db),
):
    if not payload.content:
        raise HTTPException(status_code=400, detail="Content cannot be empty")

    try:
        query1 = text("""
            INSERT INTO cover_letters (id, content)
            VALUES (:id, :content)
            ON DUPLICATE KEY UPDATE content = VALUES(content);
        """)

        query2 = text("""
            UPDATE job_applications
            SET coverletter = 1
            WHERE id = :id;
        """)

        db.execute(query1, {"id": id, "content": payload.content})
        db.execute(query2, {"id": id})
        db.commit()

        return {"success": True, "message": "Cover letter saved"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/cover-letter/{id}")
def get_cover_letter(id: str, db: Session = Depends(get_db)):
    try:
        query = text("""
            SELECT content
            FROM cover_letters
            WHERE id = :id;
        """)
        result = db.execute(query, {"id": id}).fetchone()

        if not result:
            return ""

        return result._mapping["content"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{id}/resume")
def save_resume(
    id: str,
    payload: ResumeSave,
    db: Session = Depends(get_db),
):
    manifest_dict = payload.manifest.model_dump(exclude_none=True)

    if not manifest_dict:
        raise HTTPException(status_code=400, detail="Manifest cannot be empty")

    try:
        query1 = text("""
            INSERT INTO tailored_resumes (job_application_id, include_publications, manifest)
            VALUES (:job_application_id, :include_publications, CAST(:manifest AS JSON))
            ON DUPLICATE KEY UPDATE
                include_publications = VALUES(include_publications),
                manifest = VALUES(manifest);
        """)

        query2 = text("""
            UPDATE job_applications
            SET resume = 1
            WHERE id = :id;
        """)

        db.execute(
            query1,
            {
                "job_application_id": id,
                "include_publications": 1 if payload.include_publications else 0,
                "manifest": json.dumps(manifest_dict),
            },
        )
        db.execute(query2, {"id": id})
        db.commit()

        return {"success": True, "message": "Resume saved"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/resume/{id}")
def get_resume(id: str, db: Session = Depends(get_db)):
    try:
        query = text("""
            SELECT include_publications, manifest
            FROM tailored_resumes
            WHERE job_application_id = :id;
        """)
        result = db.execute(query, {"id": id}).fetchone()

        if not result:
            return None

        manifest = result._mapping["manifest"]
        if isinstance(manifest, str):
            manifest = json.loads(manifest)

        return {
            "include_publications": bool(result._mapping["include_publications"]),
            "manifest": manifest,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))