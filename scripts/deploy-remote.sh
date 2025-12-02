#!/bin/bash

set -e

# Конфигурация сервера
SERVER_IP="95.163.226.62"
SERVER_USER="root"
SERVER_PASSWORD="WY8vUdt8XAnMrPRF"
REMOTE_DIR="/opt/house-backend"

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Деплой на удаленный сервер${NC}"
echo -e "${YELLOW}Сервер: ${SERVER_USER}@${SERVER_IP}${NC}"
echo -e "${YELLOW}Директория: ${REMOTE_DIR}${NC}"

# Проверка наличия sshpass
if ! command -v sshpass &> /dev/null; then
    echo -e "${RED}❌ sshpass не установлен!${NC}"
    echo -e "${YELLOW}Установите: brew install hudochenkov/sshpass/sshpass (macOS) или apt-get install sshpass (Linux)${NC}"
    exit 1
fi

# Функция для выполнения команд на удаленном сервере
remote_exec() {
    sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no "${SERVER_USER}@${SERVER_IP}" "$1"
}

# Функция для копирования файлов на удаленный сервер
remote_copy() {
    sshpass -p "$SERVER_PASSWORD" scp -o StrictHostKeyChecking=no -r "$1" "${SERVER_USER}@${SERVER_IP}:$2"
}

# Создание директории на сервере
echo -e "${YELLOW}Создание директории на сервере...${NC}"
remote_exec "mkdir -p ${REMOTE_DIR}"

# Копирование файлов проекта
echo -e "${YELLOW}Копирование файлов проекта...${NC}"
remote_copy "./*" "${REMOTE_DIR}/"

# Исключение ненужных файлов
remote_exec "cd ${REMOTE_DIR} && rm -rf node_modules .git"

# Установка прав на скрипты
echo -e "${YELLOW}Установка прав на скрипты...${NC}"
remote_exec "chmod +x ${REMOTE_DIR}/scripts/*.sh"

# Проверка наличия .env.prod на сервере
echo -e "${YELLOW}Проверка наличия .env.prod на сервере...${NC}"
if remote_exec "test -f ${REMOTE_DIR}/.env.prod"; then
    echo -e "${GREEN}✅ Файл .env.prod существует на сервере${NC}"
else
    echo -e "${YELLOW}⚠️  Файл .env.prod не найден на сервере${NC}"
    echo -e "${YELLOW}Создайте его вручную или скопируйте:${NC}"
    echo -e "${YELLOW}  scp .env.prod ${SERVER_USER}@${SERVER_IP}:${REMOTE_DIR}/.env.prod${NC}"
fi

echo -e "${GREEN}✅ Файлы скопированы на сервер${NC}"
echo -e "${YELLOW}Для завершения деплоя выполните на сервере:${NC}"
echo -e "${YELLOW}  cd ${REMOTE_DIR} && ./scripts/deploy-init.sh${NC}"
echo -e "${YELLOW}Или для обновления:${NC}"
echo -e "${YELLOW}  cd ${REMOTE_DIR} && ./scripts/deploy-update.sh${NC}"

