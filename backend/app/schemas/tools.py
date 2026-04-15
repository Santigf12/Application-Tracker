from pydantic import BaseModel, HttpUrl


class CoverLetterRequest(BaseModel):
    company: str
    position: str
    jobPosting: str


class ScrapePostingRequest(BaseModel):
    url: HttpUrl