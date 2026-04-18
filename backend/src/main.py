from fastapi import FastAPI, HTTPException, status
from fastapi.responses import Response
from starlette.status import HTTP_500_INTERNAL_SERVER_ERROR

from src.schemas.chat import ChatRequest
from src.services.rag import Rag
from src.services.image_service import ImageService  # ✅ новый импорт
from src.database.database import SessionDep
import logging
from fastapi.middleware.cors import CORSMiddleware

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Tulahack2026 API",
    description="API для чат бота с RAG",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "message": "Tulahack2026 API",
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health")
async def health_check():
    return {"status": "ok"}


@app.post("/chat_request")
async def get_answer(request: ChatRequest) -> dict:
    try:
        logger.info(f"Получен запрос: {request.question}")
        answer = await Rag.get_answer(request.question)
        return {"answer": answer}
    except Exception as e:
        logger.error(f"Ошибка: {e}")
        raise HTTPException(
            status_code=HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка обработки запроса: {str(e)}"
        )


@app.get("/img/{img_id}")
async def get_img(
        img_id: str,
        db: SessionDep
):
    """Получение изображения из PostgreSQL"""

    logger.info(f"Запрос на картинку: {img_id}")

    # Валидация имени файла
    if not ImageService.validate_filename(img_id):
        logger.warning(f"Подозрительный запрос: {img_id}")
        raise HTTPException(status_code=400, detail="Invalid image ID")

    # Сервисный слой
    image_service = ImageService(db)
    image = await image_service.get_image_by_filename(f"{img_id}.png")

    # Формируем ответ
    return Response(
        content=image.image_data,
        media_type=image.content_type,
        headers={"Cache-Control": "public, max-age=86400"}
    )