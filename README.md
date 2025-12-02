# Backend API

Backend API для агентства недвижимости на Node.js + Express + PostgreSQL.

## Быстрый старт с Docker

### 1. Установка зависимостей
```bash
npm install
```

### 2. Запуск проекта
```bash
# Запустить PostgreSQL и Backend в Docker
docker-compose up -d

# Выполнить миграции БД
docker-compose exec backend npm run migrate-all

# Создать базового администратора
docker-compose exec backend npm run seed
```

### 3. Проверка работоспособности
```bash
# Запустить тесты API
npm run test
```

Сервер будет доступен по адресу: `http://localhost:3000`

**Учетные данные администратора:**
- Логин: `main_manager`
- Пароль: `7gU%T$fVRt?pqB`

## Локальный запуск (без Docker)

### Установка
```bash
npm install
```

### Настройка

Создайте файл `.env`:

```env
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=realestate
DB_USER=postgres
DB_PASSWORD=9.&)YTf(Cq;R^DT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PORT=3000
```

### Запуск

#### Разработка
```bash
npm run dev
```

#### Продакшн
```bash
npm start
```

### Миграции

```bash
# Выполнить все миграции
npm run migrate-all

# Создать базового администратора
npm run seed
```

## Тестирование

Запустить полный набор тестов API:

```bash
npm run test
```

Тесты проверяют:
- ✅ Health Check
- ✅ Авторизация (login, verify)
- ✅ Проекты (CRUD операции)
- ✅ Дома (CRUD операции)
- ✅ Клиенты (CRUD операции)
- ✅ Заявки (CRUD операции)
- ✅ Пользователи (CRUD операции)
- ✅ Публичные API (v1/projects, v1/houses, v1/callbacks)

## API Endpoints

### Авторизация
- `POST /api/auth/login` - Вход в систему
- `GET /api/auth/verify` - Проверка токена

### Проекты (Admin API)
- `GET /api/projects` - Получить все проекты
- `GET /api/projects/:id` - Получить проект по ID
- `POST /api/projects` - Создать проект (требует авторизации)
- `PUT /api/projects/:id` - Обновить проект (требует авторизации)
- `DELETE /api/projects/:id` - Удалить проект (требует авторизации)

### Публичные API для клиентских фронтендов (v1)

#### Новостройки
- `GET /api/v1/projects` - Получить все новостройки (публичный доступ)
  - Query параметры: `district`, `status`, `type`, `areaMin`, `areaMax`, `priceMin`, `priceMax`
- `GET /api/v1/projects/:id` - Получить новостройку по ID (публичный доступ)

#### Дома
- `GET /api/v1/houses` - Получить все дома (публичный доступ)
  - Query параметры: `project_id`, `status`, `search`, `floor`, `rooms`, `areaMin`, `areaMax`, `priceMin`, `priceMax`
- `GET /api/v1/houses/:id` - Получить дом по ID (публичный доступ)

#### Заявки на звонок
- `POST /api/v1/callbacks` - Создать заявку на звонок (публичный доступ)
  - Body: `{ name, phone, reason, project_id?, house_id?, notes? }`

## Деплой на продакшн сервер

Подробная инструкция по деплою находится в файле [DEPLOY.md](./DEPLOY.md)

### Быстрый старт

1. Создайте файл `.env.prod` на основе `env.prod.example`
2. Скопируйте файлы на сервер
3. Выполните на сервере:
   ```bash
   cd /opt/house-backend
   ./scripts/deploy-init.sh
   ```

### Обновление приложения

```bash
cd /opt/house-backend
./scripts/deploy-update.sh
```

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
│   ├── seed.js               # Скрипт создания админа
│   ├── deploy-init.sh        # Скрипт первоначального деплоя
│   └── deploy-update.sh      # Скрипт обновления
├── nginx/                    # Конфигурация nginx
│   ├── nginx.conf
│   └── conf.d/
│       └── api.conf
└── server.js                 # Главный файл сервера
```

