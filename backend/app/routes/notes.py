"""Note CRUD + graph endpoint."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.schemas import GraphResponse, NoteCreate, NoteUpdate
from app.services.store import store

router = APIRouter(prefix="/api", tags=["notes"])


@router.get("/graph", response_model=GraphResponse)
def get_graph():
    """Full knowledge graph: notes + connections."""
    return GraphResponse(notes=store.list_notes(), connections=store.connections)


@router.get("/notes")
def list_notes():
    return store.list_notes()


@router.get("/notes/{note_id}")
def get_note(note_id: str):
    note = store.get_note(note_id)
    if not note:
        raise HTTPException(404, "Note not found")
    return note


@router.post("/notes", status_code=201)
def create_note(body: NoteCreate):
    return store.create_note(
        title=body.title,
        content=body.content,
        category=body.category,
        tags=body.tags,
    )


@router.put("/notes/{note_id}")
def update_note(note_id: str, body: NoteUpdate):
    note = store.update_note(note_id, **body.model_dump(exclude_unset=True))
    if not note:
        raise HTTPException(404, "Note not found")
    return note


@router.delete("/notes/{note_id}")
def delete_note(note_id: str):
    if not store.delete_note(note_id):
        raise HTTPException(404, "Note not found")
    return {"success": True}


@router.get("/search")
def search_notes(q: str = ""):
    if not q.strip():
        return []
    return store.search(q)
