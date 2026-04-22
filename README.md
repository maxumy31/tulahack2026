# Запуск приложения с Docker Compose

Это приложение использует Docker Compose для управления несколькими сервисами: веб-приложением (Next.js), бэкенд-приложением (Python/FastAPI), базой данных (PostgreSQL) и векторной базой данных (pgvector).

## Предварительные требования

- Docker и Docker Compose
- Токен Open Router / Локальная модель
- Наличие модели для ретрива

## Быстрый старт

### 1. Клонирование и подготовка

```bash
git clone <repository-url>
cd tulahack2026
```

### 2. Копирование модели ретривера

Поместить модель e5_custom в папку пути backend/

### 2. Запуск Docker Compose

```bash
docker compose up --build
```

### 4. Доступ к приложению

- **Веб-приложение**: http://localhost:3000
- **Бэкенд API**: http://localhost:8000
- **База данных**: localhost:5432 (PostgreSQL)
- **Векторная база данных**: localhost:5433 (pgvector)

Токен доступа по умолчанию: default-token

## Конфигурация переменных окружения

Основные переменные окружения настраиваются в файле `docker-compose.yml` в секции `environment` для сервиса `backend`.

### Сценарий 1: Использование OpenRouter

OpenRouter — это сервис, предоставляющий доступ к различным LLM моделям через единый API.

**Необходимые переменные окружения:**

```yaml
backend:
  environment:
    OPENROUTER_API_KEY: "your_openrouter_api_key_here"   # Ваш API ключ от OpenRouter
    LLM_URL: "https://openrouter.ai/api/v1"              # URL API OpenRouter
    LLM_NAME: "inclusionai/ling-2.6-flash:free"          # Название модели
```

### Сценарий 2: Локальный LLM сервер

Для локального использования требуется LLM-сервер, совместимый с OpenAI API.

**Необходимые переменные окружения:**

```yaml
backend:
  environment:
    LLM_URL: "http://localhost:8001"                # URL локального LLM сервера
    LLM_NAME: "модель-на-вашем-сервере"             # Название модели на локальном сервере
    OPENROUTER_API_KEY: "any-string"                # Может быть любая строка или реальный ключ
```
