import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, type Membership, type PaymentRecord } from '../lib/supabase'
import toast from 'react-hot-toast'

export function useMembership(id?: string) {
  const queryClient = useQueryClient()

  const { data: membership, isLoading: isLoadingMembership } = useQuery({
    queryKey: ['membership', id],
    queryFn: async () => {
      if (!id) throw new Error('Membership ID is required')
      const { data, error } = await supabase
        .from('memberships')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data
    },
    enabled: !!id
  })

  const { data: payments, isLoading: isLoadingPayments } = useQuery({
    queryKey: ['payments', id],
    queryFn: async () => {
      if (!id) throw new Error('Membership ID is required')
      const { data, error } = await supabase
        .from('payment_records')
        .select('*')
        .eq('membership_id', id)
        .order('payment_date', { ascending: false })
      
      if (error) throw error
      return data
    },
    enabled: !!id
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
      queryClient.invalidateQueries({ queryKey: ['payments', id] })
      queryClient.invalidateQueries({ queryKey: ['membership', id] })
      toast.success('Payment recorded successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })

  const updateMembership = useMutation({
    mutationFn: async (updates: Partial<Membership>) => {
      if (!id) throw new Error('Membership ID is required')
      const { data, error } = await supabase
        .from('memberships')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membership', id] })
      toast.success('Membership updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })

  return {
    membership,
    payments,
    isLoading: isLoadingMembership || isLoadingPayments,
    createPayment,
    updateMembership
  }
}