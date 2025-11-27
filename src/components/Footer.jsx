import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">Н</span>
              </div>
              <span className="text-xl font-bold">Новостройки</span>
            </div>
            <p className="text-gray-400 text-sm">
              Агентство недвижимости по продаже квартир в новостройках
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Новостройки</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link to="/" className="hover:text-white transition">Все проекты</Link></li>
              <li><Link to="/" className="hover:text-white transition">Премиум класс</Link></li>
              <li><Link to="/" className="hover:text-white transition">Бизнес класс</Link></li>
              <li><Link to="/" className="hover:text-white transition">Комфорт класс</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Компания</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link to="/" className="hover:text-white transition">О нас</Link></li>
              <li><Link to="/" className="hover:text-white transition">Команда</Link></li>
              <li><Link to="/" className="hover:text-white transition">Отзывы</Link></li>
              <li><Link to="/" className="hover:text-white transition">Вакансии</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Контакты</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>+7 (495) 123-45-67</li>
              <li>info@novostroyki.ru</li>
              <li>Москва, ул. Примерная, д. 1</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>© 2024 Агентство новостроек. Все права защищены.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer



