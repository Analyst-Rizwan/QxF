# FastAPI Backend — EduAI School

A lightweight, fast Python backend providing code execution, AI tutoring, and student progress persistence.

## Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/school/run` | Execute Python code (sandboxed) |
| POST | `/api/school/chat/stream` | AI Tutor SSE streaming |
| POST | `/api/school/enroll` | Batch code validation + enrollment |
| POST | `/api/school/profile` | Save student profile |
| GET | `/api/school/progress/{student_id}` | Get student progress |
| POST | `/api/school/progress` | Save student progress |
| GET | `/api/school/dashboard` | Coordinator dashboard data |
