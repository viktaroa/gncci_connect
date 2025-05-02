import { useParams, useNavigate } from 'react-router-dom'
import { useCompany } from '../../hooks/useCompany'
import { useAuth } from '../../contexts/AuthContextRenamed'
import { format } from 'date-fns'
import {
  BuildingOfficeIcon,
  MapPinIcon,
  GlobeAltIcon,
  UserGroupIcon,
  CalendarIcon,
  CheckBadgeIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'

const CompanyProfile = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { company, membership, isLoading } = useCompany(id!)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">Company not found</h2>
        <button
          onClick={() => navigate('/directory')}
          className="mt-4 text-primary-600 hover:text-primary-700"
        >
          Return to Directory
        </button>
      </div>
    )
  }

  const isOwner = user?.id === company.user_id

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {company.logo_url ? (
                <img
                  src={company.logo_url}
                  alt={`${company.name} logo`}
                  className="h-20 w-20 rounded-lg object-cover"
                />
              ) : (
                <div className="h-20 w-20 rounded-lg bg-primary-100 flex items-center justify-center">
                  <BuildingOfficeIcon className="h-10 w-10 text-primary-600" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
                <p className="text-gray-500">{company.industry_sector}</p>
                {membership && (
                  <div className="mt-2 flex items-center">
                    {membership.status === 'active' ? (
                      <CheckBadgeIcon className="h-5 w-5 text-green-500 mr-1" />
                    ) : (
                      <XCircleIcon className="h-5 w-5 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${
                      membership.status === 'active' ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {membership.membership_type.charAt(0).toUpperCase() + membership.membership_type.slice(1)} Member
                    </span>
                  </div>
                )}
              </div>
            </div>
            {isOwner && (
              <button
                onClick={() => navigate(`/directory/${company.id}/edit`)}
                className="btn btn-primary"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Company Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">About</h2>
              <p className="text-gray-600 mb-6">{company.description || 'No description available.'}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPinIcon className="h-5 w-5" />
                  <span>{company.address}, {company.city}, {company.country}</span>
                </div>
                {company.website && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <GlobeAltIcon className="h-5 w-5" />
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700"
                    >
                      {company.website}
                    </a>
                  </div>
                )}
                {company.employee_count && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <UserGroupIcon className="h-5 w-5" />
                    <span>{company.employee_count} employees</span>
                  </div>
                )}
                {company.year_established && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <CalendarIcon className="h-5 w-5" />
                    <span>Established {company.year_established}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Registration Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Registration Number</label>
                  <span className="mt-1 block text-gray-900">{company.registration_number}</span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Member Since</label>
                  <span className="mt-1 block text-gray-900">
                    {format(new Date(company.created_at), 'MMMM yyyy')}
                  </span>
                </div>
                {membership && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Membership Status</label>
                      <span className={`mt-1 block font-medium ${
                        membership.status === 'active' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {membership.status.charAt(0).toUpperCase() + membership.status.slice(1)}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Valid Until</label>
                      <span className="mt-1 block text-gray-900">
                        {membership.end_date ? format(new Date(membership.end_date), 'dd MMMM yyyy') : 'N/A'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default CompanyProfile