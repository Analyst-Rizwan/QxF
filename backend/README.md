---
title: EduAI School API
emoji: 🎓
colorFrom: indigo
colorTo: purple
sdk: docker
app_port: 7860
pinned: false
---

# EduAI School API

FastAPI backend for the EduAI School platform.

## Endpoints

- `GET /api/health` — Health check
- `POST /api/school/run` — Sandboxed Python execution
- `POST /api/school/enroll` — Batch code validation
- `POST /api/school/chat/stream` — AI Tutor (SSE streaming)
- `POST /api/code/execute` — Multi-language execution via Judge0
- `GET /api/code/languages` — Supported languages list
