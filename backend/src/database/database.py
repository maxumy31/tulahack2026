import os
from typing import Annotated

from dotenv import load_dotenv
from fastapi import Depends
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase, MappedAsDataclass

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# ✅ Добавляем проверку и ошибку, если нет URL
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

# ✅ Для async нужен специальный URL с postgresql+asyncpg://
# Если в DATABASE_URL обычный postgresql://, заменяем на async
if DATABASE_URL.startswith("postgresql://"):
    ASYNC_DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
else:
    ASYNC_DATABASE_URL = DATABASE_URL

# ✅ Создаём асинхронный engine
engine = create_async_engine(
    ASYNC_DATABASE_URL,
    echo=True,  # опционально: логировать SQL запросы
    pool_size=5,  # размер пула соединений
    max_overflow=10,
)

new_session = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


class Base(MappedAsDataclass, DeclarativeBase):
    pass


async def get_db():
    async with new_session() as session:
        try:
            yield session
            await session.commit()  # ✅ автоматический commit при успехе
        except Exception:
            await session.rollback()  # ✅ откат при ошибке
            raise
        finally:
            await session.close()  # ✅ закрываем сессию


SessionDep = Annotated[AsyncSession, Depends(get_db)]