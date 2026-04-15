from pydantic import BaseModel
from typing import Optional


class CoverLetterFileRequest(BaseModel):
    id: Optional[str] = None
    email: str
    company: str
    content: str


class MergeFilesRequest(BaseModel):
    email: Optional[str] = None
    company: Optional[str] = None
    content: Optional[str] = None
    coverletter: int