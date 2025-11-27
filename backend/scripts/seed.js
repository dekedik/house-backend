import bcrypt from 'bcryptjs'
import pool from '../db/index.js'

async function seed() {
  try {
    // Создание базового администратора
    const username = 'main_manager'
    const password = '7\\gU%T$fVRt?pqB'
    
    const passwordHash = await bcrypt.hash(password, 10)
    
    // Проверяем, существует ли уже пользователь
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    )
    
    if (existingUser.rows.length > 0) {
      console.log('⚠️  Администратор уже существует')
      // Обновляем пароль
      await pool.query(
        'UPDATE users SET password_hash = $1 WHERE username = $2',
        [passwordHash, username]
      )
      console.log('✅ Пароль администратора обновлен')
    } else {
      await pool.query(
        'INSERT INTO users (username, password_hash) VALUES ($1, $2)',
        [username, passwordHash]
      )
      console.log('✅ Базовый администратор создан')
      console.log(`   Логин: ${username}`)
      console.log(`   Пароль: ${password}`)
    }
    
    await pool.end()
    process.exit(0)
  } catch (error) {
    console.error('❌ Ошибка при создании администратора:', error)
    await pool.end()
    process.exit(1)
  }
}

seed()

