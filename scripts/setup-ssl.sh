#!/bin/bash

set -e

DOMAIN="admin-doman-horizont.ru"
EMAIL="admin@${DOMAIN}"  # Измените на ваш email

echo "🔒 Настройка SSL сертификата для домена ${DOMAIN}"

# Проверка наличия certbot
if ! command -v certbot &> /dev/null; then
    echo "📦 Установка certbot..."
    apt-get update -qq
    apt-get install -y -qq certbot python3-certbot-nginx
fi

# Остановка nginx контейнера для получения сертификата
echo "⏸️  Остановка nginx контейнера..."
cd /opt/house-backend
docker-compose --env-file .env.prod -f docker-compose.prod.yml stop nginx

# Получение сертификата
echo "📜 Получение SSL сертификата..."
certbot certonly --standalone \
    --preferred-challenges http \
    -d ${DOMAIN} \
    --email ${EMAIL} \
    --agree-tos \
    --non-interactive \
    --keep-until-expiring

# Создание директории для сертификатов в проекте
mkdir -p /opt/house-backend/ssl

# Копирование сертификатов
echo "📋 Копирование сертификатов..."
cp /etc/letsencrypt/live/${DOMAIN}/fullchain.pem /opt/house-backend/ssl/
cp /etc/letsencrypt/live/${DOMAIN}/privkey.pem /opt/house-backend/ssl/
chmod 644 /opt/house-backend/ssl/fullchain.pem
chmod 600 /opt/house-backend/ssl/privkey.pem

# Запуск nginx
echo "▶️  Запуск nginx контейнера..."
docker-compose --env-file .env.prod -f docker-compose.prod.yml up -d nginx

# Настройка автообновления сертификата
echo "🔄 Настройка автообновления сертификата..."
# Удаляем старую задачу, если есть
crontab -l 2>/dev/null | grep -v "certbot renew" | crontab - 2>/dev/null || true
# Добавляем новую задачу
(crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet --deploy-hook 'cd /opt/house-backend && cp /etc/letsencrypt/live/${DOMAIN}/fullchain.pem ssl/ && cp /etc/letsencrypt/live/${DOMAIN}/privkey.pem ssl/ && docker-compose --env-file .env.prod -f docker-compose.prod.yml exec nginx nginx -s reload'") | crontab -
echo "✅ Автообновление SSL настроено (проверка каждый день в 3:00)"

echo "✅ SSL сертификат установлен успешно!"
echo "🌐 Домен: https://${DOMAIN}"

