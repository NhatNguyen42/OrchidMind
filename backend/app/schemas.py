from __future__ import annotations
from pydantic import BaseModel, Field
from datetime import datetime


class NoteBase(BaseModel):
    title: str
    content: str
    category: str = "general"
    tags: list[str] = Field(default_factory=list)


class NoteCreate(NoteBase):
    pass


class NoteUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    category: str | None = None
    tags: list[str] | None = None


class Note(NoteBase):
    id: str
    created_at: str


class Connection(BaseModel):
    source_id: str
    target_id: str
    strength: float
    keywords: list[str] = Field(default_factory=list)


class GraphResponse(BaseModel):
    notes: list[Note]
    connections: list[Connection]


class AIRequest(BaseModel):
    note_id: str


class AIResponse(BaseModel):
    summary: str
    insights: list[str]
    suggested_connections: list[str]
