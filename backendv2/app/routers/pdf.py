import mimetypes
import os
import shutil
import time
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, Query, UploadFile, BackgroundTasks
from fastapi.responses import FileResponse, Response
from pypdf import PdfWriter

from app.helpers.file_converter import convert_file
from app.helpers.template_gen import generate_cover_letter_odt
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

def cleanup_files(*file_paths: str) -> None:
    for file_path in file_paths:
        if not file_path:
            continue
        try:
            path = Path(file_path)
            if path.exists():
                path.unlink()
        except Exception as error:
            print(f"Cleanup failed for {file_path}: {error}")


@router.post("/file-cover-letter")
def create_cover_letter(payload: CoverLetterFileRequest):
    try:
        odt_buffer = generate_cover_letter_odt(
            payload.email,
            payload.company,
            payload.content,
        )

        return Response(
            content=odt_buffer,
            media_type="application/vnd.oasis.opendocument.text",
            headers={
                "Content-Disposition": 'attachment; filename="Cover Letter.odt"'
            },
        )
    except Exception as error:
        print("Error generating cover letter ODT:", error)
        raise HTTPException(status_code=500, detail=str(error))

@router.post("/upload-resume")
def upload_resume(
    resume_file: UploadFile = File(..., alias="resume-file"),
    id: str = Query(...),
):
    try:
        if not id:
            raise HTTPException(
                status_code=400,
                detail="Missing file ID in query parameters",
            )

        ext = Path(resume_file.filename).suffix
        original_name = resume_file.filename or "resume-file"

        if "Resume" in original_name:
            final_name = f"resume-file-{id}{ext}"
        else:
            final_name = f"{Path(original_name).stem}-{id}{ext}"

        destination = UPLOADS_DIR / final_name
        save_upload_file(resume_file, destination)

        return {
            "uid": id,
            "name": original_name,
            "status": "done",
            "type": resume_file.content_type,
        }
    except HTTPException:
        raise
    except Exception as error:
        print("Error uploading Resume:", error)
        raise HTTPException(status_code=500, detail="Error uploading Resume")

@router.get("/resume-files")
def get_resume_files():
    try:
        files = os.listdir(UPLOADS_DIR)

        resume_files = [file for file in files if file.startswith("resume-file-")]

        response_data = []
        for filename in resume_files:
            uid = filename.split("resume-file-")[1].split(".")[0]
            response_data.append(
                {
                    "uid": uid,
                    "name": "Santiago Fuentes Resume.odt",
                    "status": "done",
                    "type": mimetypes.guess_type(filename)[0] or "application/octet-stream",
                }
            )

        return response_data
    except Exception as error:
        print("Error getting resume files:", error)
        raise HTTPException(status_code=500, detail="Error getting resume files")


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


@router.post("/upload-cover-letter-template")
def upload_cover_letter_template(
    cover_letter_template: UploadFile = File(..., alias="cover-letter-template"),
):
    try:
        if not cover_letter_template.filename:
            raise HTTPException(status_code=400, detail="No file uploaded.")

        final_name = "Cover_Letter_Template.odt"
        destination = UPLOADS_DIR / final_name
        save_upload_file(cover_letter_template, destination)

        return {
            "uid": cover_letter_template.filename,
            "name": cover_letter_template.filename,
            "status": "done",
            "type": cover_letter_template.content_type,
        }
    except HTTPException:
        raise
    except Exception as error:
        print("Error uploading cover letter template:", error)
        raise HTTPException(
            status_code=500,
            detail="Error uploading cover letter template",
        )


@router.get("/cover-letter-template")
def get_cover_letter_template():
    try:
        files = os.listdir(UPLOADS_DIR)
        cover_letter_templates = [
            file for file in files if file.startswith("Cover_Letter_Template")
        ]

        response_data = [
            {
                "uid": filename,
                "name": filename,
                "status": "done",
                "type": mimetypes.guess_type(filename)[0] or "application/octet-stream",
            }
            for filename in cover_letter_templates
        ]

        return response_data
    except Exception as error:
        print("Error getting cover letter template:", error)
        raise HTTPException(
            status_code=500,
            detail="Error getting cover letter template",
        )


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
            if not file.startswith("resume-file-")
            and not file.startswith("Cover_Letter_Template")
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
):
    tmp_resume_odt_path = None
    resume_pdf_path = None
    cover_letter_odt_path = None
    cover_letter_pdf_path = None
    merged_pdf_path = None

    try:
        email = payload.email
        company = payload.company
        content = payload.content
        coverletter = payload.coverletter

        if coverletter is None:
            raise HTTPException(status_code=400, detail="Missing coverLetter flag (0 or 1)")

        files = os.listdir(UPLOADS_DIR)

        resume_file = next(
            (
                file for file in files
                if "resume" in file.lower() and file.lower().endswith(".odt")
            ),
            None,
        )

        if not resume_file:
            raise HTTPException(
                status_code=404,
                detail="Resume file not found, please upload a resume",
            )

        transcript_file = next(
            (
                file for file in files
                if "transcript" in file.lower() and file.lower().endswith(".pdf")
            ),
            None,
        )

        resume_path = UPLOADS_DIR / resume_file
        tmp_resume_odt_path = TMP_DIR / f"resume-temp-{int(time.time() * 1000)}{resume_path.suffix}"
        shutil.copy2(resume_path, tmp_resume_odt_path)

        resume_pdf_path = convert_file(str(tmp_resume_odt_path))

        merger = PdfWriter()
        merger.append(resume_pdf_path)

        if coverletter == 1:
            if not email or not company or not content:
                raise HTTPException(
                    status_code=400,
                    detail="Missing required fields for cover letter generation",
                )

            odt_buffer = generate_cover_letter_odt(email, company, content)

            cover_letter_odt_path = str(
                TMP_DIR / f"cover-letter-{int(time.time() * 1000)}.odt"
            )
            with open(cover_letter_odt_path, "wb") as f:
                f.write(odt_buffer)

            cover_letter_pdf_path = convert_file(cover_letter_odt_path)
            merger.append(cover_letter_pdf_path)

        if transcript_file:
            transcript_path = str(UPLOADS_DIR / transcript_file)
            merger.append(transcript_path)

        merged_pdf_path = str(TMP_DIR / f"merged-{int(time.time() * 1000)}.pdf")
        merger.write(merged_pdf_path)
        merger.close()

        background_tasks.add_task(
            cleanup_files,
            str(tmp_resume_odt_path) if tmp_resume_odt_path else None,
            resume_pdf_path,
            cover_letter_odt_path,
            cover_letter_pdf_path,
            merged_pdf_path,
        )

        return FileResponse(
            path=merged_pdf_path,
            media_type="application/pdf",
            filename="merged.pdf",
        )

    except HTTPException:
        raise
    except Exception as error:
        print("Error merging files:", error)
        raise HTTPException(status_code=500, detail="Error merging files")