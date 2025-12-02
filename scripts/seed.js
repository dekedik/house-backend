import bcrypt from 'bcryptjs'
import pool from '../db/index.js'

async function seed() {
  try {
    // Создание базового администратора
    const username = 'main_manager'
    const password = '7gU%T$fVRt?pqB'
    
    const passwordHash = await bcrypt.hash(password, 10)
    
    // Проверяем, существует ли уже пользователь
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    )
    
    if (existingUser.rows.length > 0) {
      console.log('⚠️  Администратор уже существует')
      // Обновляем пароль и роль
      await pool.query(
        'UPDATE users SET password_hash = $1, role = $2 WHERE username = $3',
        [passwordHash, 'super_manager', username]
      )
      console.log('✅ Пароль и роль администратора обновлены')
    } else {
      await pool.query(
        'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)',
        [username, passwordHash, 'super_manager']
      )
      console.log('✅ Базовый администратор создан')
      console.log(`   Логин: ${username}`)
      console.log(`   Пароль: ${password}`)
      console.log(`   Роль: super_manager`)
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

