#!/bin/bash

set -e

export DEBIAN_FRONTEND=noninteractive

echo "=== Установка Docker ==="

# Обновление пакетов
apt-get update -qq

# Установка зависимостей
apt-get install -y -qq ca-certificates curl gnupg lsb-release

# Добавление GPG ключа Docker
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --batch --yes --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

# Добавление репозитория Docker
ARCH=$(dpkg --print-architecture)
echo "deb [arch=${ARCH} signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Обновление пакетов
apt-get update -qq

# Установка Docker (с автоматическим подтверждением)
apt-get install -y -qq --allow-unauthenticated docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin || \
apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Проверка установки
echo "=== Проверка установки ==="
docker --version
docker compose version

echo "=== Docker установлен успешно ==="

