import express from 'express'
import pool from '../db/index.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// Получить все проекты (публичный доступ)
router.get('/', async (req, res) => {
  try {
    const { district, status, type, housingClass, housingType, areaMin, areaMax, priceMin, priceMax } = req.query

    let query = 'SELECT * FROM projects WHERE 1=1'
    const params = []
    let paramCount = 0

    if (district) {
      paramCount++
      query += ` AND district = $${paramCount}`
      params.push(district)
    }

    if (status) {
      paramCount++
      query += ` AND status = $${paramCount}`
      params.push(status)
    }

    if (type) {
      paramCount++
      query += ` AND type = $${paramCount}`
      params.push(type)
    }

    query += ' ORDER BY created_at DESC'

    const result = await pool.query(query, params)
    
    // Фильтрация на стороне сервера для сложных фильтров
    let projects = result.rows

    // Фильтр по площади (если указан в features или area)
    if (areaMin || areaMax) {
      projects = projects.filter(project => {
        const areaMatch = project.area?.match(/(\d+)/)
        if (!areaMatch) return false
        const area = parseInt(areaMatch[1])
        if (areaMin && area < parseInt(areaMin)) return false
        if (areaMax && area > parseInt(areaMax)) return false
        return true
      })
    }

    // Фильтр по цене
    if (priceMin || priceMax) {
      projects = projects.filter(project => {
        const priceMatch = project.price_from?.match(/[\d\s]+/)?.[0]?.replace(/\s/g, '')
        if (!priceMatch) return false
        const price = parseInt(priceMatch)
        if (priceMin && price < parseInt(priceMin)) return false
        if (priceMax && price > parseInt(priceMax)) return false
        return true
      })
    }

    res.json(projects)
  } catch (error) {
    console.error('Ошибка при получении проектов:', error)
    res.status(500).json({ error: 'Внутренняя ошибка сервера' })
  }
})

// Получить проект по ID (публичный доступ)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query('SELECT * FROM projects WHERE id = $1', [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Проект не найден' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Ошибка при получении проекта:', error)
    res.status(500).json({ error: 'Внутренняя ошибка сервера' })
  }
})

// Создать проект (требует авторизации)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      district,
      type,
      description,
      fullDescription,
      price,
      priceFrom,
      completion,
      rooms,
      parking,
      status,
      discount,
      image,
      images,
      developer,
      floors,
      apartments,
      area,
      features,
    } = req.body

    const result = await pool.query(
      `INSERT INTO projects (
        name, district, type, description, full_description, price, price_from,
        completion, rooms, parking, status, discount, image, images,
        developer, floors, apartments, area, features
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *`,
      [
        name,
        district,
        type,
        description,
        fullDescription,
        price,
        priceFrom,
        completion,
        rooms,
        parking,
        status,
        discount || null,
        image,
        JSON.stringify(images || []),
        developer,
        floors,
        apartments,
        area,
        JSON.stringify(features || []),
      ]
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Ошибка при создании проекта:', error)
    res.status(500).json({ error: 'Внутренняя ошибка сервера' })
  }
})

// Обновить проект (требует авторизации)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const {
      name,
      district,
      type,
      description,
      fullDescription,
      price,
      priceFrom,
      completion,
      rooms,
      parking,
      status,
      discount,
      image,
      images,
      developer,
      floors,
      apartments,
      area,
      features,
    } = req.body

    const result = await pool.query(
      `UPDATE projects SET
        name = $1, district = $2, type = $3, description = $4, full_description = $5,
        price = $6, price_from = $7, completion = $8, rooms = $9, parking = $10,
        status = $11, discount = $12, image = $13, images = $14,
        developer = $15, floors = $16, apartments = $17, area = $18, features = $19,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $20
      RETURNING *`,
      [
        name,
        district,
        type,
        description,
        fullDescription,
        price,
        priceFrom,
        completion,
        rooms,
        parking,
        status,
        discount || null,
        image,
        JSON.stringify(images || []),
        developer,
        floors,
        apartments,
        area,
        JSON.stringify(features || []),
        id,
      ]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Проект не найден' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Ошибка при обновлении проекта:', error)
    res.status(500).json({ error: 'Внутренняя ошибка сервера' })
  }
})

// Удалить проект (требует авторизации)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query('DELETE FROM projects WHERE id = $1 RETURNING id', [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Проект не найден' })
    }

    res.json({ message: 'Проект успешно удален' })
  } catch (error) {
    console.error('Ошибка при удалении проекта:', error)
    res.status(500).json({ error: 'Внутренняя ошибка сервера' })
  }
})

export default router

