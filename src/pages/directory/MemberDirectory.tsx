import { useState } from 'react'
import { useCompanies } from '../../hooks/useCompanies'
import CompanyCard from '../../components/directory/CompanyCard'
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'

const MemberDirectory = () => {
  const { companies, isLoading, error } = useCompanies()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSector, setSelectedSector] = useState<string>('')

  const filteredCompanies = companies?.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSector = !selectedSector || company.industry_sector === selectedSector
    return matchesSearch && matchesSector
  })

  const sectors = companies ? [...new Set(companies.map(c => c.industry_sector))].sort() : []

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Member Directory</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search companies..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
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
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Unable to load companies. Please try again later.</p>
          <button
            onClick={() => window.location.reload()}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies && filteredCompanies.length > 0 ? filteredCompanies.map((company, index) => (
            <motion.div
              key={company.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <CompanyCard company={company} />
            </motion.div>
          )) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No companies found matching your criteria.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default MemberDirectory