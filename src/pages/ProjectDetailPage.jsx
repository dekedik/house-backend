import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getProjectById } from '../data/projects'

const ProjectDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const project = getProjectById(id)
  const [selectedImage, setSelectedImage] = useState(0)

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Проект не найден</h1>
        <Link to="/" className="text-primary-600 hover:text-primary-700">
          Вернуться к каталогу
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Breadcrumbs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-gray-500 hover:text-primary-600">
              Главная
            </Link>
            <span className="text-gray-400">/</span>
            <Link to="/" className="text-gray-500 hover:text-primary-600">
              Новостройки
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-800">{project.name}</span>
          </nav>
        </div>
      </div>

      {/* Main Image Section */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="relative h-96 rounded-xl overflow-hidden mb-4">
                <img
                  src={project.images[selectedImage]}
                  alt={project.name}
                  className="w-full h-full object-cover"
                />
                {project.status && (
                  <span className="absolute top-4 left-4 bg-primary-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                    {project.status}
                  </span>
                )}
                {project.discount && (
                  <span className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                    {project.discount}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-4">
                {project.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative h-24 rounded-lg overflow-hidden border-2 transition ${
                      selectedImage === index ? 'border-primary-600' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${project.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Sidebar Info */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
              <button
                onClick={() => navigate(-1)}
                className="mb-4 text-gray-600 hover:text-primary-600 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Назад</span>
              </button>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{project.name}</h1>
                <p className="text-gray-600 mb-6">{project.district}</p>

                <div className="space-y-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Цена от</p>
                    <p className="text-3xl font-bold text-primary-600">{project.priceFrom}</p>
                    <p className="text-sm text-gray-500">от {project.price} за м²</p>
                  </div>

                  <div className="border-t pt-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 mb-1">Срок сдачи</p>
                        <p className="font-semibold text-gray-800">{project.completion}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Квартир</p>
                        <p className="font-semibold text-gray-800">{project.apartments}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Этажность</p>
                        <p className="font-semibold text-gray-800">{project.floors}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Площадь</p>
                        <p className="font-semibold text-gray-800">{project.area}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition font-semibold">
                    Заказать звонок
                  </button>
                  <button className="w-full border-2 border-primary-600 text-primary-600 py-3 rounded-lg hover:bg-primary-50 transition font-semibold">
                    Рассчитать ипотеку
                  </button>
                  <button className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition font-semibold">
                    Записаться на просмотр
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Description Section */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">О проекте</h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-8">
              {project.fullDescription}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Характеристики</h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Застройщик</span>
                    <span className="font-semibold text-gray-800">{project.developer}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Район</span>
                    <span className="font-semibold text-gray-800">{project.district}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Этажность</span>
                    <span className="font-semibold text-gray-800">{project.floors}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Количество квартир</span>
                    <span className="font-semibold text-gray-800">{project.apartments}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Площадь квартир</span>
                    <span className="font-semibold text-gray-800">{project.area}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Парковка</span>
                    <span className="font-semibold text-gray-800">{project.parking}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Срок сдачи</span>
                    <span className="font-semibold text-gray-800">{project.completion}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Инфраструктура</h3>
                <div className="grid grid-cols-2 gap-3">
                  {project.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Заинтересовал этот проект?</h2>
          <p className="text-xl text-primary-100 mb-8">
            Свяжитесь с нами, и мы подберем для вас идеальную квартиру
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
              Заказать звонок
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition">
              Рассчитать ипотеку
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ProjectDetailPage



