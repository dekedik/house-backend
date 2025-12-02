#!/bin/bash

set -e

echo "🚀 Начало первоначального деплоя..."

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Проверка наличия .env файла
if [ ! -f .env.prod ]; then
    echo -e "${RED}❌ Файл .env.prod не найден!${NC}"
    echo -e "${YELLOW}Создайте файл .env.prod на основе env.prod.example${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Файл .env.prod найден${NC}"

# Проверка наличия docker и docker-compose
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker не установлен!${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose не установлен!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker и Docker Compose установлены${NC}"

# Остановка существующих контейнеров (если есть)
echo -e "${YELLOW}Остановка существующих контейнеров...${NC}"
docker-compose --env-file .env.prod -f docker-compose.prod.yml down 2>/dev/null || true

# Сборка образов
echo -e "${YELLOW}Сборка Docker образов...${NC}"
docker-compose --env-file .env.prod -f docker-compose.prod.yml build --no-cache

# Запуск контейнеров
echo -e "${YELLOW}Запуск контейнеров...${NC}"
docker-compose --env-file .env.prod -f docker-compose.prod.yml up -d

# Ожидание готовности PostgreSQL
echo -e "${YELLOW}Ожидание готовности PostgreSQL...${NC}"
sleep 10

# Проверка готовности PostgreSQL
for i in {1..30}; do
    if docker-compose --env-file .env.prod -f docker-compose.prod.yml exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PostgreSQL готов${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ PostgreSQL не запустился за 30 секунд${NC}"
        exit 1
    fi
    sleep 1
done

# Выполнение миграций
echo -e "${YELLOW}Выполнение миграций БД...${NC}"
docker-compose --env-file .env.prod -f docker-compose.prod.yml exec -T backend npm run migrate-all

# Создание администратора (если нужно)
echo -e "${YELLOW}Создание администратора...${NC}"
docker-compose --env-file .env.prod -f docker-compose.prod.yml exec -T backend npm run seed || echo -e "${YELLOW}⚠️  Администратор уже существует${NC}"

# Проверка работоспособности
echo -e "${YELLOW}Проверка работоспособности API...${NC}"
sleep 5

if curl -f http://localhost/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ API работает корректно${NC}"
else
    echo -e "${YELLOW}⚠️  API не отвечает на /health, проверьте логи${NC}"
fi

echo -e "${GREEN}✅ Деплой завершен успешно!${NC}"
echo -e "${GREEN}API доступен по адресу: http://admin-doman-gorizont.ru/api${NC}"

# Показать статус контейнеров
echo -e "\n${YELLOW}Статус контейнеров:${NC}"
docker-compose --env-file .env.prod -f docker-compose.prod.yml ps

