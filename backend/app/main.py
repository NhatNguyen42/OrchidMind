"""OrchidMind — Knowledge Garden API."""

from __future__ import annotations

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.notes import router as notes_router
from app.routes.ai import router as ai_router

app = FastAPI(
    title="OrchidMind API",
    version="1.0.0",
    description="Knowledge garden backend — notes, connections, AI insights",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(notes_router)
app.include_router(ai_router)


@app.get("/")
def root():
    return {
        "app": "OrchidMind",
        "version": "1.0.0",
        "endpoints": ["/api/graph", "/api/notes", "/api/search", "/api/ai/insights"],
    }
