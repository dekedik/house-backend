import express from 'express'
import pool from '../../db/index.js'

const router = express.Router()

// Получить все проекты (публичный доступ для клиентского фронтенда)
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

    // Фильтр по площади
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

    // Парсим JSON строки в объекты/массивы
    projects = projects.map(project => {
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

    // Парсим JSON строки в объекты/массивы
    let project = result.rows[0]
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

    res.json(project)
  } catch (error) {
    console.error('Ошибка при получении проекта:', error)
    res.status(500).json({ error: 'Внутренняя ошибка сервера' })
  }
})

export default router

