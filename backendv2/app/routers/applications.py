from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.schemas.applications import (
    ApplicationCreate,
    ApplicationUpdate,
    CoverLetterSave,
)

router = APIRouter()


@router.get("/")
def get_all_applications(db: Session = Depends(get_db)):
    try:
        query = text("""
            SELECT 
                id, 
                title, 
                company, 
                location, 
                length, 
                CAST(added AS CHAR) AS added, 
                CAST(applied AS CHAR) AS applied, 
                status, 
                posting
            FROM job_applications;
        """)
        result = db.execute(query)
        rows = [dict(row._mapping) for row in result]
        return rows
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
                CAST(added AS CHAR) AS added,
                CAST(applied AS CHAR) AS applied,
                status, 
                posting,
                coverletter
            FROM job_applications
            WHERE id = :id;
        """)
        result = db.execute(query, {"id": id}).fetchone()

        if not result:
            raise HTTPException(status_code=404, detail="Application not found")

        return dict(result._mapping)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/")
def create_application(payload: ApplicationCreate, db: Session = Depends(get_db)):
    try:
        query = text("""
            INSERT INTO job_applications (
                title, company, location, length, url, posting, status
            )
            VALUES (
                :title, :company, :location, :length, :url, :posting, :status
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
                added = :added
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
                "applied": payload.applied,
                "added": payload.added,
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
            "applied": payload.applied,
            "added": payload.added,
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