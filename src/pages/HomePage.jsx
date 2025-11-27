import React, { useState, useMemo } from 'react'
import FilterPanel from '../components/FilterPanel'
import ProjectCard from '../components/ProjectCard'
import { projects } from '../data/projects'

const HomePage = () => {
  const [filters, setFilters] = useState({
    district: '',
    priceMin: '',
    priceMax: '',
    rooms: '',
    status: '',
  })
    {
      id: 1,
      name: 'ЖК Премиум Парк',
      district: 'Центр',
      description: 'Современный жилой комплекс премиум-класса с развитой инфраструктурой и закрытой территорией.',
      price: '350 000 ₽',
      completion: 'Q2 2025',
      rooms: '1-4 комн.',
      parking: 'Подземный',
      status: 'Строится',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
    },
    {
      id: 2,
      name: 'ЖК Солнечный Берег',
      district: 'Юг',
      description: 'Комфортабельный комплекс с видом на парк и собственной набережной.',
      price: '280 000 ₽',
      completion: 'Q4 2024',
      rooms: 'Студия-3 комн.',
      parking: 'Наземный',
      status: 'Скоро сдача',
      discount: '-10%',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop',
    },
    {
      id: 3,
      name: 'ЖК Северные Высоты',
      district: 'Север',
      description: 'Высотный комплекс бизнес-класса с панорамными видами и современными планировками.',
      price: '320 000 ₽',
      completion: 'Q1 2025',
      rooms: '2-5 комн.',
      parking: 'Подземный',
      status: 'Строится',
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
    },
    {
      id: 4,
      name: 'ЖК Восточный Квартал',
      district: 'Восток',
      description: 'Семейный комплекс с детскими площадками, школой и поликлиникой в шаговой доступности.',
      price: '240 000 ₽',
      completion: 'Сдан',
      rooms: '1-4 комн.',
      parking: 'Наземный',
      status: 'Сдан',
      image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop',
    },
    {
      id: 5,
      name: 'ЖК Западный Парк',
      district: 'Запад',
      description: 'Экологичный комплекс рядом с лесопарком, идеален для семей с детьми.',
      price: '290 000 ₽',
      completion: 'Q3 2025',
      rooms: 'Студия-3 комн.',
      parking: 'Подземный',
      status: 'Строится',
      image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=600&fit=crop',
    },
    {
      id: 6,
      name: 'ЖК Центральный Плаза',
      district: 'Центр',
      description: 'Премиальный комплекс в самом центре города с панорамными окнами и террасами.',
      price: '420 000 ₽',
      completion: 'Q2 2025',
      rooms: '2-4 комн.',
      parking: 'Подземный',
      status: 'Строится',
      image: 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800&h=600&fit=crop',
    },
  ]

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      if (filters.district && project.district !== filters.district) return false
      if (filters.status && project.status !== filters.status) return false
      if (filters.priceMin) {
        const price = parseInt(project.price.replace(/\s/g, '').replace('₽', ''))
        if (price < parseInt(filters.priceMin)) return false
      }
      if (filters.priceMax) {
        const price = parseInt(project.price.replace(/\s/g, '').replace('₽', ''))
        if (price > parseInt(filters.priceMax)) return false
      }
      return true
    })
  }, [filters])

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-6">
              Квартиры в новостройках
            </h1>
            <p className="text-xl mb-8 text-primary-100">
              Более 1000 квартир в лучших жилых комплексах. Выгодные условия покупки и рассрочка до 20 лет.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                Подобрать квартиру
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition">
                Рассчитать ипотеку
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Каталог новостроек
          </h2>
          <p className="text-gray-600">
            Найдено проектов: {filteredProjects.length}
          </p>
        </div>

        <FilterPanel onFilterChange={setFilters} />

        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">По заданным фильтрам ничего не найдено</p>
          </div>
        )}
      </section>

      {/* Benefits Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Почему выбирают нас
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Безопасная сделка</h3>
              <p className="text-gray-600">Все документы проверены, сделки проходят через эскроу-счета</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Лучшие цены</h3>
              <p className="text-gray-600">Прямые договоры с застройщиками, без переплат и комиссий</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Быстрое оформление</h3>
              <p className="text-gray-600">Помощь в оформлении ипотеки и всех документов за 1 день</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage

