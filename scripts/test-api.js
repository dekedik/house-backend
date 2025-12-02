// Используем встроенный fetch (Node.js 18+)
const BASE_URL = process.env.API_URL || 'http://localhost:3000'
const ADMIN_USERNAME = 'main_manager'
const ADMIN_PASSWORD = '7gU%T$fVRt?pqB'

let authToken = null
let createdProjectId = null
let createdHouseId = null
let createdClientId = null
let createdApplicationId = null

// Цвета для вывода
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logTest(name) {
  log(`\n🧪 Тест: ${name}`, 'cyan')
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green')
}

function logError(message) {
  log(`❌ ${message}`, 'red')
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue')
}

async function makeRequest(method, endpoint, body = null, token = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  }

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`
  }

  if (body) {
    options.body = JSON.stringify(body)
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options)
    const data = await response.json().catch(() => ({ error: 'Invalid JSON response' }))
    return { status: response.status, data }
  } catch (error) {
    return { status: 0, data: { error: error.message } }
  }
}

async function testHealthCheck() {
  logTest('Health Check')
  const { status, data } = await makeRequest('GET', '/health')
  
  if (status === 200 && data.status === 'ok') {
    logSuccess('Сервер работает')
    return true
  } else {
    logError(`Сервер не отвечает: ${JSON.stringify(data)}`)
    return false
  }
}

async function testAuth() {
  logTest('Авторизация')
  
  // Тест входа
  logInfo('Вход в систему...')
  const loginResponse = await makeRequest('POST', '/api/auth/login', {
    username: ADMIN_USERNAME,
    password: ADMIN_PASSWORD,
  })

  if (loginResponse.status === 200 && loginResponse.data.token) {
    authToken = loginResponse.data.token
    logSuccess(`Вход выполнен. Токен получен: ${authToken.substring(0, 20)}...`)
  } else {
    logError(`Ошибка входа: ${JSON.stringify(loginResponse.data)}`)
    return false
  }

  // Тест проверки токена
  logInfo('Проверка токена...')
  const verifyResponse = await makeRequest('GET', '/api/auth/verify', null, authToken)

  if (verifyResponse.status === 200 && verifyResponse.data.valid) {
    logSuccess(`Токен валиден. Пользователь: ${verifyResponse.data.user.username}`)
    return true
  } else {
    logError(`Токен невалиден: ${JSON.stringify(verifyResponse.data)}`)
    return false
  }
}

async function testProjects() {
  logTest('Проекты (CRUD)')
  
  // Создание проекта
  logInfo('Создание проекта...')
  const newProject = {
    name: 'Тестовый ЖК "Солнечный"',
    district: 'Центральный',
    type: 'Новостройка',
    description: 'Современный жилой комплекс',
    fullDescription: 'Полное описание тестового проекта',
    price: 'от 5 000 000 руб.',
    priceFrom: '5000000',
    completion: '2025 Q4',
    rooms: '1, 2, 3',
    parking: 'Подземная',
    status: 'Строительство',
    discount: '5%',
    image: 'https://example.com/image.jpg',
    images: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
    developer: 'ООО "СтройКом"',
    floors: '10',
    apartments: '120',
    area: 'от 35 м²',
    features: ['Парковка', 'Детская площадка', 'Охрана'],
  }

  const createResponse = await makeRequest('POST', '/api/projects', newProject, authToken)
  
  if (createResponse.status === 201 && createResponse.data.id) {
    createdProjectId = createResponse.data.id
    logSuccess(`Проект создан с ID: ${createdProjectId}`)
  } else {
    logError(`Ошибка создания проекта: ${JSON.stringify(createResponse.data)}`)
    return false
  }

  // Получение всех проектов
  logInfo('Получение всех проектов...')
  const getAllResponse = await makeRequest('GET', '/api/projects', null, authToken)
  
  if (getAllResponse.status === 200 && Array.isArray(getAllResponse.data)) {
    logSuccess(`Получено проектов: ${getAllResponse.data.length}`)
  } else {
    logError(`Ошибка получения проектов: ${JSON.stringify(getAllResponse.data)}`)
  }

  // Получение проекта по ID
  logInfo(`Получение проекта по ID: ${createdProjectId}...`)
  const getByIdResponse = await makeRequest('GET', `/api/projects/${createdProjectId}`, null, authToken)
  
  if (getByIdResponse.status === 200 && getByIdResponse.data.id === createdProjectId) {
    logSuccess('Проект получен по ID')
  } else {
    logError(`Ошибка получения проекта: ${JSON.stringify(getByIdResponse.data)}`)
  }

  // Обновление проекта
  logInfo('Обновление проекта...')
  const updateData = {
    name: 'Тестовый ЖК "Солнечный" (обновлен)',
    status: 'Сдан',
  }
  const updateResponse = await makeRequest('PUT', `/api/projects/${createdProjectId}`, updateData, authToken)
  
  if (updateResponse.status === 200 && updateResponse.data.name === updateData.name) {
    logSuccess('Проект обновлен')
  } else {
    logError(`Ошибка обновления проекта: ${JSON.stringify(updateResponse.data)}`)
  }

  return true
}

async function testHouses() {
  logTest('Дома (CRUD)')
  
  if (!createdProjectId) {
    logError('Необходимо сначала создать проект')
    return false
  }

  // Создание дома
  logInfo('Создание дома...')
  const newHouse = {
    project_id: createdProjectId,
    number: 'Корпус 1, кв. 101',
    floor: 5,
    area: 65.5,
    rooms: 2,
    price: 6500000,
    status: 'available',
    description: 'Уютная двухкомнатная квартира',
    images: ['https://example.com/house1.jpg'],
  }

  const createResponse = await makeRequest('POST', '/api/houses', newHouse, authToken)
  
  if (createResponse.status === 201 && createResponse.data.id) {
    createdHouseId = createResponse.data.id
    logSuccess(`Дом создан с ID: ${createdHouseId}`)
  } else {
    logError(`Ошибка создания дома: ${JSON.stringify(createResponse.data)}`)
    return false
  }

  // Получение всех домов
  logInfo('Получение всех домов...')
  const getAllResponse = await makeRequest('GET', '/api/houses', null, authToken)
  
  if (getAllResponse.status === 200 && Array.isArray(getAllResponse.data)) {
    logSuccess(`Получено домов: ${getAllResponse.data.length}`)
  } else {
    logError(`Ошибка получения домов: ${JSON.stringify(getAllResponse.data)}`)
  }

  // Получение дома по ID
  logInfo(`Получение дома по ID: ${createdHouseId}...`)
  const getByIdResponse = await makeRequest('GET', `/api/houses/${createdHouseId}`, null, authToken)
  
  if (getByIdResponse.status === 200 && getByIdResponse.data.id === createdHouseId) {
    logSuccess('Дом получен по ID')
  } else {
    logError(`Ошибка получения дома: ${JSON.stringify(getByIdResponse.data)}`)
  }

  // Обновление дома
  logInfo('Обновление дома...')
  const updateData = {
    status: 'reserved',
    price: 6800000,
  }
  const updateResponse = await makeRequest('PUT', `/api/houses/${createdHouseId}`, updateData, authToken)
  
  if (updateResponse.status === 200 && updateResponse.data.status === updateData.status) {
    logSuccess('Дом обновлен')
  } else {
    logError(`Ошибка обновления дома: ${JSON.stringify(updateResponse.data)}`)
  }

  return true
}

async function testClients() {
  logTest('Клиенты (CRUD)')
  
  // Создание клиента
  logInfo('Создание клиента...')
  const newClient = {
    name: 'Иван Иванов',
    phone: '+7 (999) 123-45-67',
    email: 'ivan@example.com',
    notes: 'Интересуется двухкомнатными квартирами',
  }

  const createResponse = await makeRequest('POST', '/api/clients', newClient, authToken)
  
  if (createResponse.status === 201 && createResponse.data.id) {
    createdClientId = createResponse.data.id
    logSuccess(`Клиент создан с ID: ${createdClientId}`)
  } else {
    logError(`Ошибка создания клиента: ${JSON.stringify(createResponse.data)}`)
    return false
  }

  // Получение всех клиентов
  logInfo('Получение всех клиентов...')
  const getAllResponse = await makeRequest('GET', '/api/clients', null, authToken)
  
  if (getAllResponse.status === 200 && Array.isArray(getAllResponse.data)) {
    logSuccess(`Получено клиентов: ${getAllResponse.data.length}`)
  } else {
    logError(`Ошибка получения клиентов: ${JSON.stringify(getAllResponse.data)}`)
  }

  // Получение клиента по ID
  logInfo(`Получение клиента по ID: ${createdClientId}...`)
  const getByIdResponse = await makeRequest('GET', `/api/clients/${createdClientId}`, null, authToken)
  
  if (getByIdResponse.status === 200 && getByIdResponse.data.id === createdClientId) {
    logSuccess('Клиент получен по ID')
  } else {
    logError(`Ошибка получения клиента: ${JSON.stringify(getByIdResponse.data)}`)
  }

  // Обновление клиента
  logInfo('Обновление клиента...')
  const updateData = {
    email: 'ivan.new@example.com',
    notes: 'Обновленные заметки',
  }
  const updateResponse = await makeRequest('PUT', `/api/clients/${createdClientId}`, updateData, authToken)
  
  if (updateResponse.status === 200 && updateResponse.data.email === updateData.email) {
    logSuccess('Клиент обновлен')
  } else {
    logError(`Ошибка обновления клиента: ${JSON.stringify(updateResponse.data)}`)
  }

  return true
}

async function testApplications() {
  logTest('Заявки (CRUD)')
  
  if (!createdClientId) {
    logError('Необходимо сначала создать клиента')
    return false
  }

  // Создание заявки
  logInfo('Создание заявки...')
  const newApplication = {
    client_id: createdClientId,
    house_id: createdHouseId || null,
    project_id: createdProjectId || null,
    status: 'new',
    source: 'website',
    notes: 'Тестовая заявка',
  }

  const createResponse = await makeRequest('POST', '/api/applications', newApplication, authToken)
  
  if (createResponse.status === 201 && createResponse.data.id) {
    createdApplicationId = createResponse.data.id
    logSuccess(`Заявка создана с ID: ${createdApplicationId}`)
  } else {
    logError(`Ошибка создания заявки: ${JSON.stringify(createResponse.data)}`)
    return false
  }

  // Получение всех заявок
  logInfo('Получение всех заявок...')
  const getAllResponse = await makeRequest('GET', '/api/applications', null, authToken)
  
  if (getAllResponse.status === 200 && Array.isArray(getAllResponse.data)) {
    logSuccess(`Получено заявок: ${getAllResponse.data.length}`)
  } else {
    logError(`Ошибка получения заявок: ${JSON.stringify(getAllResponse.data)}`)
  }

  // Получение заявки по ID
  logInfo(`Получение заявки по ID: ${createdApplicationId}...`)
  const getByIdResponse = await makeRequest('GET', `/api/applications/${createdApplicationId}`, null, authToken)
  
  if (getByIdResponse.status === 200 && getByIdResponse.data.id === createdApplicationId) {
    logSuccess('Заявка получена по ID')
  } else {
    logError(`Ошибка получения заявки: ${JSON.stringify(getByIdResponse.data)}`)
  }

  // Обновление заявки
  logInfo('Обновление заявки...')
  const updateData = {
    status: 'in_progress',
    notes: 'Заявка в работе',
  }
  const updateResponse = await makeRequest('PUT', `/api/applications/${createdApplicationId}`, updateData, authToken)
  
  if (updateResponse.status === 200 && updateResponse.data.status === updateData.status) {
    logSuccess('Заявка обновлена')
  } else {
    logError(`Ошибка обновления заявки: ${JSON.stringify(updateResponse.data)}`)
  }

  return true
}

async function testUsers() {
  logTest('Пользователи (CRUD)')
  
  // Получение всех пользователей
  logInfo('Получение всех пользователей...')
  const getAllResponse = await makeRequest('GET', '/api/users', null, authToken)
  
  if (getAllResponse.status === 200 && Array.isArray(getAllResponse.data)) {
    logSuccess(`Получено пользователей: ${getAllResponse.data.length}`)
  } else {
    logError(`Ошибка получения пользователей: ${JSON.stringify(getAllResponse.data)}`)
    return false
  }

  // Создание нового менеджера
  logInfo('Создание нового менеджера...')
  const newUser = {
    username: `test_manager_${Date.now()}`,
    role: 'manager',
  }

  const createResponse = await makeRequest('POST', '/api/users', newUser, authToken)
  
  if (createResponse.status === 201 && createResponse.data.user) {
    const newUserId = createResponse.data.user.id
    logSuccess(`Менеджер создан с ID: ${newUserId}, пароль: ${createResponse.data.password}`)
    
    // Удаление тестового пользователя
    logInfo('Удаление тестового пользователя...')
    const deleteResponse = await makeRequest('DELETE', `/api/users/${newUserId}`, null, authToken)
    
    if (deleteResponse.status === 200) {
      logSuccess('Тестовый пользователь удален')
    } else {
      logError(`Ошибка удаления пользователя: ${JSON.stringify(deleteResponse.data)}`)
    }
  } else {
    logError(`Ошибка создания пользователя: ${JSON.stringify(createResponse.data)}`)
  }

  return true
}

async function testPublicAPI() {
  logTest('Публичные API (v1)')
  
  // Получение всех проектов (публичный)
  logInfo('Получение всех проектов (публичный API)...')
  const projectsResponse = await makeRequest('GET', '/api/v1/projects')
  
  if (projectsResponse.status === 200 && Array.isArray(projectsResponse.data)) {
    logSuccess(`Получено проектов: ${projectsResponse.data.length}`)
  } else {
    logError(`Ошибка получения проектов: ${JSON.stringify(projectsResponse.data)}`)
  }

  // Получение проекта по ID (публичный)
  if (createdProjectId) {
    logInfo(`Получение проекта по ID (публичный API): ${createdProjectId}...`)
    const projectResponse = await makeRequest('GET', `/api/v1/projects/${createdProjectId}`)
    
    if (projectResponse.status === 200 && projectResponse.data.id === createdProjectId) {
      logSuccess('Проект получен (публичный API)')
    } else {
      logError(`Ошибка получения проекта: ${JSON.stringify(projectResponse.data)}`)
    }
  }

  // Получение всех домов (публичный)
  logInfo('Получение всех домов (публичный API)...')
  const housesResponse = await makeRequest('GET', '/api/v1/houses')
  
  if (housesResponse.status === 200 && Array.isArray(housesResponse.data)) {
    logSuccess(`Получено домов: ${housesResponse.data.length}`)
  } else {
    logError(`Ошибка получения домов: ${JSON.stringify(housesResponse.data)}`)
  }

  // Получение дома по ID (публичный)
  if (createdHouseId) {
    logInfo(`Получение дома по ID (публичный API): ${createdHouseId}...`)
    const houseResponse = await makeRequest('GET', `/api/v1/houses/${createdHouseId}`)
    
    if (houseResponse.status === 200 && houseResponse.data.id === createdHouseId) {
      logSuccess('Дом получен (публичный API)')
    } else {
      logError(`Ошибка получения дома: ${JSON.stringify(houseResponse.data)}`)
    }
  }

  // Создание заявки на звонок (публичный)
  logInfo('Создание заявки на звонок (публичный API)...')
  const callbackData = {
    name: 'Петр Петров',
    phone: '+7 (999) 987-65-43',
    reason: 'Интересует квартира',
    project_id: createdProjectId || null,
    house_id: createdHouseId || null,
    notes: 'Тестовая заявка на звонок',
  }

  const callbackResponse = await makeRequest('POST', '/api/v1/callbacks', callbackData)
  
  if (callbackResponse.status === 201 && callbackResponse.data.success) {
    logSuccess('Заявка на звонок создана (публичный API)')
  } else {
    logError(`Ошибка создания заявки на звонок: ${JSON.stringify(callbackResponse.data)}`)
  }

  return true
}

async function cleanup() {
  logTest('Очистка тестовых данных')
  
  if (createdApplicationId) {
    logInfo(`Удаление заявки: ${createdApplicationId}...`)
    await makeRequest('DELETE', `/api/applications/${createdApplicationId}`, null, authToken)
  }

  if (createdHouseId) {
    logInfo(`Удаление дома: ${createdHouseId}...`)
    await makeRequest('DELETE', `/api/houses/${createdHouseId}`, null, authToken)
  }

  if (createdClientId) {
    logInfo(`Удаление клиента: ${createdClientId}...`)
    await makeRequest('DELETE', `/api/clients/${createdClientId}`, null, authToken)
  }

  if (createdProjectId) {
    logInfo(`Удаление проекта: ${createdProjectId}...`)
    await makeRequest('DELETE', `/api/projects/${createdProjectId}`, null, authToken)
  }

  logSuccess('Очистка завершена')
}

async function runTests() {
  log('\n' + '='.repeat(60), 'blue')
  log('🚀 ЗАПУСК ТЕСТОВ API', 'blue')
  log('='.repeat(60) + '\n', 'blue')

  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'Авторизация', fn: testAuth },
    { name: 'Проекты', fn: testProjects },
    { name: 'Дома', fn: testHouses },
    { name: 'Клиенты', fn: testClients },
    { name: 'Заявки', fn: testApplications },
    { name: 'Пользователи', fn: testUsers },
    { name: 'Публичные API', fn: testPublicAPI },
  ]

  const results = []

  for (const test of tests) {
    try {
      const result = await test.fn()
      results.push({ name: test.name, success: result })
    } catch (error) {
      logError(`Ошибка при выполнении теста "${test.name}": ${error.message}`)
      results.push({ name: test.name, success: false, error: error.message })
    }
  }

  // Очистка
  await cleanup()

  // Итоги
  log('\n' + '='.repeat(60), 'blue')
  log('📊 РЕЗУЛЬТАТЫ ТЕСТОВ', 'blue')
  log('='.repeat(60), 'blue')

  const passed = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length

  results.forEach(result => {
    if (result.success) {
      logSuccess(`${result.name}: ПРОЙДЕН`)
    } else {
      logError(`${result.name}: ПРОВАЛЕН${result.error ? ` (${result.error})` : ''}`)
    }
  })

  log('\n' + '='.repeat(60), 'blue')
  log(`✅ Пройдено: ${passed}`, 'green')
  log(`❌ Провалено: ${failed}`, failed > 0 ? 'red' : 'green')
  log('='.repeat(60) + '\n', 'blue')

  process.exit(failed > 0 ? 1 : 0)
}

// Запуск тестов
runTests().catch(error => {
  logError(`Критическая ошибка: ${error.message}`)
  process.exit(1)
})

