from pydantic import BaseModel, HttpUrl


class CoverLetterRequest(BaseModel):
    company: str
    jobPosting: str


class ScrapePostingRequest(BaseModel):
    url: HttpUrl