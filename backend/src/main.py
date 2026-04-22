import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
#ИНИЦИАЛИЗАЦИЯ БД ИЗ work_with_db.ipynb
import json
import psycopg2
from psycopg2.extras import execute_batch

DB_CONFIG = {
    "host": "rag_db",
    "port": 5433,
    "database": "ragdatabase",
    "user": "raguser",
    "password": "ragpassword"
}

DOCUMENT_NAMES = {
    0: "01_Elicont_100___1_____04",
    1: "02_Elicont_100_1__2____09_07",
    2: "03_Elicont_100_2__3_____",
    3: "04_Elicont_200___1_____22",
    4: "05_Elicont_200_1__2____14_10",
    5: "06_Elicont_200_2__3_____",
    6: "07_",
    7: "08_",
    8: "09_",
    9: "10_",
    10: "11_",
    11: "12_",
    12: "13_",
    13: "14_",
    14: "15_",
    15: "16_",
    16: "17_",
    17: "18_"
}

JSON_PATH = "all_filtered_chunks.json"

# 1. Загружаем JSON
with open(JSON_PATH, "r", encoding="utf-8") as f:
    all_chunks = json.load(f)

# 2. Проверка структуры
if not isinstance(all_chunks, list):
    raise ValueError("Ожидался список списков в all_filtered_chunks.json")

# 3. Готовим записи для вставки
rows_to_insert = []

for doc_idx, doc_chunks in enumerate(all_chunks):
    if not isinstance(doc_chunks, list):
        raise ValueError(f"Элемент с индексом {doc_idx} не является списком чанков")

    source_doc = DOCUMENT_NAMES.get(doc_idx)
    if source_doc is None:
        raise ValueError(f"Для индекса {doc_idx} нет имени документа в DOCUMENT_NAMES")

    for chunk in doc_chunks:
        if not isinstance(chunk, str):
            continue

        chunk = chunk.strip()
        if not chunk:
            continue

        rows_to_insert.append((source_doc, chunk))

logger.info(f"Подготовлено {len(rows_to_insert)} чанков для вставки")

# 4. Подключаемся к БД
conn = psycopg2.connect(**DB_CONFIG)

try:
    with conn:
        with conn.cursor() as cur:
            # 5. Создаём расширение и таблицу
            cur.execute("CREATE EXTENSION IF NOT EXISTS vector;")

            cur.execute("""
                CREATE TABLE IF NOT EXISTS chunks (
                    id SERIAL PRIMARY KEY,
                    source_doc TEXT NOT NULL,
                    chunk TEXT NOT NULL,
                    vector VECTOR(768)
                );
            """)

            
            # cur.execute("TRUNCATE TABLE chunks RESTART IDENTITY;")

            # 6. Вставляем данные
            execute_batch(
                cur,
                """
                INSERT INTO chunks (source_doc, chunk)
                VALUES (%s, %s)
                """,
                rows_to_insert,
                page_size=500
            )

    logger.info("Данные успешно занесены в БД")

finally:
    pass

import zipfile
from pathlib import Path
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("e5_custom/kaggle/working/e5_custom")


import psycopg2

def to_pgvector(vec):
    return "[" + ",".join(str(float(x)) for x in vec) + "]"

TARGET_DOC = "01_Elicont_100___1_____04"

cur = conn.cursor()

cur.execute("""
    SELECT id, source_doc, chunk
    FROM chunks
    WHERE vector IS NULL
    AND source_doc = %s
""", (TARGET_DOC,))

dataset = cur.fetchall()
logger.info(f"Найдено {len(dataset)} чанков для {TARGET_DOC}")

ids = []
texts = []

for chunk_id, source_doc, chunk_text in dataset:
    ids.append(chunk_id)
    texts.append(f"passage: {source_doc}. {chunk_text}")

embeddings = model.encode(
    texts,
    normalize_embeddings=True,
    batch_size=32,
    show_progress_bar=True
)

updates = [
    (to_pgvector(emb), chunk_id)
    for chunk_id, emb in zip(ids, embeddings)
]

cur.executemany("""
    UPDATE chunks
    SET vector = %s::vector
    WHERE id = %s
""", updates)

conn.commit()
cur.close()
conn.close()

logger.info(f"Эмбеддинги для {TARGET_DOC} записаны")

# КОНЕЦ ИНИЦИАЛИЗАЦИИ БД ИЗ work_with_db.ipynb

from fastapi import FastAPI, HTTPException, status
from fastapi.responses import Response
from starlette.status import HTTP_500_INTERNAL_SERVER_ERROR

from src.schemas.chat import ChatRequest
from src.database.database import SessionDep

from fastapi.middleware.cors import CORSMiddleware

from pathlib import Path
from fastapi.responses import FileResponse

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

conn = psycopg2.connect(
    host="rag_db",
    port=5433,
    database="ragdatabase",
    user="raguser",
    password="ragpassword"
)

load_dotenv()

api_key = os.getenv("OPENROUTER_API_KEY", "67")
base_url = os.getenv("LLM_URL", "https://openrouter.ai/api/v1")
model_id = os.getenv("LLM_NAME", "inclusionai/ling-2.6-flash:free")

client7 = OpenAI(
    base_url=base_url,
    api_key=api_key
  )



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
        return { "answer": "Не удалось найти подходящую информацию", "imageIds": [] }

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
      model=model_id,
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
        logger.info("Ошибка: LLM не вернул ответ")


async def get_img(img_id: str) -> FileResponse:
    logger.info(f"Запрос на картинку: {img_id}")
    file_path = Path("src") / "data" / "img" / f"{img_id}.png"

    # Для отладки
    logger.info(f"Ищем файл: {file_path}")
    logger.info(f"Абсолютный путь: {file_path.absolute()}")

    if ".." in img_id or "/" in img_id or "\\" in img_id:
        logger.warning(f"Подозрительный запрос: {img_id}")
        raise HTTPException(status_code=400, detail="Invalid image ID")

    if not file_path.exists():
        logger.error(f"Ошибка: {img_id} не найдена")
        raise HTTPException(status_code=404, detail="Image not found")

    return FileResponse(
        path=file_path,
        media_type="image/png"
    )