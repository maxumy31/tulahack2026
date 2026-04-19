from fastapi import FastAPI, HTTPException, status
from fastapi.responses import Response
from starlette.status import HTTP_500_INTERNAL_SERVER_ERROR

from src.schemas.chat import ChatRequest
from src.services.rag import Rag
from src.services.image_service import ImageService  # ✅ новый импорт
from src.database.database import SessionDep
import logging
from fastapi.middleware.cors import CORSMiddleware

from dotenv import load_dotenv
import os

import psycopg2

from openai import OpenAI

from sentence_transformers import SentenceTransformer

import re

def extract_image_ids(text: str) -> dict:
    """
    Извлекает из строки все подстроки, заключённые в угловые скобки <...>,
    удаляет их из исходного текста и возвращает результат в виде словаря.

    :param text: исходная строка
    :return: 'imageIds'
    """
    pattern = r'<([^>]*)>'
    image_ids = re.findall(pattern, text)
    cleaned_text = re.sub(pattern, '', text)
    # Убираем лишние пробелы, которые могли остаться после удаления скобок
    cleaned_text = re.sub(r'\s+', ' ', cleaned_text).strip()
    return image_ids

model = SentenceTransformer("e5_custom/kaggle/working/e5_custom")

conn = psycopg2.connect(
    host="rag_db",
    port=5433,
    database="ragdatabase",
    user="raguser",
    password="ragpassword"
)

load_dotenv()

api_key = os.getenv("OPENROUTER_API_KEY")

client7 = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=api_key
  )

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

def to_pgvector(vec):
    return "[" + ",".join(str(float(x)) for x in vec) + "]"

# функция поиска релевантных чанков

def semantic_search(query, conn, model, top_k=12):
    try:
        query_embedding = model.encode_query([query], normalize_embeddings=True)[0]
    except AttributeError:
        prefixed_query = f"query: {query}"
        query_embedding = model.encode([prefixed_query], normalize_embeddings=True)[0]

    query_embedding_sql = to_pgvector(query_embedding)

    cur = conn.cursor()
    cur.execute(
        """
        SELECT id, source_doc, chunk, vector <=> %s::vector AS distance
        FROM chunks
        WHERE vector IS NOT NULL
        ORDER BY vector <=> %s::vector
        LIMIT %s;
        """,
        (query_embedding_sql, query_embedding_sql, top_k * 3)
    )
    rows = cur.fetchall()
    cur.close()

    # Убираем дубликаты
    seen = set()
    unique_results = []

    for row_id, source_doc, chunk, distance in rows:
        if chunk not in seen:
            seen.add(chunk)
            unique_results.append({
                "id": row_id,
                "source_doc": source_doc,
                "chunk": chunk,
                "distance": float(distance),
            })
        if len(unique_results) >= top_k:
            break

    return unique_results

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
    question = request.question
    # Ищем релевантные абзацы
    search_results = semantic_search(question, top_k=12, conn=conn, model=model)
    if not search_results:
        return "Не удалось найти подходящую информацию"

    # Промпт
    prompt = f"""
    Задача:
    Найди в предоставленных данных ответ на вопрос пользователя. Затем сформулируй ответ на вопрос пользователя.
    Ответ должен звучать как экспертное утверждение, без упоминания источников, данных или контекста. Предоставь максимум информации используя имеющиеся данные.
    Информации может быть мало, но даже в таком случае нужно сформулировать ответ на вопрос пользователя.

    Вопрос пользователя: {question}
    Данные для ответа:
    # 1. {search_results[0]["chunk"]}
    # 2. {search_results[1]["chunk"]}
    3. {search_results[2]["chunk"]}

    """

    # Запрос к LLM
    completion = client7.chat.completions.create(
      extra_body={},
      model="openrouter/elephant-alpha",
      messages=[
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": prompt
            }
          ]
        }
      ]
    )

    # Обработка ответа
    if completion and completion.choices:
        content = completion.choices[0].message.content
        # sources = '\n'.join((search_results[0]["chunk"], search_results[1]["chunk"], search_results[2]["chunk"]))
        imageIds = extract_image_ids(search_results[2]["chunk"])
        return {"answer": content, "imageIds": imageIds}
    else:
        print("Ошибка: LLM не вернул ответ")


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

    return FileResponse(
        path=file_path,
        media_type="image/png"
    )
