FROM node:20-alpine

WORKDIR /app

# Копируем файлы зависимостей
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем всё остальное
COPY . .

# Собираем проект
#RUN npm run build



# Открываем порт
EXPOSE 3000

# Запускаем приложение
CMD ["npm", "run", "dev"]