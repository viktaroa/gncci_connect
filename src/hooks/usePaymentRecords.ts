import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, type PaymentRecord } from '../lib/supabase'
import toast from 'react-hot-toast'

export function usePaymentRecords(membershipId?: string) {
  const queryClient = useQueryClient()

  const { data: payments, isLoading } = useQuery({
    queryKey: ['payments', membershipId],
    queryFn: async () => {
      if (!membershipId) throw new Error('Membership ID is required')
      const { data, error } = await supabase
        .from('payment_records')
        .select('*')
        .eq('membership_id', membershipId)
        .order('payment_date', { ascending: false })
      
      if (error) throw error
      return data
    },
    enabled: !!membershipId
  })

  const createPayment = useMutation({
    mutationFn: async (payment: Partial<PaymentRecord>) => {
      const { data, error } = await supabase
        .from('payment_records')
        .insert([payment])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments', membershipId] })
      toast.success('Payment recorded successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to record payment')
    }
  })

  const updatePayment = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PaymentRecord> & { id: string }) => {
      const { data, error } = await supabase
        .from('payment_records')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments', membershipId] })
      toast.success('Payment updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update payment')
    }
  })

  return {
    payments,
    isLoading,
    createPayment,
    updatePayment
  }
}