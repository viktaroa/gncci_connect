import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, type Event } from '../lib/supabase'
import toast from 'react-hot-toast'

export function useEvents() {
  const queryClient = useQueryClient()

  const { data: events, isLoading } = useQuery({
    queryKey: ['events'],
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 2,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_date', { ascending: true })
      
      if (error) throw error
      return data
    }
  })

  const createEvent = useMutation({
    mutationFn: async (event: Partial<Event>) => {
      const { data, error } = await supabase
        .from('events')
        .insert([event])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      toast.success('Event created successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create event')
    }
  })

  const updateEvent = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Event> & { id: string }) => {
      const { data, error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      toast.success('Event updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update event')
    }
  })

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      toast.success('Event deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete event')
    }
  })

  return {
    events,
    isLoading,
    createEvent,
    updateEvent,
    deleteEvent
  }
}