# Техническое задание: Добавление методов API для новостроек на клиентском фронтенде

## 1. Общая информация

**Проект:** Клиентский фронтенд новостроек  
**Файл:** `client/src/services/api.js`  
**Цель:** Интеграция клиентского фронтенда с реальным API бэкенда для работы с новостройками

---

## 2. Текущее состояние

### 2.1. Бэкенд API (доступные эндпоинты)

#### Публичные эндпоинты (v1) для клиентского фронтенда:
- `GET /api/v1/projects` - Получить все новостройки
  - Query параметры: `district`, `status`, `type`, `areaMin`, `areaMax`, `priceMin`, `priceMax`
  - Возвращает: массив объектов проектов
  - Доступ: публичный (без авторизации)

- `GET /api/v1/projects/:id` - Получить новостройку по ID
  - Параметры: `id` (в URL)
  - Возвращает: объект проекта
  - Доступ: публичный (без авторизации)

#### Админские эндпоинты (требуют авторизации):
- `GET /api/projects` - Получить все проекты (с фильтрами)
- `GET /api/projects/:id` - Получить проект по ID
- `POST /api/projects` - Создать проект
- `PUT /api/projects/:id` - Обновить проект
- `DELETE /api/projects/:id` - Удалить проект

### 2.2. Текущее состояние фронтенда

**Файл:** `client/src/services/api.js`

**Текущие проблемы:**
1. Используется флаг `USE_MOCK_DATA = true` (моковые данные)
2. Используется неправильный базовый URL: `/api/projects` вместо `/api/v1/projects`
3. Отсутствует обработка ошибок сети
4. Нет поддержки пагинации
5. Нет поддержки сортировки

**Текущие методы:**
- `getProjects(filters)` - получение списка проектов с фильтрами
- `getProjectById(id)` - получение проекта по ID

---

## 3. Требования к реализации

### 3.1. Обязательные изменения

#### 3.1.1. Переключение на реальный API
- [ ] Изменить `USE_MOCK_DATA = false`
- [ ] Обновить базовый URL с `/api/projects` на `/api/v1/projects`
- [ ] Удалить или закомментировать моковую логику фильтрации

#### 3.1.2. Обновление метода `getProjects(filters)`

**Сигнатура:**
```javascript
async getProjects(filters = {})
```

**Параметры фильтров:**
- `district` (string) - район
- `status` (string) - статус проекта
- `type` (string) - тип проекта
- `areaMin` (number) - минимальная площадь
- `areaMin` (number) - максимальная площадь
- `priceMin` (number) - минимальная цена
- `priceMax` (number) - максимальная цена

**Реализация:**
1. Формировать query параметры из объекта `filters`
2. Выполнять GET запрос на `/api/v1/projects?{queryParams}`
3. Обрабатывать ошибки сети (404, 500, network error)
4. Возвращать массив проектов
5. Парсить JSON поля (`images`, `features`) если они приходят как строки

**Пример запроса:**
```javascript
GET /api/v1/projects?district=Центральный&status=Скоро сдача&priceMin=3000000&priceMax=10000000
```

#### 3.1.3. Обновление метода `getProjectById(id)`

**Сигнатура:**
```javascript
async getProjectById(id)
```

**Реализация:**
1. Выполнять GET запрос на `/api/v1/projects/${id}`
2. Обрабатывать ошибки (404 - проект не найден, 500 - ошибка сервера)
3. Парсить JSON поля (`images`, `features`) если они приходят как строки
4. Возвращать объект проекта

**Пример запроса:**
```javascript
GET /api/v1/projects/1
```

### 3.2. Дополнительные улучшения (опционально)

#### 3.2.1. Обработка ошибок
- [ ] Добавить try-catch блоки с понятными сообщениями об ошибках
- [ ] Обрабатывать сетевые ошибки (timeout, connection refused)
- [ ] Логировать ошибки в консоль для отладки

#### 3.2.2. Кэширование (опционально)
- [ ] Добавить кэширование списка проектов (localStorage/sessionStorage)
- [ ] Добавить TTL для кэша (например, 5 минут)
- [ ] Инвалидация кэша при обновлении данных

#### 3.2.3. Загрузка и индикаторы
- [ ] Возвращать Promise с поддержкой состояния загрузки
- [ ] Добавить таймауты для запросов (например, 10 секунд)

---

## 4. Структура данных

### 4.1. Объект проекта (Project)

```typescript
interface Project {
  id: number
  name: string
  district: string
  type: string
  description: string
  full_description: string
  price: string
  price_from: string
  completion: string
  rooms: string
  parking: string
  status: string
  discount: string | null
  image: string
  images: string[] | string  // JSON массив или строка JSON
  developer: string
  floors: string
  apartments: string
  area: string
  features: string[] | string  // JSON массив или строка JSON
  created_at: string
  updated_at: string
}
```

### 4.2. Обработка JSON полей

Поля `images` и `features` могут приходить как:
- Массив (если уже распарсены на бэкенде)
- JSON строка (если нужно распарсить на фронтенде)

**Пример обработки:**
```javascript
if (typeof project.images === 'string') {
  try {
    project.images = JSON.parse(project.images)
  } catch (e) {
    project.images = []
  }
}
```

---

## 5. Примеры реализации

### 5.1. Обновленный метод `getProjects`

```javascript
async getProjects(filters = {}) {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
  
  // Формируем query параметры
  const params = new URLSearchParams()
  
  if (filters.district) params.append('district', filters.district)
  if (filters.status) params.append('status', filters.status)
  if (filters.type) params.append('type', filters.type)
  if (filters.areaMin) params.append('areaMin', filters.areaMin)
  if (filters.areaMax) params.append('areaMax', filters.areaMax)
  if (filters.priceMin) params.append('priceMin', filters.priceMin)
  if (filters.priceMax) params.append('priceMax', filters.priceMax)

  const queryString = params.toString()
  const url = `${API_URL}/api/v1/projects${queryString ? `?${queryString}` : ''}`

  try {
    const response = await fetch(url)
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Проекты не найдены')
      }
      throw new Error(`Ошибка сервера: ${response.status}`)
    }

    const projects = await response.json()
    
    // Парсим JSON поля
    return projects.map(project => {
      if (project.images && typeof project.images === 'string') {
        try {
          project.images = JSON.parse(project.images)
        } catch (e) {
          project.images = []
        }
      }
      if (project.features && typeof project.features === 'string') {
        try {
          project.features = JSON.parse(project.features)
        } catch (e) {
          project.features = []
        }
      }
      return project
    })
  } catch (error) {
    console.error('Ошибка при загрузке проектов:', error)
    throw error
  }
}
```

### 5.2. Обновленный метод `getProjectById`

```javascript
async getProjectById(id) {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
  const url = `${API_URL}/api/v1/projects/${id}`

  try {
    const response = await fetch(url)
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Проект не найден')
      }
      throw new Error(`Ошибка сервера: ${response.status}`)
    }

    const project = await response.json()
    
    // Парсим JSON поля
    if (project.images && typeof project.images === 'string') {
      try {
        project.images = JSON.parse(project.images)
      } catch (e) {
        project.images = []
      }
    }
    if (project.features && typeof project.features === 'string') {
      try {
        project.features = JSON.parse(project.features)
      } catch (e) {
        project.features = []
      }
    }
    
    return project
  } catch (error) {
    console.error('Ошибка при загрузке проекта:', error)
    throw error
  }
}
```

---

## 6. Тестирование

### 6.1. Чек-лист тестирования

- [ ] Метод `getProjects()` возвращает список проектов
- [ ] Метод `getProjects()` работает с фильтрами (district, status, type)
- [ ] Метод `getProjects()` работает с числовыми фильтрами (areaMin, areaMax, priceMin, priceMax)
- [ ] Метод `getProjectById()` возвращает проект по ID
- [ ] Метод `getProjectById()` обрабатывает ошибку 404 (проект не найден)
- [ ] JSON поля (`images`, `features`) корректно парсятся
- [ ] Обрабатываются сетевые ошибки
- [ ] Страница HomePage корректно отображает проекты
- [ ] Страница ProjectDetailPage корректно отображает детали проекта
- [ ] Фильтры на HomePage работают корректно

### 6.2. Тестовые сценарии

1. **Загрузка списка проектов без фильтров**
   - Ожидаемый результат: отображаются все проекты

2. **Загрузка списка проектов с фильтром по району**
   - Ожидаемый результат: отображаются только проекты выбранного района

3. **Загрузка списка проектов с фильтром по цене**
   - Ожидаемый результат: отображаются только проекты в указанном диапазоне цен

4. **Загрузка детальной страницы проекта**
   - Ожидаемый результат: отображается вся информация о проекте

5. **Загрузка несуществующего проекта**
   - Ожидаемый результат: отображается сообщение об ошибке "Проект не найден"

---

## 7. Зависимости

### 7.1. Переменные окружения

Убедиться, что в `.env` файле клиентского фронтенда указан:
```env
VITE_API_URL=http://localhost:3000
```

### 7.2. Зависимости проекта

Текущие зависимости достаточны, дополнительные пакеты не требуются.

---

## 8. Порядок выполнения работ

1. **Подготовка**
   - [ ] Создать резервную копию текущего `api.js`
   - [ ] Убедиться, что бэкенд запущен и доступен

2. **Реализация**
   - [ ] Изменить `USE_MOCK_DATA = false`
   - [ ] Обновить базовый URL на `/api/v1/projects`
   - [ ] Реализовать метод `getProjects()` с обработкой ошибок
   - [ ] Реализовать метод `getProjectById()` с обработкой ошибок
   - [ ] Добавить парсинг JSON полей

3. **Тестирование**
   - [ ] Протестировать все методы вручную
   - [ ] Проверить работу фильтров
   - [ ] Проверить обработку ошибок

4. **Документация**
   - [ ] Обновить комментарии в коде
   - [ ] Обновить README (если необходимо)

---

## 9. Критерии приемки

✅ **Задача считается выполненной, если:**
1. Клиентский фронтенд использует реальный API вместо моковых данных
2. Все методы работают корректно с реальным бэкендом
3. Фильтры работают корректно
4. Обрабатываются все типы ошибок
5. JSON поля корректно парсятся и отображаются
6. Нет ошибок в консоли браузера
7. Страницы HomePage и ProjectDetailPage работают корректно

---

## 10. Дополнительные замечания

### 10.1. Совместимость с админ-панелью

Админ-панель использует `/api/projects` с авторизацией - это нормально, так как это отдельный эндпоинт для администраторов.

### 10.2. CORS

Убедиться, что бэкенд настроен для работы с CORS запросами от клиентского фронтенда.

### 10.3. Производительность

При большом количестве проектов рассмотреть возможность добавления пагинации на бэкенде и фронтенде.

---

## 11. Контакты и вопросы

При возникновении вопросов обращаться к разработчику бэкенда или техническому лиду проекта.

---

**Дата создания:** 2025-11-30  
**Версия:** 1.0  
**Статус:** К выполнению

