# Инструкция по деплою

## Подготовка к деплою

### 1. Создание файла .env.prod

Создайте файл `.env.prod` на основе `env.prod.example`:

```bash
cp env.prod.example .env.prod
```

Отредактируйте `.env.prod` и укажите:
- `DB_PASSWORD` - надежный пароль для PostgreSQL
- `JWT_SECRET` - случайная строка для JWT токенов

### 2. Настройка сервера

Убедитесь, что на сервере установлены:
- Docker
- Docker Compose

## Деплой на удаленный сервер

### Автоматический деплой (рекомендуется)

Используйте скрипт для копирования файлов на сервер:

```bash
./scripts/deploy-remote.sh
```

Затем на сервере выполните:

```bash
cd /opt/house-backend
./scripts/deploy-init.sh
```

### Ручной деплой

1. Скопируйте файлы на сервер:

```bash
scp -r . root@95.163.226.62:/opt/house-backend/
```

2. Подключитесь к серверу:

```bash
ssh root@95.163.226.62
```

3. Перейдите в директорию проекта:

```bash
cd /opt/house-backend
```

4. Создайте файл `.env.prod` (если еще не создан):

```bash
nano .env.prod
```

5. Выполните первоначальный деплой:

```bash
chmod +x scripts/*.sh
./scripts/deploy-init.sh
```

## Обновление приложения

Для обновления приложения без изменения переменных окружения:

```bash
cd /opt/house-backend
./scripts/deploy-update.sh
```

Этот скрипт:
- ✅ Получит последние изменения из git (если используется)
- ✅ Соберет новые Docker образы
- ✅ Применит миграции БД
- ✅ Перезапустит backend контейнер
- ✅ **НЕ изменит** файл `.env.prod`

## Структура деплоя

```
/opt/house-backend/
├── docker-compose.prod.yml    # Конфигурация для продакшн
├── .env.prod                  # Переменные окружения (не коммитится)
├── nginx/                     # Конфигурация nginx
│   ├── nginx.conf
│   └── conf.d/
│       └── api.conf
└── scripts/
    ├── deploy-init.sh         # Первоначальный деплой
    └── deploy-update.sh       # Обновление приложения
```

## Доступ к API

После деплоя API будет доступно по адресу:
- `http://admin-doman-gorizont.ru/api`
- API работает с любыми доменами (CORS настроен)

## Полезные команды

### Просмотр логов

```bash
# Логи всех сервисов
docker-compose --env-file .env.prod -f docker-compose.prod.yml logs -f

# Логи backend
docker-compose --env-file .env.prod -f docker-compose.prod.yml logs -f backend

# Логи nginx
docker-compose --env-file .env.prod -f docker-compose.prod.yml logs -f nginx

# Логи postgres
docker-compose --env-file .env.prod -f docker-compose.prod.yml logs -f postgres
```

### Остановка/Запуск

```bash
# Остановка всех сервисов
docker-compose --env-file .env.prod -f docker-compose.prod.yml stop

# Запуск всех сервисов
docker-compose --env-file .env.prod -f docker-compose.prod.yml start

# Перезапуск
docker-compose --env-file .env.prod -f docker-compose.prod.yml restart
```

### Выполнение миграций вручную

```bash
docker-compose --env-file .env.prod -f docker-compose.prod.yml exec backend npm run migrate-all
```

### Создание администратора

```bash
docker-compose --env-file .env.prod -f docker-compose.prod.yml exec backend npm run seed
```

### Проверка статуса

```bash
docker-compose --env-file .env.prod -f docker-compose.prod.yml ps
```

### Вход в контейнер

```bash
# Backend контейнер
docker-compose --env-file .env.prod -f docker-compose.prod.yml exec backend sh

# PostgreSQL контейнер
docker-compose --env-file .env.prod -f docker-compose.prod.yml exec postgres psql -U postgres -d realestate
```

## Устранение проблем

### API не отвечает

1. Проверьте статус контейнеров:
```bash
docker-compose --env-file .env.prod -f docker-compose.prod.yml ps
```

2. Проверьте логи:
```bash
docker-compose --env-file .env.prod -f docker-compose.prod.yml logs backend
```

3. Проверьте nginx:
```bash
docker-compose --env-file .env.prod -f docker-compose.prod.yml logs nginx
```

### Ошибки миграций

Если миграции не применяются:

```bash
# Выполните миграции вручную
docker-compose --env-file .env.prod -f docker-compose.prod.yml exec backend npm run migrate-all
```

### Проблемы с nginx

Перезагрузите конфигурацию nginx:

```bash
docker-compose --env-file .env.prod -f docker-compose.prod.yml exec nginx nginx -s reload
```

Или перезапустите контейнер:

```bash
docker-compose --env-file .env.prod -f docker-compose.prod.yml restart nginx
```

## Безопасность

⚠️ **Важно:**
- Не коммитьте файл `.env.prod` в git
- Используйте надежные пароли для БД и JWT_SECRET
- Настройте SSL сертификаты для HTTPS (рекомендуется)
- Ограничьте доступ к серверу через firewall

