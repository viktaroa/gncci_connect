import React, { useState } from 'react'
import { useBusinessOpportunities } from '../../hooks/useBusinessOpportunities'
import OpportunityCard from '../../components/opportunities/OpportunityCard'
import { motion } from 'framer-motion'
import {
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'

const BusinessOpportunities = () => {
  const { opportunities, isLoading, deleteOpportunity } = useBusinessOpportunities()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedSector, setSelectedSector] = useState('')

  const filteredOpportunities = opportunities?.filter(opp => {
    const matchesSearch = opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opp.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = !selectedType || opp.opportunity_type === selectedType
    const matchesSector = !selectedSector || opp.sector === selectedSector
    return matchesSearch && matchesType && matchesSector
  })

  const sectors = opportunities ? [...new Set(opportunities.map(o => o.sector))].sort() : []
  const types = ['tender', 'partnership', 'investment', 'job']

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this opportunity?')) {
      await deleteOpportunity.mutateAsync(id)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Business Opportunities</h1>
        <Link
          to="/opportunities/new"
          className="btn btn-primary"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Post Opportunity
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search opportunities..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <FunnelIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="">All Types</option>
              {types.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="relative">
            <FunnelIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
            >
              <option value="">All Sectors</option>
              {sectors.map(sector => (
                <option key={sector} value={sector}>{sector}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOpportunities?.map((opportunity, index) => (
            <motion.div
              key={opportunity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <OpportunityCard
                opportunity={opportunity}
                onDelete={handleDelete}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default BusinessOpportunities