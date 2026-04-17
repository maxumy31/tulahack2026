from fastapi import FastAPI
from src.schemas.chat import ChatRequest
from src.services.rag import Rag

app = FastAPI()

@app.post("/chat_request")
async def get_answer(request: ChatRequest) -> dict:
    answer = await Rag.get_answer(request.question)
    return {"answer": answer}