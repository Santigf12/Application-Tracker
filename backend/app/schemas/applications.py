from typing import Optional
from pydantic import BaseModel


class ApplicationCreate(BaseModel):
    title: str
    company: str
    location: Optional[str] = None
    length: Optional[str] = None
    url: Optional[str] = None
    posting: Optional[str] = None
    status: Optional[str] = None


class ApplicationUpdate(BaseModel):
    title: str
    company: str
    location: Optional[str] = None
    length: Optional[str] = None
    url: Optional[str] = None
    posting: Optional[str] = None
    status: Optional[str] = None
    applied: Optional[str] = None
    added: Optional[str] = None


class CoverLetterSave(BaseModel):
    content: str