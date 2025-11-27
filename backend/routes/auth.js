import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../db/index.js'

const router = express.Router()

// Вход в систему
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: 'Логин и пароль обязательны' })
    }

    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Неверный логин или пароль' })
    }

    const user = result.rows[0]
    const isValidPassword = await bcrypt.compare(password, user.password_hash)

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Неверный логин или пароль' })
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
      },
    })
  } catch (error) {
    console.error('Ошибка при входе:', error)
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

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'Недействительный токен' })
      }
      res.json({ valid: true, user: decoded })
    })
  } catch (error) {
    console.error('Ошибка при проверке токена:', error)
    res.status(500).json({ error: 'Внутренняя ошибка сервера' })
  }
})

export default router

