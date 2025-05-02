import React from 'react'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { useEvents } from '../../hooks/useEvents'
import { Event } from '../../lib/supabase'

const validationSchema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  description: Yup.string().required('Description is required'),
  location: Yup.string().required('Location is required'),
  start_date: Yup.date().required('Start date is required'),
  end_date: Yup.date()
    .required('End date is required')
    .min(Yup.ref('start_date'), 'End date must be after start date'),
  event_type: Yup.string()
    .oneOf(['webinar', 'conference', 'workshop', 'networking'])
    .required('Event type is required'),
  registration_link: Yup.string().url('Must be a valid URL'),
  image_url: Yup.string().url('Must be a valid URL'),
  capacity: Yup.number().positive('Must be a positive number').nullable()
})

interface EventFormProps {
  event?: Event
  onClose: () => void
}

const EventForm: React.FC<EventFormProps> = ({ event, onClose }) => {
  const { createEvent, updateEvent } = useEvents()

  const initialValues = event || {
    title: '',
    description: '',
    location: '',
    start_date: '',
    end_date: '',
    event_type: 'webinar',
    registration_link: '',
    image_url: '',
    capacity: null
  }

  const handleSubmit = async (values: typeof initialValues) => {
    try {
      if (event) {
        // When updating, only send the changed fields
        const updatedFields: Partial<Event> & { id: string } = {
          id: event.id,
          title: values.title,
          description: values.description,
          location: values.location,
          event_type: values.event_type,
          registration_link: values.registration_link,
          image_url: values.image_url,
          capacity: values.capacity === null ? undefined : values.capacity,
          start_date: new Date(values.start_date).toISOString(),
          end_date: new Date(values.end_date).toISOString()
        }
        await updateEvent.mutateAsync(updatedFields)
      } else {
        // When creating, format all fields
        const formattedValues = {
          ...values,
          capacity: values.capacity === null ? undefined : values.capacity,
          start_date: new Date(values.start_date).toISOString(),
          end_date: new Date(values.end_date).toISOString()
        }
        await createEvent.mutateAsync(formattedValues)
      }
      onClose()
    } catch (error) {
      console.error('Failed to save event:', error)
    }
  }

  return (
    <div className="bg-white rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">
        {event ? 'Edit Event' : 'Create New Event'}
      </h2>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, isSubmitting }) => (
          <Form className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <Field
                type="text"
                name="title"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
              {errors.title && touched.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <Field
                as="textarea"
                name="description"
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
              {errors.description && touched.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            <div>
              <label htmlFor="event_type" className="block text-sm font-medium text-gray-700">
                Event Type
              </label>
              <Field
                as="select"
                name="event_type"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="webinar">Webinar</option>
                <option value="conference">Conference</option>
                <option value="workshop">Workshop</option>
                <option value="networking">Networking</option>
              </Field>
              {errors.event_type && touched.event_type && (
                <p className="mt-1 text-sm text-red-600">{errors.event_type}</p>
              )}
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <Field
                type="text"
                name="location"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
              {errors.location && touched.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
                  Start Date & Time
                </label>
                <Field
                  type="datetime-local"
                  name="start_date"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
                {errors.start_date && touched.start_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>
                )}
              </div>

              <div>
                <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
                  End Date & Time
                </label>
                <Field
                  type="datetime-local"
                  name="end_date"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
                {errors.end_date && touched.end_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="registration_link" className="block text-sm font-medium text-gray-700">
                Registration Link (Optional)
              </label>
              <Field
                type="url"
                name="registration_link"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
              {errors.registration_link && touched.registration_link && (
                <p className="mt-1 text-sm text-red-600">{errors.registration_link}</p>
              )}
            </div>

            <div>
              <label htmlFor="image_url" className="block text-sm font-medium text-gray-700">
                Image URL (Optional)
              </label>
              <Field
                type="url"
                name="image_url"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
              {errors.image_url && touched.image_url && (
                <p className="mt-1 text-sm text-red-600">{errors.image_url}</p>
              )}
            </div>

            <div>
              <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
                Capacity (Optional)
              </label>
              <Field
                type="number"
                name="capacity"
                min="1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
              {errors.capacity && touched.capacity && (
                <p className="mt-1 text-sm text-red-600">{errors.capacity}</p>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  )
}

export default EventForm