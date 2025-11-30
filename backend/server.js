import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import projectsRoutes from './routes/projects.js'
import usersRoutes from './routes/users.js'
import clientsRoutes from './routes/clients.js'
import housesRoutes from './routes/houses.js'
import applicationsRoutes from './routes/applications.js'
// Публичные API для клиентских фронтендов
import v1ProjectsRoutes from './routes/v1/projects.js'
import v1HousesRoutes from './routes/v1/houses.js'
import v1CallbacksRoutes from './routes/v1/callbacks.js'

dotenv.config()

// Настройка вывода без буферизации для Docker
process.stdout.setEncoding('utf8')
process.stderr.setEncoding('utf8')

const app = express()
const PORT = process.env.PORT || 3000

// Логирование всех запросов
app.use((req, res, next) => {
  const timestamp = new Date().toISOString()
  const logMsg = `[${timestamp}] ${req.method} ${req.path}\n`
  process.stdout.write(logMsg)
  if (process.stdout.isTTY === false) {
    process.stdout.flush && process.stdout.flush()
  }
  next()
})

// Middleware
app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/projects', projectsRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/clients', clientsRoutes)
app.use('/api/houses', housesRoutes)
app.use('/api/applications', applicationsRoutes)

// Публичные API для клиентских фронтендов (v1)
app.use('/api/v1/projects', v1ProjectsRoutes)  // Новостройки
app.use('/api/v1/houses', v1HousesRoutes)       // Дома
app.use('/api/v1/callbacks', v1CallbacksRoutes)  // Заявки на звонок

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' })
})

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Что-то пошло не так!' })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`)
})

