import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import pool from '../db/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function migrateAll() {
  try {
    const migrationsDir = path.join(__dirname, '../db/migrations')
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql') && !file.startsWith('._')) // Исключаем служебные файлы macOS
      .sort()

    for (const file of files) {
      console.log(`Выполнение миграции: ${file}`)
      const migrationFile = path.join(migrationsDir, file)
      const sql = fs.readFileSync(migrationFile, 'utf8')
      await pool.query(sql)
      console.log(`✅ ${file} выполнена успешно`)
    }
    
    console.log('✅ Все миграции выполнены успешно')
    
    await pool.end()
    process.exit(0)
  } catch (error) {
    console.error('❌ Ошибка при выполнении миграций:', error)
    await pool.end()
    process.exit(1)
  }
}

migrateAll()


