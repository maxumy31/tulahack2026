# Используем официальный образ Python
FROM python:3.12-slim

# Устанавливаем рабочую директорию
WORKDIR /app

# Устанавливаем uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Копируем файлы с зависимостями
COPY pyproject.toml uv.lock* ./

# Устанавливаем зависимости
RUN uv sync --frozen --no-dev

# Копируем остальной код
COPY . .

# Открываем порт (обычно 8000 для FastAPI)
EXPOSE 8000

# Запускаем приложение
CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]