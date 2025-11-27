import React from 'react'
import { useNavigate } from 'react-router-dom'

const ProjectCard = ({ project }) => {
  const navigate = useNavigate()

  const handleDetailsClick = () => {
    navigate(`/project/${project.id}`)
  }
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-64 overflow-hidden">
        <img
          src={project.image}
          alt={project.name}
          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
        />
        {project.status && (
          <span className="absolute top-4 left-4 bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            {project.status}
          </span>
        )}
        {project.discount && (
          <span className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            {project.discount}
          </span>
        )}
      </div>
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-800">{project.name}</h3>
          <span className="text-sm text-gray-500">{project.district}</span>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-2xl font-bold text-primary-600">{project.price}</p>
            <p className="text-xs text-gray-500">от цены за м²</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Срок сдачи</p>
            <p className="text-sm font-semibold text-gray-800">{project.completion}</p>
          </div>
        </div>

        <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
          {project.rooms && (
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>{project.rooms}</span>
            </div>
          )}
          {project.parking && (
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
              </svg>
              <span>{project.parking}</span>
            </div>
          )}
        </div>

        <button 
          onClick={handleDetailsClick}
          className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition font-medium"
        >
          Подробнее
        </button>
      </div>
    </div>
  )
}

export default ProjectCard

