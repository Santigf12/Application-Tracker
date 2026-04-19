from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import applications, pdf, tools, profile

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://frontend:3000",   # Docker
        "http://localhost:3000",  # Local dev
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(applications.router, prefix="/api/applications", tags=["applications"])
app.include_router(pdf.router, prefix="/api/pdf", tags=["pdf"])
app.include_router(tools.router, prefix="/api/tools", tags=["tools"])
app.include_router(profile.router, prefix="/api/profile", tags=["profile"])