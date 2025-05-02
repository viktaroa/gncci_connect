import { useQuery } from '@tanstack/react-query'
import { supabase, type Company } from '../lib/supabase'
import { isUUID } from '../utils/validation'
import toast from 'react-hot-toast'

export function useCompany(id?: string) {
  const { data: company, isLoading: isLoadingCompany, error: companyError } = useQuery({
    queryKey: ['company', id],
    staleTime: 5 * 60 * 1000,
    retry: 2,
    queryFn: async () => {
      if (!isUUID(id)) return null
      
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error && error.code === 'PGRST116') return null // Handle "no rows returned" case
      if (error) throw error
      return data
    },
    enabled: !!id && id !== 'new' // Don't run query when id is 'new'
  })

  const { data: membership, isLoading: isLoadingMembership } = useQuery({
    queryKey: ['membership', id],
    queryFn: async () => {
      if (!isUUID(id)) return null
      
      const { data, error } = await supabase
        .from('memberships')
        .select('*')
        .eq('company_id', id)
        .order('created_at', { ascending: false })
        .limit(1)

      if (error) throw error
      return data && data.length > 0 ? data[0] : null
    },
    enabled: !!id && id !== 'new' // Don't run query when id is 'new'
  })

  const updateCompanyProfile = async (updates: Partial<Company>) => {
    try {
      const { error } = await supabase
        .from('companies')
        .update(updates)
        .eq('id', id)

      if (error) throw error
      toast.success('Company profile updated successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update company profile')
      throw error
    }
  }

  return {
    company,
    membership,
    error: companyError,
    isLoading: isLoadingCompany || isLoadingMembership,
    updateCompanyProfile
  }
}