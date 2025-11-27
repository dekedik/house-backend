# Backend API

Backend API для агентства недвижимости на Node.js + Express + PostgreSQL.

## Установка

```bash
npm install
```

## Настройка

Создайте файл `.env` на основе `.env.example`:

```env
NODE_ENV=development
DB_HOST=postgres
DB_PORT=5432
DB_NAME=realestate
DB_USER=postgres
DB_PASSWORD=9.&)YTf(Cq;R^DT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PORT=3000
```

## Запуск

### Разработка
```bash
npm run dev
```

### Продакшн
```bash
npm start
```

## Миграции

```bash
# Выполнить миграции
npm run migrate

# Создать базового администратора
npm run seed
```

## API Endpoints

### Авторизация
- `POST /api/auth/login` - Вход в систему
- `GET /api/auth/verify` - Проверка токена

### Проекты
- `GET /api/projects` - Получить все проекты
- `GET /api/projects/:id` - Получить проект по ID
- `POST /api/projects` - Создать проект (требует авторизации)
- `PUT /api/projects/:id` - Обновить проект (требует авторизации)
- `DELETE /api/projects/:id` - Удалить проект (требует авторизации)

## Структура

```
backend/
├── db/
│   ├── index.js              # Подключение к БД
│   └── migrations/           # SQL миграции
├── middleware/
│   └── auth.js               # JWT middleware
├── routes/
│   ├── auth.js               # Роуты авторизации
│   └── projects.js           # Роуты проектов
├── scripts/
│   ├── migrate.js            # Скрипт миграций
│   └── seed.js               # Скрипт создания админа
└── server.js                 # Главный файл сервера
```

