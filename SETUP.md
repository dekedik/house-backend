# Инструкция по запуску проекта

## Быстрый старт с Docker Compose

1. **Запустите все сервисы:**
```bash
docker-compose up -d
```

2. **Выполните миграции базы данных:**
```bash
docker-compose exec backend npm run migrate
```

3. **Создайте базового администратора:**
```bash
docker-compose exec backend npm run seed
```

4. **Откройте в браузере:**
   - Клиент: http://localhost:5173
   - Админ-панель: http://localhost:5174
   - API: http://localhost:3000

## Учетные данные

### Администратор
- **Логин**: `main_manager`
- **Пароль**: `7\gU%T$fVRt?pqB`

### База данных PostgreSQL
- **База данных**: `realestate`
- **Пользователь**: `postgres`
- **Пароль**: `9.&)YTf(Cq;R^DT`
- **Порт**: `5432`

## Структура проекта

```
valera/
├── client/          # Клиентское приложение (React)
├── admin/           # Админ-панель (React)
├── backend/         # Backend API (Node.js + Express + PostgreSQL)
└── docker-compose.yml
```

## Остановка сервисов

```bash
docker-compose down
```

## Очистка данных

```bash
docker-compose down -v
```

## Логи

```bash
# Все сервисы
docker-compose logs -f

# Конкретный сервис
docker-compose logs -f backend
docker-compose logs -f client
docker-compose logs -f admin
```

## Перезапуск сервиса

```bash
docker-compose restart backend
```

## Проблемы и решения

### Порт уже занят
Измените порты в `docker-compose.yml` или остановите процесс, использующий порт.

### База данных не подключается
Убедитесь, что PostgreSQL контейнер запущен:
```bash
docker-compose ps
```

### Ошибки миграций
Выполните миграции вручную:
```bash
docker-compose exec backend npm run migrate
```

