import express from 'express'
import pool from '../db/index.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// Получить всех клиентов (требует авторизации)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search } = req.query
    let query = 'SELECT * FROM clients WHERE 1=1'
    const params = []
    let paramCount = 0

    if (search) {
      paramCount++
      query += ` AND (name ILIKE $${paramCount} OR phone ILIKE $${paramCount} OR email ILIKE $${paramCount})`
      params.push(`%${search}%`)
    }

    query += ' ORDER BY created_at DESC'

    const result = await pool.query(query, params)
    res.json(result.rows)
  } catch (error) {
    console.error('Ошибка при получении клиентов:', error)
    res.status(500).json({ error: 'Внутренняя ошибка сервера' })
  }
})

// Получить клиента по ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query('SELECT * FROM clients WHERE id = $1', [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Клиент не найден' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Ошибка при получении клиента:', error)
    res.status(500).json({ error: 'Внутренняя ошибка сервера' })
  }
})

// Создать клиента
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, phone, email, notes } = req.body

    if (!name) {
      return res.status(400).json({ error: 'Имя клиента обязательно' })
    }

    const result = await pool.query(
      `INSERT INTO clients (name, phone, email, notes)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, phone || null, email || null, notes || null]
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Ошибка при создании клиента:', error)
    res.status(500).json({ error: 'Внутренняя ошибка сервера' })
  }
})

// Обновить клиента
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { name, phone, email, notes } = req.body

    const existingClient = await pool.query('SELECT id FROM clients WHERE id = $1', [id])
    if (existingClient.rows.length === 0) {
      return res.status(404).json({ error: 'Клиент не найден' })
    }

    const result = await pool.query(
      `UPDATE clients 
       SET name = COALESCE($1, name),
           phone = COALESCE($2, phone),
           email = COALESCE($3, email),
           notes = COALESCE($4, notes),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [name, phone, email, notes, id]
    )

    res.json(result.rows[0])
  } catch (error) {
    console.error('Ошибка при обновлении клиента:', error)
    res.status(500).json({ error: 'Внутренняя ошибка сервера' })
  }
})

// Удалить клиента
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query('DELETE FROM clients WHERE id = $1 RETURNING id', [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Клиент не найден' })
    }

    res.json({ message: 'Клиент успешно удален' })
  } catch (error) {
    console.error('Ошибка при удалении клиента:', error)
    res.status(500).json({ error: 'Внутренняя ошибка сервера' })
  }
})

export default router


