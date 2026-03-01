"""LLM integration via Groq API (optional — works without API key)."""

from __future__ import annotations

import json
import os

import httpx

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = "llama-3.3-70b-versatile"
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"


async def generate_insights(title: str, content: str, connected_titles: list[str]) -> dict:
    """Generate AI summary + insights for a note. Falls back to heuristics if no API key."""

    if not GROQ_API_KEY:
        return _fallback_insights(title, content, connected_titles)

    connections_text = ", ".join(connected_titles) if connected_titles else "none discovered yet"

    messages = [
        {
            "role": "system",
            "content": (
                "You are OrchidMind, an AI knowledge gardener. Given a note and its connections, "
                "provide a concise JSON response with: summary (2-3 sentences), insights (list of 3 "
                "key observations), and suggested_connections (list of 2-3 topic names that would "
                "enrich this knowledge network). Respond ONLY with valid JSON."
            ),
        },
        {
            "role": "user",
            "content": (
                f"Note: {title}\n\nContent:\n{content}\n\n"
                f"Currently connected to: {connections_text}"
            ),
        },
    ]

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                GROQ_URL,
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": GROQ_MODEL,
                    "messages": messages,
                    "temperature": 0.7,
                    "max_tokens": 500,
                    "response_format": {"type": "json_object"},
                },
            )
            resp.raise_for_status()
            data = resp.json()
            text = data["choices"][0]["message"]["content"]
            return json.loads(text)
    except Exception:
        return _fallback_insights(title, content, connected_titles)


def _fallback_insights(title: str, content: str, connected_titles: list[str]) -> dict:
    sentences = [s.strip() for s in content.replace("\n", " ").split(".") if len(s.strip()) > 20]
    summary = ". ".join(sentences[:2]) + "." if sentences else content[:200]
    insights = [
        f"This note explores {title.lower()} and its implications.",
        f"Key themes appear across {len(connected_titles)} connected ideas." if connected_titles else "This note has potential for new connections.",
        "Consider exploring related concepts to deepen understanding.",
    ]
    suggested = ["Cognitive Science", "Systems Thinking", "Epistemology"]
    return {
        "summary": summary,
        "insights": insights,
        "suggested_connections": suggested,
    }
