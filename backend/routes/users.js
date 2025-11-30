import express from 'express'
import bcrypt from 'bcryptjs'
import pool from '../db/index.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// Проверка прав super_manager
const requireSuperManager = (req, res, next) => {
  if (req.user.role !== 'super_manager') {
    return res.status(403).json({ error: 'Доступ запрещен. Требуется роль super_manager' })
  }
  next()
}

// Генерация случайного пароля
const generatePassword = (length = 12) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return password
}

// Получить всех пользователей (только для super_manager)
router.get('/', authenticateToken, requireSuperManager, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, role, created_at, updated_at FROM users ORDER BY created_at DESC'
    )
    res.json(result.rows)
  } catch (error) {
    console.error('Ошибка при получении пользователей:', error)
    res.status(500).json({ error: 'Внутренняя ошибка сервера' })
  }
})

// Получить пользователя по ID
router.get('/:id', authenticateToken, requireSuperManager, async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query(
      'SELECT id, username, role, created_at, updated_at FROM users WHERE id = $1',
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Ошибка при получении пользователя:', error)
    res.status(500).json({ error: 'Внутренняя ошибка сервера' })
  }
})

// Создать нового менеджера (только для super_manager)
router.post('/', authenticateToken, requireSuperManager, async (req, res) => {
  try {
    const { username, role = 'manager' } = req.body

    if (!username) {
      return res.status(400).json({ error: 'Имя пользователя обязательно' })
    }

    if (role !== 'manager' && role !== 'super_manager') {
      return res.status(400).json({ error: 'Недопустимая роль' })
    }

    // Проверка существования пользователя
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    )

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Пользователь с таким именем уже существует' })
    }

    // Генерация пароля
    const password = generatePassword()
    const passwordHash = await bcrypt.hash(password, 10)

    // Создание пользователя
    const result = await pool.query(
      'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING id, username, role, created_at',
      [username, passwordHash, role]
    )

    const newUser = result.rows[0]

    res.status(201).json({
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
        created_at: newUser.created_at,
      },
      password: password, // Возвращаем пароль только при создании
    })
  } catch (error) {
    console.error('Ошибка при создании пользователя:', error)
    res.status(500).json({ error: 'Внутренняя ошибка сервера' })
  }
})

// Обновить пользователя (только для super_manager)
router.put('/:id', authenticateToken, requireSuperManager, async (req, res) => {
  try {
    const { id } = req.params
    const { username, role } = req.body

    // Проверка существования пользователя
    const existingUser = await pool.query('SELECT id FROM users WHERE id = $1', [id])
    if (existingUser.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' })
    }

    const updates = []
    const values = []
    let paramCount = 0

    if (username) {
      paramCount++
      updates.push(`username = $${paramCount}`)
      values.push(username)
    }

    if (role) {
      if (role !== 'manager' && role !== 'super_manager') {
        return res.status(400).json({ error: 'Недопустимая роль' })
      }
      paramCount++
      updates.push(`role = $${paramCount}`)
      values.push(role)
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Нет данных для обновления' })
    }

    paramCount++
    values.push(id)
    updates.push(`updated_at = CURRENT_TIMESTAMP`)

    const result = await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING id, username, role, created_at, updated_at`,
      values
    )

    res.json(result.rows[0])
  } catch (error) {
    console.error('Ошибка при обновлении пользователя:', error)
    res.status(500).json({ error: 'Внутренняя ошибка сервера' })
  }
})

// Удалить пользователя (только для super_manager)
router.delete('/:id', authenticateToken, requireSuperManager, async (req, res) => {
  try {
    const { id } = req.params

    // Нельзя удалить самого себя
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Нельзя удалить самого себя' })
    }

    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' })
    }

    res.json({ message: 'Пользователь успешно удален' })
  } catch (error) {
    console.error('Ошибка при удалении пользователя:', error)
    res.status(500).json({ error: 'Внутренняя ошибка сервера' })
  }
})

// Сброс пароля пользователя (только для super_manager)
router.post('/:id/reset-password', authenticateToken, requireSuperManager, async (req, res) => {
  try {
    const { id } = req.params

    const existingUser = await pool.query('SELECT id FROM users WHERE id = $1', [id])
    if (existingUser.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' })
    }

    // Генерация нового пароля
    const password = generatePassword()
    const passwordHash = await bcrypt.hash(password, 10)

    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [passwordHash, id]
    )

    res.json({
      message: 'Пароль успешно сброшен',
      password: password, // Возвращаем новый пароль
    })
  } catch (error) {
    console.error('Ошибка при сбросе пароля:', error)
    res.status(500).json({ error: 'Внутренняя ошибка сервера' })
  }
})

export default router


