import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

interface PaymentGatewaySettings {
  id: string
  provider: string
  public_key: string
  secret_key: string
  webhook_secret: string | null
  test_mode: boolean
}

const PaymentSettings = () => {
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)

  const { data: settings, isLoading } = useQuery({
    queryKey: ['payment-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_gateway_settings')
        .select('*')
        .maybeSingle()

      if (error) throw error
      return data as PaymentGatewaySettings
    }
  })

  const updateSettings = useMutation({
    mutationFn: async (newSettings: Partial<PaymentGatewaySettings>) => {
      const { error } = settings?.id
        ? await supabase
            .from('payment_gateway_settings')
            .update(newSettings)
            .eq('id', settings.id)
        : await supabase
            .from('payment_gateway_settings')
            .insert([newSettings])

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-settings'] })
      toast.success('Payment settings updated successfully')
      setIsEditing(false)
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update payment settings')
    }
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!isEditing && !settings) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">No Payment Settings Configured</h3>
        <p className="mt-2 text-sm text-gray-500">
          Configure your payment gateway settings to start accepting payments.
        </p>
        <button
          onClick={() => setIsEditing(true)}
          className="mt-4 btn btn-primary"
        >
          Configure Payment Gateway
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Payment Gateway Settings</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="btn btn-primary"
          >
            Edit Settings
          </button>
        )}
      </div>

      {isEditing ? (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            updateSettings.mutate({
              provider: 'paystack',
              public_key: formData.get('public_key')?.toString() || '',
              secret_key: formData.get('secret_key')?.toString() || '',
              webhook_secret: formData.get('webhook_secret')?.toString() || '',
              test_mode: formData.get('test_mode') === 'true'
            })
          }}
          className="bg-white rounded-lg shadow-md p-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Paystack Public Key
            </label>
            <input
              type="text"
              name="public_key"
              required
              defaultValue={settings?.public_key}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Paystack Secret Key
            </label>
            <input
              type="password"
              name="secret_key"
              required
              defaultValue={settings?.secret_key}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Webhook Secret
            </label>
            <input
              type="password"
              name="webhook_secret"
              defaultValue={settings?.webhook_secret || ''}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Mode</label>
            <select
              name="test_mode"
              defaultValue={settings?.test_mode ? 'true' : 'false'}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="true">Test Mode</option>
              <option value="false">Live Mode</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              Save Settings
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-500">
              Payment Provider
            </label>
            <p className="mt-1 text-sm text-gray-900">Paystack</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500">
              Public Key
            </label>
            <p className="mt-1 text-sm text-gray-900 font-mono">
              pk_****{settings?.public_key.slice(-6)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500">
              Mode
            </label>
            <p className="mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                settings?.test_mode
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {settings?.test_mode ? 'Test Mode' : 'Live Mode'}
              </span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500">
              Webhook Configuration
            </label>
            <p className="mt-1 text-sm text-gray-900">
              {settings?.webhook_secret ? 'Configured' : 'Not configured'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default PaymentSettings