import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export function useMembershipApplications() {
  const queryClient = useQueryClient()

  const { data: applications, isLoading } = useQuery({
    queryKey: ['membership-applications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('membership_applications')
        .select(`
          *,
          company:companies(name),
          reviewed_by_user:users!fk_reviewed_by(email)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    }
  })

interface ApplicationError {
  message: string;
}

interface ApplicationError {
  message: string;
  code?: string;
  details?: unknown;
}

  const updateApplication = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { error } = await supabase
        .from('membership_applications')
        .update({
          status,
          notes,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membership-applications'] })
      toast.success('Application updated successfully')
    },
    onError: (error: ApplicationError) => {
      toast.error(error.message || 'Failed to update application')
    }
  })

  return {
    applications,
    isLoading,
    updateApplication
  }
}