"""Lightweight embedding helpers — uses the store's TF-IDF vectors."""

from __future__ import annotations

from app.services.store import store, _cosine


def find_related(note_id: str, top_k: int = 5) -> list[tuple[str, float]]:
    """Return the top-k most similar note IDs for a given note."""
    vec = store._vectors.get(note_id)
    if vec is None:
        return []
    scored = []
    for other_id, other_vec in store._vectors.items():
        if other_id == note_id:
            continue
        sim = _cosine(vec, other_vec)
        scored.append((other_id, round(sim, 4)))
    scored.sort(key=lambda x: x[1], reverse=True)
    return scored[:top_k]
