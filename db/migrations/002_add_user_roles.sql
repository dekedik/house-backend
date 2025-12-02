-- Добавление поля role в таблицу users
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'manager';

-- Обновление существующего администратора до super_manager
UPDATE users SET role = 'super_manager' WHERE username = 'main_manager';


