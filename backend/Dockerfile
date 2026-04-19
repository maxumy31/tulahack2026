# Используем официальный образ Python
FROM python:3.12-slim

# Устанавливаем рабочую директорию
WORKDIR /app

# Устанавливаем uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Копируем файлы с зависимостями
COPY pyproject.toml uv.lock* ./

RUN apt-get update && apt-get install -y --no-install-recommends build-essential libpq-dev && rm -rf /var/lib/apt/lists/*

# Устанавливаем зависимости
RUN uv sync --frozen --no-dev

# Копируем остальной код
COPY . .

# Открываем порт (обычно 8000 для FastAPI)
EXPOSE 8000

# Запускаем приложение
CMD ["uv", "run", "uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]