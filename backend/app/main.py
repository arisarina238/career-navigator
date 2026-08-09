"""
Главный файл FastAPI-приложения.

Создаёт приложение Career Navigator AI, подключает CORS
для взаимодействия с React/Vite frontend и подключает API
ИИ-ассистента по адресу /api/assistant.

Также содержит базовые endpoint'ы:
    GET /
    GET /health
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.assistant import router as assistant_router

app = FastAPI(
    title="Career Navigator AI",
    description="AI Assistant for Career Navigator",
    version="1.0.0"
)


# Разрешаем запросы от React/Vite
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(
    assistant_router,
    prefix="/api"
)


@app.get("/")
async def root():
    return {
        "status": "ok",
        "service": "Career Navigator AI"
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy"
    }