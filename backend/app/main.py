from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import applications, pdf, tools

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://172.16.1.4",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(applications.router, prefix="/api/applications", tags=["applications"])
app.include_router(pdf.router, prefix="/api/pdf", tags=["pdf"])
app.include_router(tools.router, prefix="/api/tools", tags=["tools"])