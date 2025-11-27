import React, { useState } from 'react'

const FilterPanel = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    district: '',
    priceMin: '',
    priceMax: '',
    rooms: '',
    status: '',
  })

  const districts = ['Центр', 'Север', 'Юг', 'Восток', 'Запад']
  const rooms = ['Студия', '1', '2', '3', '4+']
  const statuses = ['Строится', 'Сдан', 'Скоро сдача']

  const handleChange = (name, value) => {
    const newFilters = { ...filters, [name]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const resetFilters = () => {
    const emptyFilters = {
      district: '',
      priceMin: '',
      priceMax: '',
      rooms: '',
      status: '',
    }
    setFilters(emptyFilters)
    onFilterChange(emptyFilters)
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Фильтры</h2>
        <button
          onClick={resetFilters}
          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          Сбросить
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Район
          </label>
          <select
            value={filters.district}
            onChange={(e) => handleChange('district', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Все районы</option>
            {districts.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Цена от (₽/м²)
          </label>
          <input
            type="number"
            value={filters.priceMin}
            onChange={(e) => handleChange('priceMin', e.target.value)}
            placeholder="От"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Цена до (₽/м²)
          </label>
          <input
            type="number"
            value={filters.priceMax}
            onChange={(e) => handleChange('priceMax', e.target.value)}
            placeholder="До"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Количество комнат
          </label>
          <select
            value={filters.rooms}
            onChange={(e) => handleChange('rooms', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Любое</option>
            {rooms.map((room) => (
              <option key={room} value={room}>
                {room}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Статус
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Все</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

export default FilterPanel



