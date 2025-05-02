import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContextRenamed'
import { useCompanies } from '../../hooks/useCompanies'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { Company } from '../../lib/supabase'
import toast from 'react-hot-toast'

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Company name is required'),
  registration_number: Yup.string().required('Registration number is required'),
  industry_sector: Yup.string().required('Industry sector is required'),
  address: Yup.string().required('Address is required'),
  city: Yup.string().required('City is required'),
  country: Yup.string().required('Country is required'),
  website: Yup.string().url('Must be a valid URL').nullable(),
  description: Yup.string(),
  employee_count: Yup.number().positive('Must be a positive number').nullable(),
  year_established: Yup.number()
    .min(1800, 'Year must be after 1800')
    .max(new Date().getFullYear(), 'Year cannot be in the future')
    .nullable(),
  logo_url: Yup.string().url('Must be a valid URL').nullable(),
})

const CompanyForm = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { createCompany } = useCompanies()

  const initialValues: Partial<Company> = {
    name: '',
    registration_number: '',
    industry_sector: '',
    address: '',
    city: '',
    country: 'Ghana',
    website: '',
    description: '',
    employee_count: undefined,
    year_established: undefined,
    logo_url: '',
    user_id: user?.id
  }

  const handleSubmit = async (values: Partial<Company>) => {
    try {
      const result = await createCompany.mutateAsync(values)
      toast.success('Company profile created successfully')
      navigate(`/directory/${result.id}`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to create company profile')
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Company Profile</h1>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Company Name *
                </label>
                <Field
                  type="text"
                  name="name"
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                    errors.name && touched.name ? 'border-red-500' : ''
                  }`}
                />
                {errors.name && touched.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="logo_url" className="block text-sm font-medium text-gray-700">
                  Logo URL
                </label>
                <Field
                  type="text"
                  name="logo_url"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
                {errors.logo_url && touched.logo_url && (
                  <p className="mt-1 text-sm text-red-600">{errors.logo_url}</p>
                )}
              </div>

              <div>
                <label htmlFor="registration_number" className="block text-sm font-medium text-gray-700">
                  Registration Number *
                </label>
                <Field
                  type="text"
                  name="registration_number"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
                {errors.registration_number && touched.registration_number && (
                  <p className="mt-1 text-sm text-red-600">{errors.registration_number}</p>
                )}
              </div>

              <div>
                <label htmlFor="industry_sector" className="block text-sm font-medium text-gray-700">
                  Industry Sector *
                </label>
                <Field
                  type="text"
                  name="industry_sector"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
                {errors.industry_sector && touched.industry_sector && (
                  <p className="mt-1 text-sm text-red-600">{errors.industry_sector}</p>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <Field
                  as="textarea"
                  name="description"
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
                {errors.description && touched.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Address *
                  </label>
                  <Field
                    type="text"
                    name="address"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                  {errors.address && touched.address && (
                    <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                    City *
                  </label>
                  <Field
                    type="text"
                    name="city"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                  {errors.city && touched.city && (
                    <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                    Country *
                  </label>
                  <Field
                    type="text"
                    name="country"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                  {errors.country && touched.country && (
                    <p className="mt-1 text-sm text-red-600">{errors.country}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                    Website
                  </label>
                  <Field
                    type="text"
                    name="website"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                  {errors.website && touched.website && (
                    <p className="mt-1 text-sm text-red-600">{errors.website}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="employee_count" className="block text-sm font-medium text-gray-700">
                    Number of Employees
                  </label>
                  <Field
                    type="number"
                    name="employee_count"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                  {errors.employee_count && touched.employee_count && (
                    <p className="mt-1 text-sm text-red-600">{errors.employee_count}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="year_established" className="block text-sm font-medium text-gray-700">
                    Year Established
                  </label>
                  <Field
                    type="number"
                    name="year_established"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                  {errors.year_established && touched.year_established && (
                    <p className="mt-1 text-sm text-red-600">{errors.year_established}</p>
                  )}
                </div>
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
                  {isSubmitting ? 'Creating...' : 'Create Company'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  )
}

export default CompanyForm