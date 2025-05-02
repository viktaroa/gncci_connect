import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { format } from 'date-fns'
import { useAuth } from '../../contexts/AuthContextRenamed'
import toast from 'react-hot-toast'
import { PlusIcon } from '@heroicons/react/24/outline'
import EventForm from './EventForm'

interface Event {
  id: string
  title: string
  description: string
  start: string
  end: string
  location: string
  event_type: 'webinar' | 'conference' | 'workshop' | 'networking'
}

const EventsCalendar = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [showEventForm, setShowEventForm] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data: events, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_date', { ascending: true })

      if (error) throw error
      return data.map(event => ({
        ...event,
        start: event.start_date,
        end: event.end_date
      }))
    }
  })

  const registerForEvent = useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase
        .from('event_registrations')
        .insert([{
          event_id: eventId,
          user_id: user?.id,
          status: 'registered'
        }])

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      toast.success('Successfully registered for event!')
      setIsModalOpen(false)
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to register for event')
    }
  })

  const handleEventClick = (info: any) => {
    const event = events?.find(e => e.id === info.event.id)
    if (event) {
      setSelectedEvent(event)
      setIsModalOpen(true)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Events Calendar</h1>
        {user?.role === 'admin' && (
          <button
            onClick={() => setShowEventForm(true)}
            className="btn btn-primary"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Event
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          className="relative z-0"
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={events?.map(event => ({
            id: event.id,
            title: event.title,
            start: event.start,
            end: event.end,
            backgroundColor: 
              event.event_type === 'webinar' ? '#3B82F6' :
              event.event_type === 'conference' ? '#10B981' :
              event.event_type === 'workshop' ? '#F59E0B' :
              '#6366F1'
          }))}
          eventClick={handleEventClick}
          height="auto"
        />
      </div>

      {/* Event Form Modal */}
      {showEventForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <EventForm
              onClose={() => setShowEventForm(false)}
            />
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {isModalOpen && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold text-gray-900">{selectedEvent.title}</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-gray-600">{selectedEvent.description}</p>

              <div className="text-sm text-gray-500">
                <p>
                  <strong>Type:</strong> {selectedEvent.event_type.charAt(0).toUpperCase() + selectedEvent.event_type.slice(1)}
                </p>
                <p>
                  <strong>Location:</strong> {selectedEvent.location}
                </p>
                <p>
                  <strong>Date:</strong> {format(new Date(selectedEvent.start), 'PPP')}
                </p>
                <p>
                  <strong>Time:</strong> {format(new Date(selectedEvent.start), 'p')} - {format(new Date(selectedEvent.end), 'p')}
                </p>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => registerForEvent.mutate(selectedEvent.id)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Register
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EventsCalendar