import React from 'react'
import { Link } from 'react-router-dom'
import { type Company } from '../../lib/supabase'
import { BuildingOfficeIcon, GlobeAltIcon, UserGroupIcon } from '@heroicons/react/24/outline'

interface CompanyCardProps {
  company: Company
}

const CompanyCard: React.FC<CompanyCardProps> = ({ company }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {company.logo_url ? (
              <img 
                src={company.logo_url} 
                alt={`${company.name} logo`}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                <BuildingOfficeIcon className="h-6 w-6 text-primary-600" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{company.name}</h3>
              <p className="text-sm text-gray-500">{company.industry_sector}</p>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm text-gray-600 line-clamp-2">
            {company.description || 'No description available'}
          </p>
        </div>

        <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center">
            <UserGroupIcon className="h-4 w-4 mr-1" />
            <span>{company.employee_count || 'N/A'} employees</span>
          </div>
          {company.website && (
            <a 
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-primary-600 hover:text-primary-700"
            >
              <GlobeAltIcon className="h-4 w-4 mr-1" />
              Website
            </a>
          )}
        </div>
      </div>
      
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <Link
          to={`/directory/${company.id}`}
          className="text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          View Profile →
        </Link>
      </div>
    </div>
  )
}

export default CompanyCard