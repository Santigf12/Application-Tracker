from typing import Optional
from pydantic import BaseModel
from datetime import datetime


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
    applied: Optional[datetime] = None
    added: Optional[datetime] = None


class CoverLetterSave(BaseModel):
    content: str

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


class ResumeManifest(BaseModel):
    skill_groups: Optional[list[SkillGroupManifest]] = None
    experiences: Optional[list[ExperienceManifest]] = None
    projects: Optional[list[ProjectManifest]] = None


class ResumeSave(BaseModel):
    include_publications: bool = False
    manifest: ResumeManifest