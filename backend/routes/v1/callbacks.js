import express from 'express'
import pool from '../../db/index.js'

const router = express.Router()

// Создать заявку на звонок (публичный доступ)
router.post('/', async (req, res) => {
  try {
    const { name, phone, reason, project_id, house_id, notes } = req.body

    if (!name || !phone) {
      return res.status(400).json({ error: 'Имя и телефон обязательны' })
    }

    // Валидация телефона
    const phoneDigits = phone.replace(/\D/g, '')
    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      return res.status(400).json({ error: 'Некорректный номер телефона' })
    }

    // Создаем или находим клиента
    let clientResult = await pool.query(
      'SELECT id FROM clients WHERE phone = $1',
      [phone]
    )

    let clientId
    if (clientResult.rows.length > 0) {
      clientId = clientResult.rows[0].id
      // Обновляем имя клиента, если оно изменилось
      await pool.query(
        'UPDATE clients SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [name, clientId]
      )
    } else {
      // Создаем нового клиента
      const newClient = await pool.query(
        'INSERT INTO clients (name, phone, notes) VALUES ($1, $2, $3) RETURNING id',
        [name, phone, notes || null]
      )
      clientId = newClient.rows[0].id
    }

    // Создаем заявку
    const applicationResult = await pool.query(
      `INSERT INTO applications (client_id, project_id, house_id, status, source, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        clientId,
        project_id || null,
        house_id || null,
        'new',
        reason || 'callback',
        notes || `Заявка на звонок. Причина: ${reason || 'не указана'}`
      ]
    )

    res.status(201).json({
      success: true,
      message: 'Заявка успешно создана',
      application: applicationResult.rows[0]
    })
  } catch (error) {
    console.error('Ошибка при создании заявки на звонок:', error)
    res.status(500).json({ error: 'Внутренняя ошибка сервера' })
  }
})

export default router

