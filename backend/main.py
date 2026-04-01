"""
EduAI School — FastAPI Application
Main server with all routes for code execution, AI tutoring, progress, and dashboard.
"""
import os
import json
import base64
import logging
import uuid
from datetime import datetime
from contextlib import asynccontextmanager
from typing import Optional

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

from database import init_db, create_student, get_student, update_student_activity
from database import save_progress, get_progress, save_xp_state, get_xp_state
from database import create_conversation, add_message, get_conversation_messages
from database import get_dashboard_data
from code_runner import run_python_code


# ── Lifespan ──

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(title="EduAI School API", version="1.0.0", lifespan=lifespan)

# CORS
# Support both CORS_ORIGINS (standard) and Frontend (Render dashboard alias)
_cors_raw = os.getenv("CORS_ORIGINS") or os.getenv("Frontend") or "http://localhost:5175"
origins = [o.strip() for o in _cors_raw.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Schemas ──

class RunCodeRequest(BaseModel):
    code: str
    inputs: list[str] | None = None

class EnrollRequest(BaseModel):
    batch_code: str

class ProfileRequest(BaseModel):
    student_id: str
    name: str
    batch_code: str
    batch_name: str

class ProgressRequest(BaseModel):
    student_id: str
    module_slug: str
    stages_completed: list[str]
    current_stage: int
    quiz_score: int | None = None
    challenges_completed: int = 0
    completed_at: str | None = None

class XPRequest(BaseModel):
    student_id: str
    total_xp: int
    level: int
    level_name: str
    streak_days: int
    last_active_date: str
    unlocked_achievements: list[str]

class ChatRequest(BaseModel):
    message: str
    student_id: str | None = None
    conversation_id: int | None = None
    module_title: str | None = None
    module_slug: str | None = None


# ── Valid batch codes ──

VALID_BATCH_CODES = {
    "PILOT1": "EduAI NGO Pilot — Batch 1",
    "PILOT2": "EduAI NGO Pilot — Batch 2",
    "DEMO01": "EduAI Demo Batch",
    "CLASS9": "EduAI Class 9 — Coimbatore",
    "CLASS10": "EduAI Class 10 — Coimbatore",
}

# ── AI Tutor System Prompt ──

SCHOOL_SYSTEM_PROMPT = """You are EduAI's AI Tutor for Class 9-10 students learning programming in Python.

Core Rules:
- Respond at a Class 9-10 reading level. No jargon unless the concept requires it.
- Use the Socratic method: ask "what do you think happens if..." before giving answers.
- Always include a concrete, relatable example (not abstract). Use Tamil Nadu everyday context when possible (auto, tiffin, recharge).
- Never say "that's wrong" — say "almost, let's think about it differently".
- If the student is stuck, break the problem into smaller steps.
- Keep answers concise: 2-4 paragraphs max. Use code examples when helpful.
- Use simple analogies: variables = labelled boxes, functions = recipes, loops = repeated actions.
- If asked about the current module topic, focus your answer on that specific concept.
- Encourage exploration: "Try changing X to Y and see what happens!"

You are kind, patient, and encouraging. Every interaction should make the student feel capable."""


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ROUTES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


# ── Health Check ──

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "EduAI School API", "version": "1.0.0"}


# ── Code Execution ──

@app.post("/api/school/run")
async def execute_code(request: RunCodeRequest):
    """Execute Python code in a sandboxed environment."""
    if not request.code.strip():
        raise HTTPException(400, "No code provided")

    if len(request.code) > 10000:
        raise HTTPException(400, "Code too long (max 10,000 characters)")

    result = run_python_code(request.code, request.inputs)
    return result


# ── Enrollment ──

@app.post("/api/school/enroll")
async def enroll_student(request: EnrollRequest):
    """Validate a batch code and return batch info."""
    code = request.batch_code.strip().upper()

    if code not in VALID_BATCH_CODES:
        raise HTTPException(404, "Batch code not recognized")

    return {
        "valid": True,
        "batch_code": code,
        "batch_name": VALID_BATCH_CODES[code],
    }


# ── Student Profile ──

@app.post("/api/school/profile")
async def save_profile(request: ProfileRequest):
    """Save or update a student profile."""
    await create_student(request.student_id, request.name, request.batch_code, request.batch_name)
    return {"ok": True, "student_id": request.student_id}

@app.get("/api/school/profile/{student_id}")
async def get_profile(student_id: str):
    """Get a student profile."""
    student = await get_student(student_id)
    if not student:
        raise HTTPException(404, "Student not found")
    return student


# ── Progress ──

@app.post("/api/school/progress")
async def save_student_progress(request: ProgressRequest):
    """Save module progress for a student."""
    await save_progress(
        request.student_id,
        request.module_slug,
        json.dumps(request.stages_completed),
        request.current_stage,
        request.quiz_score,
        request.challenges_completed,
        request.completed_at,
    )
    await update_student_activity(request.student_id)
    return {"ok": True}

@app.get("/api/school/progress/{student_id}")
async def get_student_progress(student_id: str):
    """Get all module progress for a student."""
    progress = await get_progress(student_id)
    # Parse stages_completed JSON strings
    for p in progress:
        try:
            p["stages_completed"] = json.loads(p.get("stages_completed", "[]"))
        except Exception:
            p["stages_completed"] = []
    return {"student_id": student_id, "progress": progress}


# ── XP State ──

@app.post("/api/school/xp")
async def save_student_xp(request: XPRequest):
    """Save XP/level/streak state for a student."""
    await save_xp_state(
        request.student_id,
        request.total_xp,
        request.level,
        request.level_name,
        request.streak_days,
        request.last_active_date,
        json.dumps(request.unlocked_achievements),
    )
    return {"ok": True}

@app.get("/api/school/xp/{student_id}")
async def get_student_xp(student_id: str):
    """Get XP state for a student."""
    xp = await get_xp_state(student_id)
    if not xp:
        return {
            "student_id": student_id,
            "total_xp": 0,
            "level": 1,
            "level_name": "Beginner",
            "streak_days": 0,
            "last_active_date": None,
            "unlocked_achievements": [],
        }
    try:
        xp["unlocked_achievements"] = json.loads(xp.get("unlocked_achievements", "[]"))
    except Exception:
        xp["unlocked_achievements"] = []
    return xp


# ── AI Tutor (Streaming) ──

@app.post("/api/school/chat/stream")
async def chat_stream(request: ChatRequest):
    """Stream AI Tutor response via SSE."""
    api_key = os.getenv("OPENAI_API_KEY")
    model = os.getenv("AI_MODEL", "gpt-4o-mini")

    if not api_key or api_key == "your_openai_api_key_here":
        # Fallback: return a helpful non-AI response
        return StreamingResponse(
            _fallback_response(request.message),
            media_type="text/event-stream"
        )

    try:
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=api_key)

        # Get or create conversation
        conv_id = request.conversation_id
        history = []

        if conv_id:
            history = await get_conversation_messages(conv_id)
        else:
            student_id = request.student_id or "anon"
            conv_id = await create_conversation(student_id, request.module_slug)

        # Save student message
        await add_message(conv_id, "student", request.message)

        # Build messages for OpenAI
        system_prompt = SCHOOL_SYSTEM_PROMPT
        if request.module_title:
            system_prompt += f"\n\nThe student is currently studying: {request.module_title}. Focus your answers on this topic."

        messages = [{"role": "system", "content": system_prompt}]
        for msg in history:
            role = "assistant" if msg["role"] == "tutor" else "user"
            messages.append({"role": role, "content": msg["content"]})
        messages.append({"role": "user", "content": request.message})

        async def event_generator():
            full_text = ""
            yield f"data: {json.dumps({'type': 'conv', 'conversation_id': conv_id})}\n\n"

            try:
                stream = await client.chat.completions.create(
                    model=model,
                    messages=messages,
                    stream=True,
                    max_tokens=800,
                    temperature=0.7,
                )

                async for chunk in stream:
                    delta = chunk.choices[0].delta if chunk.choices else None
                    if delta and delta.content:
                        text = delta.content
                        full_text += text
                        yield f"data: {json.dumps({'type': 'delta', 'text': text})}\n\n"

                # Save tutor response
                await add_message(conv_id, "tutor", full_text)
                yield f"data: {json.dumps({'type': 'done', 'full_text': full_text})}\n\n"

            except Exception as e:
                yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

        return StreamingResponse(event_generator(), media_type="text/event-stream")

    except ImportError:
        return StreamingResponse(
            _fallback_response(request.message),
            media_type="text/event-stream"
        )


async def _fallback_response(message: str):
    """When no AI API key is configured, provide helpful fallback responses."""
    responses = {
        "variable": "A variable is like a labelled box 📦. You give it a name (like `score`) and store a value inside (like `75`). Python remembers it for you!\n\nTry this:\n```python\nname = \"Priya\"\nprint(name)\n```",
        "print": "`print()` shows things on the screen. Whatever you put inside the brackets gets displayed as output.\n\nTry: `print(\"Hello!\")` and then `print(3 + 4)`",
        "if": "`if` checks a condition. If it's true, the indented code runs. If not, `else` runs instead.\n\n```python\nif score >= 40:\n    print(\"Pass!\")\nelse:\n    print(\"Try again\")\n```",
        "loop": "A `for` loop repeats code. `range(5)` gives numbers 0,1,2,3,4.\n\n```python\nfor i in range(5):\n    print(\"Step\", i+1)\n```",
        "function": "A function is like a recipe you write once and use many times.\n\n```python\ndef greet(name):\n    return \"Hi \" + name\n\nprint(greet(\"Priya\"))\n```",
    }

    # Find matching response
    msg_lower = message.lower()
    response = "Great question! 🤔 I'd love to help, but the AI API is not connected right now. Try experimenting in the sandbox — the best way to learn is by running code!"

    for keyword, resp in responses.items():
        if keyword in msg_lower:
            response = resp
            break

    yield f"data: {json.dumps({'type': 'conv', 'conversation_id': None})}\n\n"
    # Simulate streaming
    words = response.split(" ")
    for i, word in enumerate(words):
        text = word + (" " if i < len(words) - 1 else "")
        yield f"data: {json.dumps({'type': 'delta', 'text': text})}\n\n"
    yield f"data: {json.dumps({'type': 'done', 'full_text': response})}\n\n"


# ── Coordinator Dashboard ──

@app.get("/api/school/dashboard")
async def dashboard(batch_code: str = None):
    """Get coordinator dashboard data."""
    data = await get_dashboard_data(batch_code)
    return data


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# JUDGE0 CE — MULTI-LANGUAGE CODE EXECUTION
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# In-memory language cache (populated on first /api/code/languages call)
_cached_languages: list | None = None

# Fallback language list if Judge0 /languages is unreachable
_FALLBACK_LANGUAGES = [
    {"id": 71,  "name": "Python (3.8.1)"},
    {"id": 54,  "name": "C++ (GCC 9.2.0)"},
    {"id": 50,  "name": "C (GCC 9.2.0)"},
    {"id": 62,  "name": "Java (OpenJDK 13.0.1)"},
    {"id": 63,  "name": "JavaScript (Node.js 12.14.0)"},
    {"id": 74,  "name": "TypeScript (3.7.4)"},
    {"id": 60,  "name": "Go (1.13.5)"},
    {"id": 73,  "name": "Rust (1.40.0)"},
    {"id": 51,  "name": "C# (Mono 6.6.0.161)"},
    {"id": 78,  "name": "Kotlin (1.3.70)"},
    {"id": 72,  "name": "Ruby (2.7.0)"},
    {"id": 83,  "name": "Swift (5.2.3)"},
    {"id": 68,  "name": "PHP (7.4.1)"},
    {"id": 90,  "name": "Dart (2.19.2)"},
    {"id": 81,  "name": "Scala (2.13.2)"},
    {"id": 80,  "name": "R (4.0.0)"},
    {"id": 46,  "name": "Bash (5.0.0)"},
    {"id": 82,  "name": "SQL (SQLite 3.27.2)"},
]

_DIRECT_HOST = "ce.judge0.com"


def _judge0_is_rapidapi() -> bool:
    host = os.getenv("JUDGE0_API_HOST", _DIRECT_HOST)
    return "rapidapi" in host.lower()


def _judge0_headers() -> dict:
    headers = {"Content-Type": "application/json"}
    if _judge0_is_rapidapi():
        api_key = os.getenv("JUDGE0_API_KEY")
        if not api_key:
            raise HTTPException(
                status_code=503,
                detail="Code execution not configured: JUDGE0_API_KEY missing from server environment.",
            )
        headers["X-RapidAPI-Key"] = api_key
        headers["X-RapidAPI-Host"] = os.getenv("JUDGE0_API_HOST", _DIRECT_HOST)
    return headers


def _judge0_base() -> str:
    host = os.getenv("JUDGE0_API_HOST") or _DIRECT_HOST
    return f"https://{host}"


# ── Judge0 Schemas ──

class J0ExecuteRequest(BaseModel):
    source_code: str
    language_id: int
    stdin: Optional[str] = ""

class J0ExecuteResponse(BaseModel):
    stdout: Optional[str] = None
    stderr: Optional[str] = None
    compile_output: Optional[str] = None
    status: dict
    time: Optional[str] = None
    memory: Optional[int] = None
    token: Optional[str] = None


# ── Routes ──

@app.post("/api/code/execute", response_model=J0ExecuteResponse)
async def code_execute(body: J0ExecuteRequest):
    """
    Proxy code execution to Judge0 CE.
    Uses ?wait=true for synchronous single-request execution.
    All I/O is base64-encoded for safe unicode/binary handling.
    """
    headers = _judge0_headers()
    base_url = _judge0_base()

    payload = {
        "source_code": base64.b64encode(body.source_code.encode()).decode(),
        "language_id": body.language_id,
        "stdin": base64.b64encode((body.stdin or "").encode()).decode(),
        "base64_encoded": True,
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{base_url}/submissions",
                json=payload,
                headers=headers,
                params={"wait": "true", "base64_encoded": "true", "fields": "*"},
            )

        if response.status_code == 429:
            raise HTTPException(
                status_code=429,
                detail="Judge0 rate limit reached. Please wait a moment before running again.",
            )

        if not response.is_success:
            logger.error(f"Judge0 error {response.status_code}: {response.text}")
            raise HTTPException(
                status_code=502,
                detail=f"Code execution service error ({response.status_code}). Try again shortly.",
            )

        data = response.json()

        def _decode(val: Optional[str]) -> Optional[str]:
            if not val:
                return None
            try:
                return base64.b64decode(val).decode("utf-8", errors="replace")
            except Exception:
                return val

        return J0ExecuteResponse(
            stdout=_decode(data.get("stdout")),
            stderr=_decode(data.get("stderr")),
            compile_output=_decode(data.get("compile_output")),
            status=data.get("status", {"id": 0, "description": "Unknown"}),
            time=data.get("time"),
            memory=data.get("memory"),
            token=data.get("token"),
        )

    except HTTPException:
        raise
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Code execution timed out (30s). Check for infinite loops.")
    except Exception as e:
        logger.exception("Unexpected error during Judge0 execution")
        raise HTTPException(status_code=500, detail=f"Execution error: {str(e)}")


@app.get("/api/code/languages")
async def code_languages():
    """
    Return supported Judge0 language list.
    Fetched from Judge0 once and cached in memory.
    Falls back to built-in list if Judge0 is unreachable.
    """
    global _cached_languages

    if _cached_languages is not None:
        return _cached_languages

    try:
        headers = _judge0_headers()
        base_url = _judge0_base()
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"{base_url}/languages", headers=headers)
        if response.is_success:
            _cached_languages = response.json()
            return _cached_languages
    except Exception as e:
        logger.warning(f"Could not fetch Judge0 language list: {e}")

    return _FALLBACK_LANGUAGES
