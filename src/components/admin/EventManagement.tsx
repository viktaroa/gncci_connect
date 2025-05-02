import { useState } from 'react'
import { useEvents } from '../../hooks/useEvents'
import { format } from 'date-fns'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import EventForm from '../../pages/events/EventForm'
import { Event } from '../../lib/supabase'
import toast from 'react-hot-toast'

const EventManagement = () => {
  const { events, isLoading, deleteEvent } = useEvents()
  const [showEventForm, setShowEventForm] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | undefined>(undefined)

  const handleEdit = (event: Event) => {
    setSelectedEvent(event)
    setShowEventForm(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteEvent.mutateAsync(id)
        toast.success('Event deleted successfully')
      } catch (error) {
        toast.error('Failed to delete event')
      }
    }
  }

  const handleCloseForm = () => {
    setShowEventForm(false)
    setSelectedEvent(undefined)
  }

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
        <h2 className="text-xl font-semibold text-gray-900">Event Management</h2>
        <button
          onClick={() => setShowEventForm(true)}
          className="btn btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Event
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Capacity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {events?.map((event) => (
              <tr key={event.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {event.title}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    event.event_type === 'webinar' ? 'bg-blue-100 text-blue-800' :
                    event.event_type === 'conference' ? 'bg-green-100 text-green-800' :
                    event.event_type === 'workshop' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {event.event_type.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(event.start_date), 'PPP')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {event.location}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {event.capacity || 'Unlimited'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(event)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Event Form Modal */}
      {showEventForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <EventForm
              event={selectedEvent}
              onClose={handleCloseForm}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default EventManagement