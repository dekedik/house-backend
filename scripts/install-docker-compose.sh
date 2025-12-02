#!/bin/bash

set -e

echo "=== Установка docker-compose (standalone) ==="

# Проверка, установлен ли уже docker-compose
if command -v docker-compose &> /dev/null; then
    echo "docker-compose уже установлен:"
    docker-compose --version
    exit 0
fi

# Установка docker-compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Проверка установки
echo "=== Проверка установки ==="
docker-compose --version

echo "=== docker-compose установлен успешно ==="

