FROM node:20-alpine

RUN apk add --no-cache libc6-compat

WORKDIR /app

# Копируем только файлы зависимостей
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем остальной код
COPY . .

EXPOSE 3000

CMD ["sh", "-c", "npm run dev"]