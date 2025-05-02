import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase, type BusinessOpportunity, type Company } from '../../lib/supabase'
import { format } from 'date-fns'
import {
  BuildingOfficeIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  EnvelopeIcon,
  PhoneIcon,
  TagIcon,
} from '@heroicons/react/24/outline'

const OpportunityDetails = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: opportunity, isLoading: isLoadingOpportunity } = useQuery({
    queryKey: ['opportunity', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_opportunities')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data
    }
  })

  const { data: company } = useQuery({
    queryKey: ['company', opportunity?.company_id],
    queryFn: async () => {
      if (!opportunity?.company_id) return null
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', opportunity.company_id)
        .single()
      
      if (error) throw error
      return data
    },
    enabled: !!opportunity?.company_id
  })

  if (isLoadingOpportunity) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!opportunity) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">Opportunity not found</h2>
        <button
          onClick={() => navigate('/opportunities')}
          className="mt-4 text-primary-600 hover:text-primary-700"
        >
          Return to Opportunities
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{opportunity.title}</h1>
            <span className={`
              px-3 py-1 rounded-full text-sm font-medium
              ${opportunity.opportunity_type === 'tender' ? 'bg-blue-100 text-blue-800' :
                opportunity.opportunity_type === 'partnership' ? 'bg-green-100 text-green-800' :
                opportunity.opportunity_type === 'investment' ? 'bg-purple-100 text-purple-800' :
                'bg-orange-100 text-orange-800'}
            `}>
              {opportunity.opportunity_type.charAt(0).toUpperCase() + opportunity.opportunity_type.slice(1)}
            </span>
          </div>

          <div className="prose max-w-none mb-8">
            <p className="text-gray-600">{opportunity.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <TagIcon className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-gray-600">Sector: {opportunity.sector}</span>
              </div>
              
              <div className="flex items-center">
                <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-gray-600">
                  Deadline: {format(new Date(opportunity.deadline), 'PPP')}
                </span>
              </div>
              
              {opportunity.budget_range && (
                <div className="flex items-center">
                  <CurrencyDollarIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-600">Budget: {opportunity.budget_range}</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {company && (
                <div className="flex items-center">
                  <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-600">Posted by: {company.name}</span>
                </div>
              )}
              
              <div className="flex items-center">
                <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
                <a 
                  href={`mailto:${opportunity.contact_email}`}
                  className="text-primary-600 hover:text-primary-700"
                >
                  {opportunity.contact_email}
                </a>
              </div>
              
              {opportunity.contact_phone && (
                <div className="flex items-center">
                  <PhoneIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-600">{opportunity.contact_phone}</span>
                </div>
              )}
            </div>
          </div>

          {opportunity.requirements && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-600 whitespace-pre-wrap">{opportunity.requirements}</p>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={() => navigate('/opportunities')}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Back to Opportunities
          </button>
        </div>
      </div>
    </div>
  )
}

export default OpportunityDetails