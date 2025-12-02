import express from 'express'
import pool from '../db/index.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// Получить все заявки (требует авторизации)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, client_id, house_id, project_id, manager_id } = req.query
    let query = `
      SELECT 
        a.*,
        c.id as client_id_full,
        c.name as client_name,
        c.phone as client_phone,
        c.email as client_email,
        c.notes as client_notes,
        c.created_at as client_created_at,
        c.updated_at as client_updated_at,
        h.id as house_id_full,
        h.project_id as house_project_id,
        h.number as house_number,
        h.floor as house_floor,
        h.area as house_area,
        h.rooms as house_rooms,
        h.price as house_price,
        h.status as house_status,
        h.description as house_description,
        h.images as house_images,
        h.created_at as house_created_at,
        h.updated_at as house_updated_at,
        p.id as project_id_full,
        p.name as project_name,
        p.district as project_district,
        p.type as project_type,
        p.description as project_description,
        p.full_description as project_full_description,
        p.price as project_price,
        p.price_from as project_price_from,
        p.completion as project_completion,
        p.rooms as project_rooms,
        p.parking as project_parking,
        p.status as project_status,
        p.discount as project_discount,
        p.image as project_image,
        p.images as project_images,
        p.developer as project_developer,
        p.floors as project_floors,
        p.apartments as project_apartments,
        p.area as project_area,
        p.features as project_features,
        p.created_at as project_created_at,
        p.updated_at as project_updated_at,
        u.id as manager_id_full,
        u.username as manager_username
      FROM applications a
      LEFT JOIN clients c ON a.client_id = c.id
      LEFT JOIN houses h ON a.house_id = h.id
      LEFT JOIN projects p ON a.project_id = p.id
      LEFT JOIN users u ON a.manager_id = u.id
      WHERE 1=1
    `
    const params = []
    let paramCount = 0

    if (status) {
      paramCount++
      query += ` AND a.status = $${paramCount}`
      params.push(status)
    }

    if (client_id) {
      paramCount++
      query += ` AND a.client_id = $${paramCount}`
      params.push(client_id)
    }

    if (house_id) {
      paramCount++
      query += ` AND a.house_id = $${paramCount}`
      params.push(house_id)
    }

    if (project_id) {
      paramCount++
      query += ` AND a.project_id = $${paramCount}`
      params.push(project_id)
    }

    if (manager_id) {
      paramCount++
      query += ` AND a.manager_id = $${paramCount}`
      params.push(manager_id)
    }

    query += ' ORDER BY a.created_at DESC'

    const result = await pool.query(query, params)
    
    // Формируем объекты с полными данными
    const applications = result.rows.map(row => {
      const application = {
        id: row.id,
        client_id: row.client_id,
        house_id: row.house_id,
        project_id: row.project_id,
        manager_id: row.manager_id,
        status: row.status,
        source: row.source,
        notes: row.notes,
        created_at: row.created_at,
        updated_at: row.updated_at,
      }

      // Полный объект клиента
      if (row.client_id_full) {
        application.client = {
          id: row.client_id_full,
          name: row.client_name,
          phone: row.client_phone,
          email: row.client_email,
          notes: row.client_notes,
          created_at: row.client_created_at,
          updated_at: row.client_updated_at,
        }
      }

      // Полный объект дома
      if (row.house_id_full) {
        let houseImages = row.house_images
        if (typeof houseImages === 'string') {
          try {
            houseImages = JSON.parse(houseImages)
          } catch (e) {
            houseImages = []
          }
        }
        
        application.house = {
          id: row.house_id_full,
          project_id: row.house_project_id,
          number: row.house_number,
          floor: row.house_floor,
          area: row.house_area,
          rooms: row.house_rooms,
          price: row.house_price,
          status: row.house_status,
          description: row.house_description,
          images: houseImages,
          created_at: row.house_created_at,
          updated_at: row.house_updated_at,
        }
      }

      // Полный объект проекта
      if (row.project_id_full) {
        let projectImages = row.project_images
        if (typeof projectImages === 'string') {
          try {
            projectImages = JSON.parse(projectImages)
          } catch (e) {
            projectImages = []
          }
        }
        
        let projectFeatures = row.project_features
        if (typeof projectFeatures === 'string') {
          try {
            projectFeatures = JSON.parse(projectFeatures)
          } catch (e) {
            projectFeatures = []
          }
        }
        
        application.project = {
          id: row.project_id_full,
          name: row.project_name,
          district: row.project_district,
          type: row.project_type,
          description: row.project_description,
          full_description: row.project_full_description,
          price: row.project_price,
          price_from: row.project_price_from,
          completion: row.project_completion,
          rooms: row.project_rooms,
          parking: row.project_parking,
          status: row.project_status,
          discount: row.project_discount,
          image: row.project_image,
          images: projectImages,
          developer: row.project_developer,
          floors: row.project_floors,
          apartments: row.project_apartments,
          area: row.project_area,
          features: projectFeatures,
          created_at: row.project_created_at,
          updated_at: row.project_updated_at,
        }
      }

      // Информация о менеджере
      if (row.manager_id_full) {
        application.manager = {
          id: row.manager_id_full,
          username: row.manager_username,
        }
      }

      return application
    })

    res.json(applications)
  } catch (error) {
    console.error('Ошибка при получении заявок:', error)
    res.status(500).json({ error: 'Внутренняя ошибка сервера' })
  }
})

// Получить заявку по ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query(
      `SELECT 
        a.*,
        c.id as client_id_full,
        c.name as client_name,
        c.phone as client_phone,
        c.email as client_email,
        c.notes as client_notes,
        c.created_at as client_created_at,
        c.updated_at as client_updated_at,
        h.id as house_id_full,
        h.project_id as house_project_id,
        h.number as house_number,
        h.floor as house_floor,
        h.area as house_area,
        h.rooms as house_rooms,
        h.price as house_price,
        h.status as house_status,
        h.description as house_description,
        h.images as house_images,
        h.created_at as house_created_at,
        h.updated_at as house_updated_at,
        p.id as project_id_full,
        p.name as project_name,
        p.district as project_district,
        p.type as project_type,
        p.description as project_description,
        p.full_description as project_full_description,
        p.price as project_price,
        p.price_from as project_price_from,
        p.completion as project_completion,
        p.rooms as project_rooms,
        p.parking as project_parking,
        p.status as project_status,
        p.discount as project_discount,
        p.image as project_image,
        p.images as project_images,
        p.developer as project_developer,
        p.floors as project_floors,
        p.apartments as project_apartments,
        p.area as project_area,
        p.features as project_features,
        p.created_at as project_created_at,
        p.updated_at as project_updated_at,
        u.id as manager_id_full,
        u.username as manager_username
      FROM applications a
      LEFT JOIN clients c ON a.client_id = c.id
      LEFT JOIN houses h ON a.house_id = h.id
      LEFT JOIN projects p ON a.project_id = p.id
      LEFT JOIN users u ON a.manager_id = u.id
      WHERE a.id = $1`,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Заявка не найдена' })
    }

    const row = result.rows[0]
    
    // Формируем объект с полными данными
    const application = {
      id: row.id,
      client_id: row.client_id,
      house_id: row.house_id,
      project_id: row.project_id,
      manager_id: row.manager_id,
      status: row.status,
      source: row.source,
      notes: row.notes,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }

    // Полный объект клиента
    if (row.client_id_full) {
      application.client = {
        id: row.client_id_full,
        name: row.client_name,
        phone: row.client_phone,
        email: row.client_email,
        notes: row.client_notes,
        created_at: row.client_created_at,
        updated_at: row.client_updated_at,
      }
    }

    // Полный объект дома
    if (row.house_id_full) {
      let houseImages = row.house_images
      if (typeof houseImages === 'string') {
        try {
          houseImages = JSON.parse(houseImages)
        } catch (e) {
          houseImages = []
        }
      }
      
      application.house = {
        id: row.house_id_full,
        project_id: row.house_project_id,
        number: row.house_number,
        floor: row.house_floor,
        area: row.house_area,
        rooms: row.house_rooms,
        price: row.house_price,
        status: row.house_status,
        description: row.house_description,
        images: houseImages,
        created_at: row.house_created_at,
        updated_at: row.house_updated_at,
      }
    }

    // Полный объект проекта
    if (row.project_id_full) {
      let projectImages = row.project_images
      if (typeof projectImages === 'string') {
        try {
          projectImages = JSON.parse(projectImages)
        } catch (e) {
          projectImages = []
        }
      }
      
      let projectFeatures = row.project_features
      if (typeof projectFeatures === 'string') {
        try {
          projectFeatures = JSON.parse(projectFeatures)
        } catch (e) {
          projectFeatures = []
        }
      }
      
      application.project = {
        id: row.project_id_full,
        name: row.project_name,
        district: row.project_district,
        type: row.project_type,
        description: row.project_description,
        full_description: row.project_full_description,
        price: row.project_price,
        price_from: row.project_price_from,
        completion: row.project_completion,
        rooms: row.project_rooms,
        parking: row.project_parking,
        status: row.project_status,
        discount: row.project_discount,
        image: row.project_image,
        images: projectImages,
        developer: row.project_developer,
        floors: row.project_floors,
        apartments: row.project_apartments,
        area: row.project_area,
        features: projectFeatures,
        created_at: row.project_created_at,
        updated_at: row.project_updated_at,
      }
    }

    // Информация о менеджере
    if (row.manager_id_full) {
      application.manager = {
        id: row.manager_id_full,
        username: row.manager_username,
      }
    }

    res.json(application)
  } catch (error) {
    console.error('Ошибка при получении заявки:', error)
    res.status(500).json({ error: 'Внутренняя ошибка сервера' })
  }
})

// Создать заявку
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      client_id,
      house_id,
      project_id,
      manager_id,
      status = 'new',
      source,
      notes,
    } = req.body

    // Если manager_id не указан, используем текущего пользователя
    const finalManagerId = manager_id || req.user.id

    const result = await pool.query(
      `INSERT INTO applications (client_id, house_id, project_id, manager_id, status, source, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        client_id || null,
        house_id || null,
        project_id || null,
        finalManagerId,
        status,
        source || null,
        notes || null,
      ]
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Ошибка при создании заявки:', error)
    res.status(500).json({ error: 'Внутренняя ошибка сервера' })
  }
})

// Обновить заявку
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const {
      client_id,
      house_id,
      project_id,
      manager_id,
      status,
      source,
      notes,
    } = req.body

    const existingApplication = await pool.query('SELECT id FROM applications WHERE id = $1', [id])
    if (existingApplication.rows.length === 0) {
      return res.status(404).json({ error: 'Заявка не найдена' })
    }

    const updates = []
    const values = []
    let paramCount = 0

    if (client_id !== undefined) {
      paramCount++
      updates.push(`client_id = $${paramCount}`)
      values.push(client_id)
    }
    if (house_id !== undefined) {
      paramCount++
      updates.push(`house_id = $${paramCount}`)
      values.push(house_id)
    }
    if (project_id !== undefined) {
      paramCount++
      updates.push(`project_id = $${paramCount}`)
      values.push(project_id)
    }
    if (manager_id !== undefined) {
      paramCount++
      updates.push(`manager_id = $${paramCount}`)
      values.push(manager_id)
    }
    if (status !== undefined) {
      paramCount++
      updates.push(`status = $${paramCount}`)
      values.push(status)
    }
    if (source !== undefined) {
      paramCount++
      updates.push(`source = $${paramCount}`)
      values.push(source)
    }
    if (notes !== undefined) {
      paramCount++
      updates.push(`notes = $${paramCount}`)
      values.push(notes)
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Нет данных для обновления' })
    }

    paramCount++
    values.push(id)
    updates.push('updated_at = CURRENT_TIMESTAMP')

    const result = await pool.query(
      `UPDATE applications SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    )

    res.json(result.rows[0])
  } catch (error) {
    console.error('Ошибка при обновлении заявки:', error)
    res.status(500).json({ error: 'Внутренняя ошибка сервера' })
  }
})

// Удалить заявку
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query('DELETE FROM applications WHERE id = $1 RETURNING id', [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Заявка не найдена' })
    }

    res.json({ message: 'Заявка успешно удалена' })
  } catch (error) {
    console.error('Ошибка при удалении заявки:', error)
    res.status(500).json({ error: 'Внутренняя ошибка сервера' })
  }
})

export default router

