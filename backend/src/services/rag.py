import asyncio
from src.schemas.chat import ChatRequest

class Rag:
    @classmethod
    async def get_answer(cls, request: str):
        await asyncio.sleep(1)
        print("Обрабатываю запрос: ", request)
        result = f"Вот 5 наиболее подходящих чанков"
        return result