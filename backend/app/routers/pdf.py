import mimetypes
import os
import shutil
import time
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, Query, UploadFile, BackgroundTasks, Depends
from fastapi.responses import FileResponse, Response
from sqlalchemy.orm import Session
from pypdf import PdfWriter

from app.core.db import get_db
from app.helpers.resume_data import get_resume_docx
from app.helpers.file_converter import convert_file
from app.helpers.cover_letter_builder import generate_cover_letter_docx
from app.schemas.pdf import CoverLetterFileRequest, MergeFilesRequest

router = APIRouter()

BASE_DIR = Path(__file__).resolve().parents[2]
UPLOADS_DIR = BASE_DIR / "templates"
TMP_DIR = BASE_DIR / "tmp"

UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
TMP_DIR.mkdir(parents=True, exist_ok=True)


def save_upload_file(upload_file: UploadFile, destination: Path) -> None:
    with destination.open("wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)

def cleanup_files(*file_paths: str | None) -> None:
    for file_path in file_paths:
        if not file_path:
            continue
        try:
            Path(file_path).unlink(missing_ok=True)
        except Exception as error:
            print(f"Cleanup failed for {file_path}: {error}")

@router.post("/file-cover-letter")
def create_cover_letter(payload: CoverLetterFileRequest):
    try:
        docx_buffer = generate_cover_letter_docx(
            email=payload.email,
            company=payload.company,
            content=payload.content,
        )

        return Response(
            content=docx_buffer,
            media_type=(
                "application/vnd.openxmlformats-officedocument."
                "wordprocessingml.document"
            ),
            headers={
                "Content-Disposition": 'attachment; filename="Cover Letter.docx"'
            },
        )

    except Exception as error:
        print("Error generating cover letter DOCX:", error)
        raise HTTPException(status_code=500, detail=str(error))


@router.delete("/delete-file")
def delete_file(id: str = Query(...)):
    try:
        if not id:
            raise HTTPException(
                status_code=400,
                detail="Missing 'id' query parameter.",
            )

        files = os.listdir(UPLOADS_DIR)
        file_to_delete = next((file for file in files if id in file), None)

        if not file_to_delete:
            raise HTTPException(status_code=404, detail="File not found.")

        file_path = UPLOADS_DIR / file_to_delete
        file_path.unlink()

        return {"message": "File deleted successfully", "id": id}
    except HTTPException:
        raise
    except Exception as error:
        print("Error deleting resume file:", error)
        raise HTTPException(status_code=500, detail="Error deleting resume file")


@router.post("/upload-other-files")
def upload_other_files(
    other_files: UploadFile = File(..., alias="other-files"),
    id: str = Query(...),
):
    try:
        if not other_files.filename:
            raise HTTPException(status_code=400, detail="No file uploaded.")

        if not id:
            raise HTTPException(
                status_code=400,
                detail="Missing file ID in query parameters",
            )

        ext = Path(other_files.filename).suffix
        final_name = f"{Path(other_files.filename).stem}-{id}{ext}"
        destination = UPLOADS_DIR / final_name
        save_upload_file(other_files, destination)

        return {
            "uid": id,
            "name": other_files.filename,
            "status": "done",
            "type": other_files.content_type,
        }
    except HTTPException:
        raise
    except Exception as error:
        print("Error uploading other file:", error)
        raise HTTPException(status_code=500, detail="Error uploading other file")


@router.get("/other-files")
def get_other_files():
    try:
        files = os.listdir(UPLOADS_DIR)
        other_files = [
            file
            for file in files
        ]

        response_data = [
            {
                "uid": filename,
                "name": filename,
                "status": "done",
                "type": mimetypes.guess_type(filename)[0] or "application/octet-stream",
            }
            for filename in other_files
        ]

        return response_data
    except Exception as error:
        print("Error getting other files:", error)
        raise HTTPException(status_code=500, detail="Error getting other files")


@router.post("/merged")
def get_merge_files(
    payload: MergeFilesRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    temp_paths: list[str] = []

    try:
        stamp = int(time.time() * 1000)

        # Resume: generate DOCX in memory, write to tmp, convert to PDF
        resume_docx_path = TMP_DIR / f"resume-{stamp}.docx"
        resume_docx_path.write_bytes(get_resume_docx(db, payload.id))
        temp_paths.append(str(resume_docx_path))

        resume_pdf_path = convert_file(str(resume_docx_path))
        temp_paths.append(resume_pdf_path)

        merger = PdfWriter()
        merger.append(resume_pdf_path)

        # Cover letter (optional)
        if payload.coverletter == 1:
            if not payload.email or not payload.company or not payload.content:
                raise HTTPException(
                    status_code=400,
                    detail="Missing required fields for cover letter generation",
                )

            cover_docx_path = TMP_DIR / f"cover-letter-{stamp}.docx"
            cover_docx_path.write_bytes(
                generate_cover_letter_docx(
                    email=payload.email,
                    company=payload.company,
                    content=payload.content,
                )
            )
            temp_paths.append(str(cover_docx_path))

            cover_pdf_path = convert_file(str(cover_docx_path))
            temp_paths.append(cover_pdf_path)
            merger.append(cover_pdf_path)

        # Transcript (optional, still an uploaded PDF)
        transcript_file = next(
            (
                f for f in os.listdir(UPLOADS_DIR)
                if "transcript" in f.lower() and f.lower().endswith(".pdf")
            ),
            None,
        )
        if transcript_file:
            merger.append(str(UPLOADS_DIR / transcript_file))

        merged_pdf_path = str(TMP_DIR / f"merged-{stamp}.pdf")
        merger.write(merged_pdf_path)
        merger.close()
        temp_paths.append(merged_pdf_path)

        background_tasks.add_task(cleanup_files, *temp_paths)

        return FileResponse(
            path=merged_pdf_path,
            media_type="application/pdf",
            filename="merged.pdf",
        )

    except HTTPException:
        cleanup_files(*temp_paths)
        raise
    except Exception as error:
        print("Error merging files:", error)
        cleanup_files(*temp_paths)
        raise HTTPException(status_code=500, detail="Error merging files")