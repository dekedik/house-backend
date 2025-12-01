# Решение проблемы с WSL и Docker

## Обновление WSL (Windows Subsystem for Linux)

Если Docker выдает ошибку о том, что версия WSL слишком старая, выполните следующие шаги:

### Способ 1: Обновление через PowerShell (рекомендуется)

Откройте PowerShell **от имени администратора** и выполните:

```powershell
wsl --update
```

После обновления перезапустите WSL:

```powershell
wsl --shutdown
```

Затем перезапустите Docker Desktop.

### Способ 2: Обновление через Microsoft Store

1. Откройте Microsoft Store
2. Найдите "Windows Subsystem for Linux"
3. Нажмите "Обновить" если доступно обновление
4. Перезапустите компьютер

### Способ 3: Ручная установка последней версии

1. Откройте PowerShell от имени администратора
2. Выполните:
```powershell
wsl --install
```

Если WSL уже установлен, это обновит его до последней версии.

### Проверка версии WSL

После обновления проверьте версию:

```powershell
wsl --version
```

Должна быть версия 2.0 или выше.

### Перезапуск Docker Desktop

После обновления WSL:
1. Закройте Docker Desktop полностью
2. Запустите его снова
3. Дождитесь полной загрузки

## Альтернатива: Запуск без Docker

Если обновление WSL не помогает или вы хотите запустить проект локально:

### Требования
- Node.js 18+ 
- PostgreSQL (установленный локально или через Docker только для БД)

### Шаги для запуска без Docker

1. **Установите зависимости:**
```bash
cd backend && npm install
cd ../client && npm install
cd ../admin && npm install
```

2. **Настройте PostgreSQL:**
   - Установите PostgreSQL локально или запустите только контейнер БД:
   ```bash
   docker run -d --name postgres -e POSTGRES_DB=realestate -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD="9.&)YTf(Cq;R^DT" -p 5432:5432 postgres:15-alpine
   ```

3. **Настройте переменные окружения в backend:**
   Создайте файл `backend/.env`:
   ```
   NODE_ENV=development
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=realestate
   DB_USER=postgres
   DB_PASSWORD=9.&)YTf(Cq;R^DT
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   PORT=3000
   ```

4. **Запустите миграции:**
```bash
cd backend
npm run migrate
npm run seed
```

5. **Запустите сервисы в отдельных терминалах:**
```bash
# Терминал 1 - Backend
cd backend
npm run dev

# Терминал 2 - Client
cd client
npm run dev

# Терминал 3 - Admin (опционально)
cd admin
npm run dev
```

## Дополнительная информация

- [Официальная документация WSL](https://learn.microsoft.com/en-us/windows/wsl/)
- [Документация Docker Desktop для Windows](https://docs.docker.com/desktop/install/windows-install/)

