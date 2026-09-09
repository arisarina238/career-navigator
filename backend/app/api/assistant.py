"""
API-маршруты ИИ-ассистента.

Содержит endpoint для отправки сообщений пользователя
в ИИ-модель и получения ответа.

Основной endpoint:
POST /api/assistant/chat
"""

from fastapi import APIRouter, HTTPException

from app.schemas.assistant import (
    ChatRequest,
    ChatResponse
)

from app.services.ai_service import (
    generate_answer
)


router = APIRouter(
    prefix="/assistant",
    tags=["AI Assistant"]
)


@router.post(
    "/chat",
    response_model=ChatResponse
)
async def chat(
    request: ChatRequest
):

    try:

        history = [
            message.model_dump()
            for message in request.history
        ]


        answer = await generate_answer(
            message=request.message,
            history=history,
            scenario=request.scenario,
            stage=request.stage,
            trials=request.trials
        )


        return ChatResponse(
            answer=answer,
            scenario=request.scenario,
            stage=request.stage
        )


    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )