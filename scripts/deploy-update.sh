#!/bin/bash

set -e

echo "🔄 Начало обновления приложения..."

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Проверка наличия .env файла
if [ ! -f .env.prod ]; then
    echo -e "${RED}❌ Файл .env.prod не найден!${NC}"
    echo -e "${YELLOW}Файл .env.prod необходим для работы приложения${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Файл .env.prod найден (не будет обновлен)${NC}"

# Проверка наличия docker и docker-compose
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker не установлен!${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose не установлен!${NC}"
    exit 1
fi

# Получение последних изменений из git (если используется git)
if [ -d .git ]; then
    echo -e "${YELLOW}Получение последних изменений из git...${NC}"
    git pull || echo -e "${YELLOW}⚠️  Не удалось получить изменения из git${NC}"
fi

# Сборка новых образов
echo -e "${YELLOW}Сборка новых Docker образов...${NC}"
docker-compose --env-file .env.prod -f docker-compose.prod.yml build

# Остановка backend контейнера (nginx и postgres продолжают работать)
echo -e "${YELLOW}Остановка backend контейнера...${NC}"
docker-compose --env-file .env.prod -f docker-compose.prod.yml stop backend

# Применение миграций (если есть новые)
echo -e "${YELLOW}Проверка и применение миграций БД...${NC}"
# Запускаем временный контейнер для миграций
docker-compose --env-file .env.prod -f docker-compose.prod.yml run --rm backend npm run migrate-all

# Перезапуск backend контейнера с новым образом
echo -e "${YELLOW}Перезапуск backend контейнера...${NC}"
docker-compose --env-file .env.prod -f docker-compose.prod.yml up -d backend

# Перезагрузка nginx конфигурации (если изменилась)
echo -e "${YELLOW}Перезагрузка nginx...${NC}"
docker-compose --env-file .env.prod -f docker-compose.prod.yml exec nginx nginx -s reload || docker-compose --env-file .env.prod -f docker-compose.prod.yml restart nginx

# Ожидание готовности backend
echo -e "${YELLOW}Ожидание готовности backend...${NC}"
sleep 5

# Проверка работоспособности
echo -e "${YELLOW}Проверка работоспособности API...${NC}"
for i in {1..10}; do
    if curl -f http://localhost/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ API работает корректно${NC}"
        break
    fi
    if [ $i -eq 10 ]; then
        echo -e "${YELLOW}⚠️  API не отвечает, проверьте логи: docker-compose -f docker-compose.prod.yml logs backend${NC}"
    fi
    sleep 2
done

# Очистка старых образов (опционально)
echo -e "${YELLOW}Очистка неиспользуемых Docker образов...${NC}"
docker image prune -f

echo -e "${GREEN}✅ Обновление завершено успешно!${NC}"

# Показать статус контейнеров
echo -e "\n${YELLOW}Статус контейнеров:${NC}"
docker-compose --env-file .env.prod -f docker-compose.prod.yml ps

