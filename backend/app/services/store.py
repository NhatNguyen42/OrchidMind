"""In-memory note store with TF-IDF-based connection discovery."""

from __future__ import annotations

import math
import re
import uuid
from collections import Counter
from datetime import datetime, timezone

from app.data.seed_notes import SEED_NOTES
from app.schemas import Connection, Note


# ---------------------------------------------------------------------------
# TF-IDF helpers (no external deps)
# ---------------------------------------------------------------------------

_STOP_WORDS = frozenset(
    "a an the is are was were be been being have has had do does did will would "
    "shall should may might can could of in to for on with at by from as into "
    "through during before after above below between out off over under again "
    "further then once here there when where why how all each every both few "
    "more most other some such no nor not only own same so than too very it its "
    "and but or if while that this these those who whom which what".split()
)


def _tokenize(text: str) -> list[str]:
    words = re.findall(r"[a-z]{2,}", text.lower())
    return [w for w in words if w not in _STOP_WORDS]


def _compute_tfidf(documents: list[list[str]]) -> list[dict[str, float]]:
    n = len(documents)
    df: Counter[str] = Counter()
    for tokens in documents:
        for t in set(tokens):
            df[t] += 1
    idf = {w: math.log((n + 1) / (freq + 1)) + 1 for w, freq in df.items()}

    vectors: list[dict[str, float]] = []
    for tokens in documents:
        tf = Counter(tokens)
        total = len(tokens) or 1
        vec = {w: (c / total) * idf.get(w, 0) for w, c in tf.items()}
        vectors.append(vec)
    return vectors


def _cosine(a: dict[str, float], b: dict[str, float]) -> float:
    shared = set(a) & set(b)
    if not shared:
        return 0.0
    dot = sum(a[w] * b[w] for w in shared)
    na = math.sqrt(sum(v * v for v in a.values()))
    nb = math.sqrt(sum(v * v for v in b.values()))
    if na == 0 or nb == 0:
        return 0.0
    return dot / (na * nb)


def _shared_keywords(a: dict[str, float], b: dict[str, float], top: int = 4) -> list[str]:
    shared = set(a) & set(b)
    scored = [(w, a[w] + b[w]) for w in shared]
    scored.sort(key=lambda x: x[1], reverse=True)
    return [w for w, _ in scored[:top]]


# ---------------------------------------------------------------------------
# Store
# ---------------------------------------------------------------------------

class NoteStore:
    """Thread-safe-ish in-memory store — fine for single-worker demo."""

    def __init__(self) -> None:
        self.notes: dict[str, Note] = {}
        self.connections: list[Connection] = []
        self._vectors: dict[str, dict[str, float]] = {}
        self._load_seed()

    # -- seed -----------------------------------------------------------------
    def _load_seed(self) -> None:
        for raw in SEED_NOTES:
            note = Note(**raw)
            self.notes[note.id] = note
        self._recompute()

    # -- CRUD -----------------------------------------------------------------
    def list_notes(self) -> list[Note]:
        return list(self.notes.values())

    def get_note(self, note_id: str) -> Note | None:
        return self.notes.get(note_id)

    def create_note(self, title: str, content: str, category: str = "general", tags: list[str] | None = None) -> Note:
        note = Note(
            id=str(uuid.uuid4())[:8],
            title=title,
            content=content,
            category=category,
            tags=tags or [],
            created_at=datetime.now(timezone.utc).isoformat(),
        )
        self.notes[note.id] = note
        self._recompute()
        return note

    def update_note(self, note_id: str, **fields: object) -> Note | None:
        note = self.notes.get(note_id)
        if not note:
            return None
        data = note.model_dump()
        data.update({k: v for k, v in fields.items() if v is not None})
        updated = Note(**data)
        self.notes[note_id] = updated
        self._recompute()
        return updated

    def delete_note(self, note_id: str) -> bool:
        if note_id not in self.notes:
            return False
        del self.notes[note_id]
        self._recompute()
        return True

    # -- search ---------------------------------------------------------------
    def search(self, query: str) -> list[Note]:
        tokens = set(_tokenize(query))
        scored: list[tuple[float, Note]] = []
        for note in self.notes.values():
            text_tokens = set(_tokenize(f"{note.title} {note.content} {' '.join(note.tags)}"))
            overlap = len(tokens & text_tokens)
            if overlap:
                scored.append((overlap, note))
        scored.sort(key=lambda x: x[0], reverse=True)
        return [n for _, n in scored]

    # -- connections ----------------------------------------------------------
    def _recompute(self) -> None:
        ids = list(self.notes.keys())
        docs = [_tokenize(f"{self.notes[i].title} {self.notes[i].content} {' '.join(self.notes[i].tags)}") for i in ids]
        vectors = _compute_tfidf(docs)
        self._vectors = dict(zip(ids, vectors))

        threshold = 0.08
        conns: list[Connection] = []
        for i in range(len(ids)):
            for j in range(i + 1, len(ids)):
                sim = _cosine(vectors[i], vectors[j])
                if sim >= threshold:
                    kw = _shared_keywords(vectors[i], vectors[j])
                    conns.append(Connection(
                        source_id=ids[i],
                        target_id=ids[j],
                        strength=round(min(sim * 3, 1.0), 3),
                        keywords=kw,
                    ))
        self.connections = conns


# Singleton
store = NoteStore()
