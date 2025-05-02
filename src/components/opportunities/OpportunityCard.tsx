import React from 'react'
import { Link } from 'react-router-dom'
import { BusinessOpportunity } from '../../lib/supabase'
import { format } from 'date-fns'
import {
  BriefcaseIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'

interface OpportunityCardProps {
  opportunity: BusinessOpportunity
  onDelete?: (id: string) => void
}

const OpportunityCard: React.FC<OpportunityCardProps> = ({ opportunity, onDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <BriefcaseIcon className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{opportunity.title}</h3>
              <p className="text-sm text-gray-500">{opportunity.sector}</p>
            </div>
          </div>
          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
            opportunity.opportunity_type === 'tender' ? 'bg-blue-100 text-blue-800' :
            opportunity.opportunity_type === 'partnership' ? 'bg-green-100 text-green-800' :
            opportunity.opportunity_type === 'investment' ? 'bg-purple-100 text-purple-800' :
            'bg-orange-100 text-orange-800'
          }`}>
            {opportunity.opportunity_type.toUpperCase()}
          </span>
        </div>

        <p className="text-gray-600 mb-4 line-clamp-2">{opportunity.description}</p>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <BuildingOfficeIcon className="h-5 w-5 mr-2" />
            <span>{opportunity.company_id ? 'Company Name' : 'Anonymous'}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <CalendarIcon className="h-5 w-5 mr-2" />
            <span>Due {format(new Date(opportunity.deadline), 'MMM d, yyyy')}</span>
          </div>
          {opportunity.budget_range && (
            <div className="flex items-center text-sm text-gray-500">
              <CurrencyDollarIcon className="h-5 w-5 mr-2" />
              <span>{opportunity.budget_range}</span>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
        <Link
          to={`/opportunities/${opportunity.id}`}
          className="text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          View Details →
        </Link>
        {onDelete && (
          <button
            onClick={() => onDelete(opportunity.id)}
            className="text-sm font-medium text-red-600 hover:text-red-700"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  )
}

export default OpportunityCard