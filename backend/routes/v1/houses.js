import express from 'express'
import pool from '../../db/index.js'

const router = express.Router()

// Получить все дома (публичный доступ для клиентского фронтенда)
router.get('/', async (req, res) => {
  try {
    const { project_id, status, search, floor, rooms, areaMin, areaMax, priceMin, priceMax } = req.query
    let query = `
      SELECT h.*, p.name as project_name, p.district as project_district
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

    if (floor) {
      paramCount++
      query += ` AND h.floor = $${paramCount}`
      params.push(floor)
    }

    if (rooms) {
      paramCount++
      query += ` AND h.rooms = $${paramCount}`
      params.push(rooms)
    }

    if (search) {
      paramCount++
      query += ` AND (h.number ILIKE $${paramCount} OR h.description ILIKE $${paramCount} OR p.name ILIKE $${paramCount})`
      params.push(`%${search}%`)
    }

    query += ' ORDER BY h.created_at DESC'

    const result = await pool.query(query, params)
    
    // Фильтрация на стороне сервера для сложных фильтров
    let houses = result.rows

    // Фильтр по площади
    if (areaMin || areaMax) {
      houses = houses.filter(house => {
        if (!house.area) return false
        const area = parseFloat(house.area)
        if (isNaN(area)) return false
        if (areaMin && area < parseFloat(areaMin)) return false
        if (areaMax && area > parseFloat(areaMax)) return false
        return true
      })
    }

    // Фильтр по цене
    if (priceMin || priceMax) {
      houses = houses.filter(house => {
        if (!house.price) return false
        const price = parseFloat(house.price)
        if (isNaN(price)) return false
        if (priceMin && price < parseFloat(priceMin)) return false
        if (priceMax && price > parseFloat(priceMax)) return false
        return true
      })
    }

    // Парсим JSON строки в объекты/массивы
    houses = houses.map(house => {
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

// Получить дом по ID (публичный доступ)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query(
      `SELECT h.*, p.name as project_name, p.district as project_district
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

export default router

