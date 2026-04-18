FROM node:20-alpine

# Устанавливаем зависимости для сборки нативных модулей (если пригодятся)
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Сначала только файлы зависимостей (используем кэш слоев)
COPY package*.json ./
RUN npm install

# Копируем остальное (при hot reload это будет перекрыто волюмом из compose)
COPY . .

EXPOSE 3000

# Генерируем и применяем миграции, затем запускаем dev сервер
CMD ["sh", "-c", "npm run db:generate && npm run db:migrate && npm run dev"]