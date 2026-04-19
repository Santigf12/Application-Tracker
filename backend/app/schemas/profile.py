from typing import Optional, List
from pydantic import BaseModel


class SkillGroupCreate(BaseModel):
    title: str
    position: Optional[int] = 0


class SkillGroupUpdate(BaseModel):
    title: str
    position: Optional[int] = 0


class SkillCreate(BaseModel):
    skill_group_id: str
    name: str
    position: Optional[int] = 0


class SkillUpdate(BaseModel):
    skill_group_id: str
    name: str
    position: Optional[int] = 0


class ExpBulletCreate(BaseModel):
    content: str
    position: Optional[int] = 0


class ExpBulletUpdate(BaseModel):
    id: Optional[str] = None
    content: str
    position: Optional[int] = 0


class ExperienceCreate(BaseModel):
    title: str
    company: str
    location: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    description: Optional[str] = None
    position: Optional[int] = 0
    bullets: Optional[List[ExpBulletCreate]] = []


class ExperienceUpdate(BaseModel):
    title: str
    company: str
    location: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    description: Optional[str] = None
    position: Optional[int] = 0
    bullets: Optional[List[ExpBulletUpdate]] = []


class ProjBulletCreate(BaseModel):
    content: str
    position: Optional[int] = 0


class ProjBulletUpdate(BaseModel):
    id: Optional[str] = None
    content: str
    position: Optional[int] = 0


class ProjectCreate(BaseModel):
    name: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    stack: Optional[str] = None
    links: Optional[str] = None
    description: Optional[str] = None
    position: Optional[int] = 0
    bullets: Optional[List[ProjBulletCreate]] = []


class ProjectUpdate(BaseModel):
    name: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    stack: Optional[str] = None
    links: Optional[str] = None
    description: Optional[str] = None
    position: Optional[int] = 0
    bullets: Optional[List[ProjBulletUpdate]] = []