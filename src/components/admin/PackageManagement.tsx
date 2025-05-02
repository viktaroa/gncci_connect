import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { PlusIcon, PencilIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface MembershipPackage {
  id: string
  name: string
  type: 'sme' | 'corporate' | 'international'
  annual_fee: number
  description: string
  features: string[]
  is_active: boolean
}

const PackageManagement = () => {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingPackage, setEditingPackage] = useState<MembershipPackage | null>(null)

  const { data: packages, isLoading } = useQuery({
    queryKey: ['membership-packages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('membership_packages')
        .select('*')
        .order('annual_fee')

      if (error) throw error
      return data as MembershipPackage[]
    }
  })

  const updatePackage = useMutation({
    mutationFn: async (pkg: Partial<MembershipPackage> & { id: string }) => {
      const { error } = await supabase
        .from('membership_packages')
        .update(pkg)
        .eq('id', pkg.id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membership-packages'] })
      toast.success('Package updated successfully')
      setShowForm(false)
      setEditingPackage(null)
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update package')
    }
  })

  const createPackage = useMutation({
    mutationFn: async (pkg: Omit<MembershipPackage, 'id'>) => {
      const { error } = await supabase
        .from('membership_packages')
        .insert([pkg])

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membership-packages'] })
      toast.success('Package created successfully')
      setShowForm(false)
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create package')
    }
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Membership Packages</h2>
        <button
          onClick={() => {
            setEditingPackage(null)
            setShowForm(true)
          }}
          className="btn btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Package
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages?.map((pkg) => (
          <div
            key={pkg.id}
            className={`bg-white rounded-lg shadow-md overflow-hidden ${
              !pkg.is_active && 'opacity-60'
            }`}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{pkg.name}</h3>
                  <p className="text-sm text-gray-500">{pkg.type.toUpperCase()}</p>
                </div>
                <button
                  onClick={() => {
                    setEditingPackage(pkg)
                    setShowForm(true)
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-2xl font-bold text-gray-900">
                  GHS {pkg.annual_fee.toLocaleString()}
                  <span className="text-sm font-normal text-gray-500">/year</span>
                </p>
              </div>

              <p className="text-gray-600 mb-4">{pkg.description}</p>

              <ul className="space-y-2">
                {pkg.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-600">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() => {
                  updatePackage.mutate({
                    id: pkg.id,
                    is_active: !pkg.is_active
                  })
                }}
                className={`w-full px-4 py-2 text-sm font-medium rounded-md ${
                  pkg.is_active
                    ? 'text-red-600 hover:text-red-700'
                    : 'text-green-600 hover:text-green-700'
                }`}
              >
                {pkg.is_active ? 'Deactivate Package' : 'Activate Package'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Package Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingPackage ? 'Edit Package' : 'Create Package'}
            </h2>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const features = formData.get('features')?.toString().split('\n').filter(Boolean) || []
                
                const packageData = {
                  name: formData.get('name')?.toString() || '',
                  type: formData.get('type')?.toString() as MembershipPackage['type'],
                  annual_fee: parseFloat(formData.get('annual_fee')?.toString() || '0'),
                  description: formData.get('description')?.toString() || '',
                  features,
                  is_active: true
                }

                if (editingPackage) {
                  updatePackage.mutate({ id: editingPackage.id, ...packageData })
                } else {
                  createPackage.mutate(packageData)
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">Package Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={editingPackage?.name}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  name="type"
                  required
                  defaultValue={editingPackage?.type}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                >
                  <option value="sme">SME</option>
                  <option value="corporate">Corporate</option>
                  <option value="international">International</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Annual Fee (GHS)</label>
                <input
                  type="number"
                  name="annual_fee"
                  required
                  min="0"
                  step="0.01"
                  defaultValue={editingPackage?.annual_fee}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  required
                  rows={3}
                  defaultValue={editingPackage?.description}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Features (one per line)
                </label>
                <textarea
                  name="features"
                  required
                  rows={5}
                  defaultValue={editingPackage?.features.join('\n')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingPackage(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                >
                  {editingPackage ? 'Update Package' : 'Create Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default PackageManagement