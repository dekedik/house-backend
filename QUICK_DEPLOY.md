# Быстрый деплой

## Данные сервера
- **IP:** 95.163.226.62
- **User:** root
- **Password:** WY8vUdt8XAnMrPRF
- **Директория:** /opt/house-backend

## Первоначальный деплой

### 1. Копирование файлов на сервер

```bash
# Автоматически (требует sshpass)
./scripts/deploy-remote.sh

# Или вручную
scp -r . root@95.163.226.62:/opt/house-backend/
```

### 2. Подключение к серверу

```bash
ssh root@95.163.226.62
```

### 3. Настройка на сервере

```bash
cd /opt/house-backend

# Создать .env.prod файл
cp env.prod.example .env.prod
nano .env.prod  # Заполните DB_PASSWORD и JWT_SECRET

# Установить права на скрипты
chmod +x scripts/*.sh

# Запустить деплой
./scripts/deploy-init.sh
```

## Обновление приложения

```bash
# На сервере
cd /opt/house-backend
./scripts/deploy-update.sh
```

Этот скрипт:
- ✅ Применит миграции БД
- ✅ Обновит код приложения
- ✅ Перезапустит контейнеры
- ❌ **НЕ изменит** файл `.env.prod`

## Проверка работы

После деплоя API будет доступно:
- `http://admin-doman-gorizont.ru/api`
- `http://95.163.226.62/api`

Проверка:
```bash
curl http://admin-doman-gorizont.ru/api/health
```

## Полезные команды

```bash
# Логи
docker-compose --env-file .env.prod -f docker-compose.prod.yml logs -f backend

# Статус
docker-compose --env-file .env.prod -f docker-compose.prod.yml ps

# Перезапуск
docker-compose --env-file .env.prod -f docker-compose.prod.yml restart backend
```

