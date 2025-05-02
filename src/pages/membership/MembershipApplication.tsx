import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContextRenamed'
import { useCompany } from '../../hooks/useCompany'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'

const validationSchema = Yup.object().shape({
  membership_type: Yup.string()
    .required('Membership type is required')
    .oneOf(['sme', 'corporate', 'international']),
  documents_url: Yup.array().of(Yup.string().url('Must be a valid URL')),
  notes: Yup.string()
})

const MembershipApplication = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { company, isLoading } = useCompany()

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!company || company.id === 'new') {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Company Profile Required</h2>
          <p className="mt-2 text-gray-600">
            You need to create a company profile before applying for membership.
          </p>
          <button
            onClick={() => navigate('/directory/new')}
            className="mt-4 btn btn-primary"
          >
            Create Company Profile
          </button>
        </div>
      </div>
    )
  }

  const membershipFees = {
    sme: 1000.00,
    corporate: 2500.00,
    international: 5000.00
  }

  const handleSubmit = async (values: any) => {
    try {
      const { error } = await supabase
        .from('membership_applications')
        .insert([{
          company_id: company.id,
          membership_type: values.membership_type,
          annual_fee: membershipFees[values.membership_type as keyof typeof membershipFees],
          documents_url: values.documents_url,
          notes: values.notes
        }])

      if (error) throw error

      toast.success('Membership application submitted successfully')
      navigate('/profile')
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit application')
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Apply for Membership</h1>

          <Formik
            initialValues={{
              membership_type: 'sme',
              documents_url: [],
              notes: ''
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Membership Type
                  </label>
                  <Field
                    as="select"
                    name="membership_type"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  >
                    <option value="sme">SME (GHS {membershipFees.sme.toFixed(2)})</option>
                    <option value="corporate">Corporate (GHS {membershipFees.corporate.toFixed(2)})</option>
                    <option value="international">International (GHS {membershipFees.international.toFixed(2)})</option>
                  </Field>
                  {errors.membership_type && touched.membership_type && (
                    <p className="mt-1 text-sm text-red-600">{errors.membership_type}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Additional Notes
                  </label>
                  <Field
                    as="textarea"
                    name="notes"
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    placeholder="Any additional information you'd like to provide..."
                  />
                  {errors.notes && touched.notes && (
                    <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
                  )}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Membership Benefits
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    <li>Access to exclusive business opportunities</li>
                    <li>Networking events and workshops</li>
                    <li>Business advisory services</li>
                    <li>International trade support</li>
                    <li>Advocacy and representation</li>
                  </ul>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => navigate('/profile')}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </motion.div>
    </div>
  )
}

export default MembershipApplication