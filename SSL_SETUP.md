# Настройка SSL сертификата

## Автоматическая установка (рекомендуется)

### 1. Подготовка

Убедитесь, что домен `admin-doman-gorizont.ru` указывает на IP сервера `95.163.226.62`:

```bash
# Проверка DNS
dig admin-doman-gorizont.ru +short
# Должен вернуть: 95.163.226.62
```

### 2. Установка SSL

```bash
# На сервере
cd /opt/house-backend
chmod +x scripts/setup-ssl.sh

# Отредактируйте email в скрипте (по умолчанию admin@admin-doman-gorizont.ru)
nano scripts/setup-ssl.sh

# Запустите установку
./scripts/setup-ssl.sh
```

### 3. Обновление конфигурации nginx

После установки SSL нужно переключиться на SSL конфигурацию:

```bash
cd /opt/house-backend

# Переименовать старую конфигурацию
mv nginx/conf.d/api.conf nginx/conf.d/api.conf.backup

# Переименовать SSL конфигурацию
mv nginx/conf.d/api-ssl.conf nginx/conf.d/api.conf

# Перезапустить nginx
docker-compose --env-file .env.prod -f docker-compose.prod.yml restart nginx
```

## Ручная установка

### 1. Установка certbot

```bash
apt-get update
apt-get install -y certbot python3-certbot-nginx
```

### 2. Получение сертификата

```bash
# Остановить nginx
docker-compose --env-file .env.prod -f docker-compose.prod.yml stop nginx

# Получить сертификат
certbot certonly --standalone \
    --preferred-challenges http \
    -d admin-doman-gorizont.ru \
    --email your-email@example.com \
    --agree-tos \
    --non-interactive

# Создать директорию для сертификатов
mkdir -p /opt/house-backend/ssl

# Скопировать сертификаты
cp /etc/letsencrypt/live/admin-doman-gorizont.ru/fullchain.pem /opt/house-backend/ssl/
cp /etc/letsencrypt/live/admin-doman-gorizont.ru/privkey.pem /opt/house-backend/ssl/
chmod 644 /opt/house-backend/ssl/fullchain.pem
chmod 600 /opt/house-backend/ssl/privkey.pem
```

### 3. Настройка автообновления

```bash
# Добавить в crontab
crontab -e

# Добавить строку:
0 3 * * * certbot renew --quiet --deploy-hook 'cd /opt/house-backend && cp /etc/letsencrypt/live/admin-doman-gorizont.ru/fullchain.pem ssl/ && cp /etc/letsencrypt/live/admin-doman-gorizont.ru/privkey.pem ssl/ && docker-compose --env-file .env.prod -f docker-compose.prod.yml exec nginx nginx -s reload'
```

## Проверка работы

После установки SSL проверьте:

```bash
# HTTPS должен работать
curl https://admin-doman-gorizont.ru/health

# HTTP должен редиректить на HTTPS
curl -I http://admin-doman-gorizont.ru/health
```

## Обновление сертификата

Сертификаты обновляются автоматически через cron. Для ручного обновления:

```bash
certbot renew
cd /opt/house-backend
cp /etc/letsencrypt/live/admin-doman-gorizont.ru/fullchain.pem ssl/
cp /etc/letsencrypt/live/admin-doman-gorizont.ru/privkey.pem ssl/
docker-compose --env-file .env.prod -f docker-compose.prod.yml exec nginx nginx -s reload
```

## Структура файлов

```
/opt/house-backend/
├── ssl/
│   ├── fullchain.pem    # SSL сертификат
│   └── privkey.pem      # Приватный ключ
└── nginx/
    └── conf.d/
        ├── api.conf          # Конфигурация с SSL
        └── api.conf.backup   # Старая конфигурация (без SSL)
```

