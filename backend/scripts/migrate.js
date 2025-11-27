import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import pool from '../db/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function migrate() {
  try {
    const migrationFile = path.join(__dirname, '../db/migrations/001_create_tables.sql')
    const sql = fs.readFileSync(migrationFile, 'utf8')
    
    await pool.query(sql)
    console.log('✅ Миграции выполнены успешно')
    
    await pool.end()
    process.exit(0)
  } catch (error) {
    console.error('❌ Ошибка при выполнении миграций:', error)
    await pool.end()
    process.exit(1)
  }
}

migrate()

