import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../db/index.js'

const router = express.Router()

// Функция логирования
const log = (msg) => {
  const timestamp = new Date().toISOString()
  const logMsg = `[${timestamp}] ${msg}\n`
  process.stdout.write(logMsg)
  if (process.stdout.isTTY === false) {
    process.stdout.flush && process.stdout.flush()
  }
}

// Вход в систему
router.post('/login', async (req, res) => {
  try {
    log('=== LOGIN REQUEST ===')
    log(`Body: ${JSON.stringify(req.body)}`)
    
    const { username, password } = req.body

    if (!username || !password) {
      log('ERROR: Missing username or password')
      return res.status(400).json({ error: 'Логин и пароль обязательны' })
    }

    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    )

    if (result.rows.length === 0) {
      log(`ERROR: User not found: ${username}`)
      return res.status(401).json({ error: 'Неверный логин или пароль' })
    }

    const user = result.rows[0]
    
    // Логирование для отладки
    log(`Username: ${username}`)
    log(`Password received: ${password}`)
    log(`Password length: ${password.length}`)
    log(`Hash in DB: ${user.password_hash.substring(0, 30)}...`)
    
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    
    log(`Password match: ${isValidPassword}`)
    
    if (!isValidPassword) {
      log('ERROR: Invalid password')
      return res.status(401).json({ error: 'Неверный логин или пароль' })
    }
    
    log(`Login successful for user: ${username}`)

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )

    log('Token generated successfully')
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    })
  } catch (error) {
    log(`ERROR in login: ${error.message}`)
    log(`Stack: ${error.stack}`)
    res.status(500).json({ error: 'Внутренняя ошибка сервера' })
  }
})

// Проверка токена
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({ error: 'Токен отсутствует' })
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'Недействительный токен' })
      }
      
      // Получаем актуальные данные пользователя из БД
      try {
        const userResult = await pool.query(
          'SELECT id, username, role FROM users WHERE id = $1',
          [decoded.id]
        )
        
        if (userResult.rows.length === 0) {
          return res.status(404).json({ error: 'Пользователь не найден' })
        }
        
        res.json({ valid: true, user: userResult.rows[0] })
      } catch (dbError) {
        log(`ERROR getting user: ${dbError.message}`)
        res.json({ valid: true, user: decoded })
      }
    })
  } catch (error) {
    log(`ERROR in verify: ${error.message}`)
    res.status(500).json({ error: 'Внутренняя ошибка сервера' })
  }
})

export default router
