import express from 'express'
import pool from '../db/index.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// Получить все дома (требует авторизации)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { project_id, status, search } = req.query
    let query = `
      SELECT h.*, p.name as project_name 
      FROM houses h
      LEFT JOIN projects p ON h.project_id = p.id
      WHERE 1=1
    `
    const params = []
    let paramCount = 0

    if (project_id) {
      paramCount++
      query += ` AND h.project_id = $${paramCount}`
      params.push(project_id)
    }

    if (status) {
      paramCount++
      query += ` AND h.status = $${paramCount}`
      params.push(status)
    }

    if (search) {
      paramCount++
      query += ` AND (h.number ILIKE $${paramCount} OR h.description ILIKE $${paramCount})`
      params.push(`%${search}%`)
    }

    query += ' ORDER BY h.created_at DESC'

    const result = await pool.query(query, params)
    
    // Парсим JSON строки в объекты/массивы
    const houses = result.rows.map(house => {
      if (house.images && typeof house.images === 'string') {
        try {
          house.images = JSON.parse(house.images)
        } catch (e) {
          house.images = []
        }
      }
      return house
    })

    res.json(houses)
  } catch (error) {
    console.error('Ошибка при получении домов:', error)
    res.status(500).json({ error: 'Внутренняя ошибка сервера' })
  }
})

// Получить дом по ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query(
      `SELECT h.*, p.name as project_name 
       FROM houses h
       LEFT JOIN projects p ON h.project_id = p.id
       WHERE h.id = $1`,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Дом не найден' })
    }

    let house = result.rows[0]
    if (house.images && typeof house.images === 'string') {
      try {
        house.images = JSON.parse(house.images)
      } catch (e) {
        house.images = []
      }
    }

    res.json(house)
  } catch (error) {
    console.error('Ошибка при получении дома:', error)
    res.status(500).json({ error: 'Внутренняя ошибка сервера' })
  }
})

// Создать дом
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      project_id,
      number,
      floor,
      area,
      rooms,
      price,
      status = 'available',
      description,
      images,
    } = req.body

    if (!number) {
      return res.status(400).json({ error: 'Номер дома обязателен' })
    }

    const result = await pool.query(
      `INSERT INTO houses (project_id, number, floor, area, rooms, price, status, description, images)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        project_id || null,
        number,
        floor || null,
        area || null,
        rooms || null,
        price || null,
        status,
        description || null,
        JSON.stringify(images || []),
      ]
    )

    let house = result.rows[0]
    if (house.images && typeof house.images === 'string') {
      try {
        house.images = JSON.parse(house.images)
      } catch (e) {
        house.images = []
      }
    }

    res.status(201).json(house)
  } catch (error) {
    console.error('Ошибка при создании дома:', error)
    res.status(500).json({ error: 'Внутренняя ошибка сервера' })
  }
})

// Обновить дом
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const {
      project_id,
      number,
      floor,
      area,
      rooms,
      price,
      status,
      description,
      images,
    } = req.body

    const existingHouse = await pool.query('SELECT id FROM houses WHERE id = $1', [id])
    if (existingHouse.rows.length === 0) {
      return res.status(404).json({ error: 'Дом не найден' })
    }

    const updates = []
    const values = []
    let paramCount = 0

    if (project_id !== undefined) {
      paramCount++
      updates.push(`project_id = $${paramCount}`)
      values.push(project_id)
    }
    if (number !== undefined) {
      paramCount++
      updates.push(`number = $${paramCount}`)
      values.push(number)
    }
    if (floor !== undefined) {
      paramCount++
      updates.push(`floor = $${paramCount}`)
      values.push(floor)
    }
    if (area !== undefined) {
      paramCount++
      updates.push(`area = $${paramCount}`)
      values.push(area)
    }
    if (rooms !== undefined) {
      paramCount++
      updates.push(`rooms = $${paramCount}`)
      values.push(rooms)
    }
    if (price !== undefined) {
      paramCount++
      updates.push(`price = $${paramCount}`)
      values.push(price)
    }
    if (status !== undefined) {
      paramCount++
      updates.push(`status = $${paramCount}`)
      values.push(status)
    }
    if (description !== undefined) {
      paramCount++
      updates.push(`description = $${paramCount}`)
      values.push(description)
    }
    if (images !== undefined) {
      paramCount++
      updates.push(`images = $${paramCount}`)
      values.push(JSON.stringify(images || []))
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Нет данных для обновления' })
    }

    paramCount++
    values.push(id)
    updates.push('updated_at = CURRENT_TIMESTAMP')

    const result = await pool.query(
      `UPDATE houses SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    )

    let house = result.rows[0]
    if (house.images && typeof house.images === 'string') {
      try {
        house.images = JSON.parse(house.images)
      } catch (e) {
        house.images = []
      }
    }

    res.json(house)
  } catch (error) {
    console.error('Ошибка при обновлении дома:', error)
    res.status(500).json({ error: 'Внутренняя ошибка сервера' })
  }
})

// Удалить дом
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query('DELETE FROM houses WHERE id = $1 RETURNING id', [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Дом не найден' })
    }

    res.json({ message: 'Дом успешно удален' })
  } catch (error) {
    console.error('Ошибка при удалении дома:', error)
    res.status(500).json({ error: 'Внутренняя ошибка сервера' })
  }
})

export default router


