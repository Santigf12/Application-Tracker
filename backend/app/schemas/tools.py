from pydantic import BaseModel, HttpUrl


class CoverLetterRequest(BaseModel):
    company: str
    position: str
    jobPosting: str


class ScrapePostingRequest(BaseModel):
    url: HttpUrl

class TailoredProfileRequest(BaseModel):
    position: str
    company: str | None = None
    jobPosting: str