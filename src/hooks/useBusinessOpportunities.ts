import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, type BusinessOpportunity } from '../lib/supabase'
import toast from 'react-hot-toast'

export function useBusinessOpportunities() {
  const queryClient = useQueryClient()

  const { data: opportunities, isLoading } = useQuery({
    queryKey: ['opportunities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_opportunities')
        .select('*, companies(*)')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    }
  })

  const createOpportunity = useMutation({
    mutationFn: async (opportunity: Partial<BusinessOpportunity>) => {
      const { data, error } = await supabase
        .from('business_opportunities')
        .insert([opportunity])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] })
      toast.success('Business opportunity created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })

  const updateOpportunity = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<BusinessOpportunity> & { id: string }) => {
      const { data, error } = await supabase
        .from('business_opportunities')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] })
      toast.success('Business opportunity updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })

  const deleteOpportunity = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('business_opportunities')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] })
      toast.success('Business opportunity deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })

  return {
    opportunities,
    isLoading,
    createOpportunity,
    updateOpportunity,
    deleteOpportunity
  }
}