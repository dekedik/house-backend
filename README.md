# Real Estate Agency - Новостройки

Полнофункциональное приложение для агентства недвижимости с клиентской частью, админ-панелью и бекенд API.

## Структура проекта

- `client/` - Клиентское приложение (React + Vite)
- `admin/` - Админ-панель (React + Vite)
- `backend/` - Backend API (Node.js + Express + PostgreSQL)

## Технологии

- **Frontend**: React, Tailwind CSS, Vite
- **Backend**: Node.js, Express, PostgreSQL
- **Авторизация**: JWT
- **Контейнеризация**: Docker, Docker Compose

## Быстрый старт

### Предварительные требования

- Docker и Docker Compose
- Node.js 18+ (для локальной разработки без Docker)

### Запуск через Docker Compose

1. Клонируйте репозиторий:
```bash
git clone <repository-url>
cd valera
```

2. Запустите все сервисы:
```bash
docker-compose up -d
```

3. Выполните миграции базы данных:
```bash
docker-compose exec backend npm run migrate
```

4. Создайте базового администратора:
```bash
docker-compose exec backend npm run seed
```

5. Откройте в браузере:
   - Клиент: http://localhost:5173
   - Админ-панель: http://localhost:5174
   - API: http://localhost:3000

### Учетные данные администратора

- **Логин**: `main_manager`
- **Пароль**: `7\gU%T$fVRt?pqB`

### Локальная разработка (без Docker)

1. Установите зависимости:
```bash
cd backend && npm install
cd ../client && npm install
cd ../admin && npm install
```

2. Настройте PostgreSQL:
   - Создайте базу данных `realestate`
   - Пароль: `9.&)YTf(Cq;R^DT`

3. Настройте переменные окружения:
   - Скопируйте `.env.example` в `.env` в каждой директории
   - Обновите значения при необходимости

4. Запустите миграции:
```bash
cd backend
npm run migrate
npm run seed
```

5. Запустите сервисы:
```bash
# Backend
cd backend && npm run dev

# Client (в новом терминале)
cd client && npm run dev

# Admin (в новом терминале)
cd admin && npm run dev
```

## API Endpoints

### Авторизация
- `POST /api/auth/login` - Вход в систему
- `GET /api/auth/verify` - Проверка токена

### Проекты
- `GET /api/projects` - Получить все проекты (публичный)
- `GET /api/projects/:id` - Получить проект по ID (публичный)
- `POST /api/projects` - Создать проект (требует авторизации)
- `PUT /api/projects/:id` - Обновить проект (требует авторизации)
- `DELETE /api/projects/:id` - Удалить проект (требует авторизации)

## Структура базы данных

### Таблица `users`
- `id` - ID пользователя
- `username` - Логин
- `password_hash` - Хеш пароля
- `created_at` - Дата создания
- `updated_at` - Дата обновления

### Таблица `projects`
- `id` - ID проекта
- `name` - Название проекта
- `district` - Район
- `type` - Тип ЖК
- `description` - Краткое описание
- `full_description` - Полное описание
- `price` - Цена за м²
- `price_from` - Цена от
- `completion` - Срок сдачи
- `rooms` - Количество комнат
- `parking` - Парковка
- `status` - Статус (Сданные, Строятся, Старт продаж)
- `discount` - Скидка
- `image` - Главное изображение
- `images` - Дополнительные изображения (JSONB)
- `developer` - Застройщик
- `floors` - Этажность
- `apartments` - Количество квартир
- `area` - Площадь квартир
- `features` - Инфраструктура (JSONB)
- `created_at` - Дата создания
- `updated_at` - Дата обновления

## Разработка

### Добавление новых функций

1. Обновите схему БД в `backend/db/migrations/`
2. Обновите API endpoints в `backend/routes/`
3. Обновите клиентские компоненты
4. Обновите админ-панель при необходимости

### Тестирование

```bash
# Проверка здоровья API
curl http://localhost:3000/health
```

## Лицензия

MIT
