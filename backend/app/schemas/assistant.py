"""
Pydantic-модели для API ИИ-ассистента.

Содержит структуры входящих запросов и исходящих ответов
для endpoint'а /api/assistant/chat.

Модели используются FastAPI для:
    - валидации входных данных;
    - формирования Swagger-документации;
    - описания структуры ответа API.
"""

from pydantic import BaseModel, Field

class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    history: list[ChatMessage] = []
    scenario: str = "A"
    stage: str = "interests"
    trials: list[dict] = []


class ChatResponse(BaseModel):
    answer: str
    scenario: str
    stage: str