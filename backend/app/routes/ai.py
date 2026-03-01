"""AI-powered insight endpoints."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.schemas import AIRequest, AIResponse
from app.services.embeddings import find_related
from app.services.llm import generate_insights
from app.services.store import store

router = APIRouter(prefix="/api/ai", tags=["ai"])


@router.post("/insights", response_model=AIResponse)
async def get_insights(body: AIRequest):
    note = store.get_note(body.note_id)
    if not note:
        raise HTTPException(404, "Note not found")

    related = find_related(note.id, top_k=5)
    connected_titles = [store.get_note(rid).title for rid, _ in related if store.get_note(rid)]

    result = await generate_insights(note.title, note.content, connected_titles)

    return AIResponse(
        summary=result.get("summary", ""),
        insights=result.get("insights", []),
        suggested_connections=result.get("suggested_connections", []),
    )
