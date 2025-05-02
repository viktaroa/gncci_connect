import React from 'react'
import { useParams } from 'react-router-dom'
import { useMembership } from '../../hooks/useMembership'
import { usePaymentRecords } from '../../hooks/usePaymentRecords'
import { format } from 'date-fns'
import {
  CreditCardIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import PaymentForm from './PaymentForm'
import { useState } from 'react'

const MembershipDetails = () => {
  const { id } = useParams<{ id: string }>()
  const { membership, isLoading: isLoadingMembership } = useMembership(id)
  const { payments, isLoading: isLoadingPayments, createPayment } = usePaymentRecords(id)
  const [showPaymentForm, setShowPaymentForm] = useState(false)

  const isLoading = isLoadingMembership || isLoadingPayments

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!membership) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">Membership not found</h2>
      </div>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'expired':
        return <XCircleIcon className="h-5 w-5 text-red-500" />
      default:
        return <ClockIcon className="h-5 w-5 text-yellow-500" />
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Membership Details</h1>
          <div className="flex items-center space-x-2">
            {getStatusIcon(membership.status)}
            <span className={`font-medium ${
              membership.status === 'active' ? 'text-green-700' :
              membership.status === 'expired' ? 'text-red-700' :
              'text-yellow-700'
            }`}>
              {membership.status.charAt(0).toUpperCase() + membership.status.slice(1)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Membership Information</h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Type</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {membership.membership_type.toUpperCase()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Annual Fee</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  GHS {membership.annual_fee.toFixed(2)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Start Date</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {format(new Date(membership.start_date), 'PPP')}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Next Payment Due</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {membership.next_payment_date
                    ? format(new Date(membership.next_payment_date), 'PPP')
                    : 'Not set'}
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Payment History</h2>
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setShowPaymentForm(true)}
                className="btn btn-primary"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Record Payment
              </button>
            </div>
            {payments && payments.length > 0 ? (
              <div className="space-y-4">
                {payments.map(payment => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <CreditCardIcon className="h-6 w-6 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          GHS {payment.amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(payment.payment_date), 'PPP')}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      payment.status === 'success' ? 'bg-green-100 text-green-800' :
                      payment.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {payment.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No payment records found.</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Payment Form Modal */}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-lg font-semibold mb-4">Record Payment</h2>
            <PaymentForm
              membershipId={id!}
              onSubmit={async (values) => {
                await createPayment.mutateAsync(values)
                setShowPaymentForm(false)
              }}
              onCancel={() => setShowPaymentForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default MembershipDetails