-- Создание таблицы пользователей (администраторов)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы проектов (новостроек)
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  district VARCHAR(255) NOT NULL,
  type VARCHAR(255) NOT NULL,
  description TEXT,
  full_description TEXT,
  price VARCHAR(255),
  price_from VARCHAR(255),
  completion VARCHAR(255),
  rooms VARCHAR(255),
  parking VARCHAR(255),
  status VARCHAR(255),
  discount VARCHAR(255),
  image TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  developer VARCHAR(255),
  floors VARCHAR(255),
  apartments VARCHAR(255),
  area VARCHAR(255),
  features JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_projects_district ON projects(district);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_type ON projects(type);

