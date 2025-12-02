FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

# Настройка вывода без буферизации для корректного логирования в Docker
ENV NODE_ENV=development
ENV PYTHONUNBUFFERED=1

CMD ["npm", "run", "dev"]

