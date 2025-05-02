import React from 'react'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { PaymentRecord } from '../../lib/supabase'

const validationSchema = Yup.object().shape({
  amount: Yup.number()
    .required('Amount is required')
    .positive('Amount must be positive'),
  payment_method: Yup.string()
    .required('Payment method is required')
    .oneOf(['bank_transfer', 'card', 'cash', 'mobile_money']),
  reference: Yup.string()
    .required('Reference number is required'),
  payment_date: Yup.date()
    .required('Payment date is required')
    .max(new Date(), 'Payment date cannot be in the future')
})

interface PaymentFormProps {
  membershipId: string
  onSubmit: (values: Partial<PaymentRecord>) => Promise<void>
  onCancel: () => void
  initialValues?: Partial<PaymentRecord>
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  membershipId,
  onSubmit,
  onCancel,
  initialValues
}) => {
  const defaultValues = {
    membership_id: membershipId,
    amount: '',
    payment_method: 'bank_transfer',
    reference: '',
    payment_date: new Date().toISOString().split('T')[0],
    ...initialValues
  }

  return (
    <Formik
      initialValues={defaultValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ errors, touched, isSubmitting }) => (
        <Form className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Amount (GHS)
            </label>
            <Field
              type="number"
              name="amount"
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                errors.amount && touched.amount ? 'border-red-500' : ''
              }`}
            />
            {errors.amount && touched.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
            )}
          </div>

          <div>
            <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700">
              Payment Method
            </label>
            <Field
              as="select"
              name="payment_method"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="bank_transfer">Bank Transfer</option>
              <option value="card">Card Payment</option>
              <option value="cash">Cash</option>
              <option value="mobile_money">Mobile Money</option>
            </Field>
            {errors.payment_method && touched.payment_method && (
              <p className="mt-1 text-sm text-red-600">{errors.payment_method}</p>
            )}
          </div>

          <div>
            <label htmlFor="reference" className="block text-sm font-medium text-gray-700">
              Reference Number
            </label>
            <Field
              type="text"
              name="reference"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
            {errors.reference && touched.reference && (
              <p className="mt-1 text-sm text-red-600">{errors.reference}</p>
            )}
          </div>

          <div>
            <label htmlFor="payment_date" className="block text-sm font-medium text-gray-700">
              Payment Date
            </label>
            <Field
              type="date"
              name="payment_date"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
            {errors.payment_date && touched.payment_date && (
              <p className="mt-1 text-sm text-red-600">{errors.payment_date}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Payment'}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default PaymentForm