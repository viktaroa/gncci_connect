import React from 'react'
import { useAuth } from '../../contexts/AuthContextRenamed'
import { useCompany } from '../../hooks/useCompany'
import { useMembership } from '../../hooks/useMembership'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  UserCircleIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline'

const MemberProfile = () => {
  const { user } = useAuth()
  const { company, isLoading: isLoadingCompany } = useCompany()
  const { membership, isLoading: isLoadingMembership } = useMembership(
    company?.id && company.id !== 'new' ? company.id : undefined
  )

  if (isLoadingCompany || isLoadingMembership) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center space-x-4">
            <UserCircleIcon className="h-16 w-16 text-gray-400" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {user?.first_name} {user?.last_name}
              </h1>
              <p className="text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Company Information</h2>
                {company && company.id !== 'new' && (
                  <Link
                    to={`/directory/${company.id}/edit`}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    Edit Company Profile
                  </Link>
                )}
              </div>

              {company && company.id !== 'new' ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-900">{company.name}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-900">{user?.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-900">{user?.email}</span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-500">Address</h3>
                    <p className="mt-1 text-gray-900">
                      {company.address}<br />
                      {company.city}, {company.country}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No Company Profile</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by creating your company profile.
                  </p>
                  <div className="mt-6">
                    <Link
                      to="/directory/new"
                      className="btn btn-primary"
                    >
                      Create Company Profile
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Membership Status</h2>
              {membership ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Status</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      membership.status === 'active' ? 'bg-green-100 text-green-800' :
                      membership.status === 'expired' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {membership.status.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Type</span>
                    <p className="mt-1 text-sm text-gray-900">
                      {membership.membership_type.toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Payment Status</span>
                    <p className="mt-1 text-sm text-gray-900">
                      {membership.payment_status.toUpperCase()}
                    </p>
                  </div>
                  <Link
                    to={`/membership/${membership.id}`}
                    className="mt-4 flex items-center justify-center w-full btn btn-outline"
                  >
                    <CreditCardIcon className="h-5 w-5 mr-2" />
                    View Membership Details
                  </Link>
                </div>
              ) : company && company.id !== 'new' ? (
                <div className="text-center py-6">
                  <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No Active Membership</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Apply for membership to access all features.
                  </p>
                  <div className="mt-6">
                    <Link
                     to="/membership/new"
                      className="btn btn-primary"
                    >
                      Apply for Membership
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Create Company Profile First</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    You need to create a company profile before applying for membership.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default MemberProfile