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

# В режиме dev билд не нужен, Next сам всё подхватит
CMD ["npm", "run", "dev"]