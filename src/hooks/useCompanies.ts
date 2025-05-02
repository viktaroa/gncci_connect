import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, type Company } from '../lib/supabase'
import toast from 'react-hot-toast'

export const useCompanies = () => {
  const queryClient = useQueryClient()

  const { data: companies, isLoading, error: queryError } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .order('name')
        
        if (error) {
          throw new Error(`Failed to fetch companies: ${error.message}`)
        }
        
        if (!data) {
          throw new Error('No data returned from Supabase')
        }
        
        return data
      } catch (error) {
        throw error
      }
    },
    retry: 3,
    retryDelay: 1000
  })
  
  const createCompany = useMutation({
    mutationFn: async (newCompany: Partial<Company>) => {
      const { data, error } = await supabase
        .from('companies')
        .insert([newCompany])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      toast.success('Company created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })

  const updateCompany = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Company> & { id: string }) => {
      const { data, error } = await supabase
        .from('companies')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      toast.success('Company updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })

  const deleteCompany = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      toast.success('Company deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })

  return {
    companies,
    isLoading,
    error: queryError,
    createCompany,
    updateCompany,
    deleteCompany
  }
}