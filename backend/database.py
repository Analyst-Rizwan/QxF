"""
EduAI School — Database layer
Async SQLite for pilot, schema designed for easy Supabase migration.
"""
import os
import aiosqlite
from datetime import datetime

DB_PATH = os.getenv("DB_PATH", "eduai_school.db")

SCHEMA = """
CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    batch_code TEXT NOT NULL,
    batch_name TEXT NOT NULL,
    enrolled_at TEXT NOT NULL DEFAULT (datetime('now')),
    last_active TEXT
);

CREATE TABLE IF NOT EXISTS progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL REFERENCES students(id),
    module_slug TEXT NOT NULL,
    stages_completed TEXT NOT NULL DEFAULT '[]',
    current_stage INTEGER NOT NULL DEFAULT 0,
    quiz_score INTEGER,
    challenges_completed INTEGER DEFAULT 0,
    completed_at TEXT,
    time_spent_seconds INTEGER DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(student_id, module_slug)
);

CREATE TABLE IF NOT EXISTS xp_state (
    student_id TEXT PRIMARY KEY REFERENCES students(id),
    total_xp INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 1,
    level_name TEXT NOT NULL DEFAULT 'Beginner',
    streak_days INTEGER NOT NULL DEFAULT 0,
    last_active_date TEXT,
    unlocked_achievements TEXT NOT NULL DEFAULT '[]',
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL REFERENCES students(id),
    module_slug TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id),
    role TEXT NOT NULL CHECK (role IN ('student', 'tutor', 'system')),
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
"""


async def get_db() -> aiosqlite.Connection:
    db = await aiosqlite.connect(DB_PATH)
    db.row_factory = aiosqlite.Row
    await db.execute("PRAGMA journal_mode=WAL")
    await db.execute("PRAGMA foreign_keys=ON")
    return db


async def init_db():
    db = await get_db()
    try:
        await db.executescript(SCHEMA)
        await db.commit()
    finally:
        await db.close()


# ── Student CRUD ──

async def create_student(student_id: str, name: str, batch_code: str, batch_name: str):
    db = await get_db()
    try:
        await db.execute(
            "INSERT OR REPLACE INTO students (id, name, batch_code, batch_name, enrolled_at, last_active) VALUES (?, ?, ?, ?, ?, ?)",
            (student_id, name, batch_code, batch_name, datetime.utcnow().isoformat(), datetime.utcnow().isoformat())
        )
        await db.commit()
    finally:
        await db.close()


async def get_student(student_id: str):
    db = await get_db()
    try:
        cursor = await db.execute("SELECT * FROM students WHERE id = ?", (student_id,))
        row = await cursor.fetchone()
        return dict(row) if row else None
    finally:
        await db.close()


async def update_student_activity(student_id: str):
    db = await get_db()
    try:
        await db.execute("UPDATE students SET last_active = ? WHERE id = ?", (datetime.utcnow().isoformat(), student_id))
        await db.commit()
    finally:
        await db.close()


# ── Progress CRUD ──

async def save_progress(student_id: str, module_slug: str, stages_completed: str,
                        current_stage: int, quiz_score=None, challenges_completed=0, completed_at=None):
    db = await get_db()
    try:
        await db.execute("""
            INSERT INTO progress (student_id, module_slug, stages_completed, current_stage, quiz_score, challenges_completed, completed_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(student_id, module_slug) DO UPDATE SET
                stages_completed = excluded.stages_completed,
                current_stage = excluded.current_stage,
                quiz_score = COALESCE(excluded.quiz_score, progress.quiz_score),
                challenges_completed = excluded.challenges_completed,
                completed_at = COALESCE(excluded.completed_at, progress.completed_at),
                updated_at = excluded.updated_at
        """, (student_id, module_slug, stages_completed, current_stage, quiz_score, challenges_completed, completed_at, datetime.utcnow().isoformat()))
        await db.commit()
    finally:
        await db.close()


async def get_progress(student_id: str):
    db = await get_db()
    try:
        cursor = await db.execute("SELECT * FROM progress WHERE student_id = ? ORDER BY module_slug", (student_id,))
        rows = await cursor.fetchall()
        return [dict(r) for r in rows]
    finally:
        await db.close()


# ── XP CRUD ──

async def save_xp_state(student_id: str, total_xp: int, level: int, level_name: str,
                         streak_days: int, last_active_date: str, unlocked_achievements: str):
    db = await get_db()
    try:
        await db.execute("""
            INSERT INTO xp_state (student_id, total_xp, level, level_name, streak_days, last_active_date, unlocked_achievements, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(student_id) DO UPDATE SET
                total_xp = excluded.total_xp,
                level = excluded.level,
                level_name = excluded.level_name,
                streak_days = excluded.streak_days,
                last_active_date = excluded.last_active_date,
                unlocked_achievements = excluded.unlocked_achievements,
                updated_at = excluded.updated_at
        """, (student_id, total_xp, level, level_name, streak_days, last_active_date, unlocked_achievements, datetime.utcnow().isoformat()))
        await db.commit()
    finally:
        await db.close()


async def get_xp_state(student_id: str):
    db = await get_db()
    try:
        cursor = await db.execute("SELECT * FROM xp_state WHERE student_id = ?", (student_id,))
        row = await cursor.fetchone()
        return dict(row) if row else None
    finally:
        await db.close()


# ── Dashboard (Coordinator) ──

async def get_dashboard_data(batch_code: str = None):
    db = await get_db()
    try:
        if batch_code:
            cursor = await db.execute("SELECT * FROM students WHERE batch_code = ?", (batch_code,))
        else:
            cursor = await db.execute("SELECT * FROM students")
        students = [dict(r) for r in await cursor.fetchall()]

        result = []
        total_score = 0
        score_count = 0
        completed_count = 0

        for s in students:
            cursor = await db.execute("SELECT * FROM progress WHERE student_id = ?", (s["id"],))
            progress_rows = [dict(r) for r in await cursor.fetchall()]

            total_stages = sum(len(eval(p.get("stages_completed", "[]"))) for p in progress_rows)
            best_score = None
            is_completed = False
            for p in progress_rows:
                if p.get("quiz_score") is not None:
                    if best_score is None or p["quiz_score"] > best_score:
                        best_score = p["quiz_score"]
                    total_score += p["quiz_score"]
                    score_count += 1
                if p.get("completed_at"):
                    is_completed = True

            if is_completed:
                completed_count += 1

            result.append({
                "id": s["id"],
                "name": s["name"],
                "stages_completed": total_stages,
                "quiz_score": best_score,
                "completed_at": next((p["completed_at"] for p in progress_rows if p.get("completed_at")), None),
                "modules_progress": progress_rows,
            })

        active_count = sum(1 for s in students if s.get("last_active") and
                          (datetime.utcnow() - datetime.fromisoformat(s["last_active"])).days < 7)

        return {
            "batch_code": batch_code or "ALL",
            "enrolled": len(students),
            "active": active_count,
            "completed": completed_count,
            "average_score": round(total_score / score_count) if score_count > 0 else 0,
            "students": result,
        }
    finally:
        await db.close()


# ── Conversations ──

async def create_conversation(student_id: str, module_slug: str = None):
    db = await get_db()
    try:
        cursor = await db.execute(
            "INSERT INTO conversations (student_id, module_slug) VALUES (?, ?)",
            (student_id, module_slug)
        )
        await db.commit()
        return cursor.lastrowid
    finally:
        await db.close()


async def add_message(conversation_id: int, role: str, content: str):
    db = await get_db()
    try:
        await db.execute(
            "INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)",
            (conversation_id, role, content)
        )
        await db.commit()
    finally:
        await db.close()


async def get_conversation_messages(conversation_id: int):
    db = await get_db()
    try:
        cursor = await db.execute(
            "SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY id",
            (conversation_id,)
        )
        return [dict(r) for r in await cursor.fetchall()]
    finally:
        await db.close()
