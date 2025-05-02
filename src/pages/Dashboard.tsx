import { useState } from 'react'
import { useAuth } from '../contexts/AuthContextRenamed'
import { motion } from 'framer-motion'
import { 
  UsersIcon, 
  CalendarIcon, 
  BriefcaseIcon, 
  ChartBarIcon 
} from '@heroicons/react/24/outline'

const Dashboard = () => {
  const { user } = useAuth()
  const [isLoading] = useState(false)

  const stats = [
    { 
      name: 'Total Members', 
      value: '2,500+', 
      icon: UsersIcon, 
      change: '+12%',
      changeType: 'increase' 
    },
    { 
      name: 'Upcoming Events', 
      value: '8', 
      icon: CalendarIcon, 
      change: '+3',
      changeType: 'increase'
    },
    { 
      name: 'Business Opportunities', 
      value: '24', 
      icon: BriefcaseIcon, 
      change: '+5',
      changeType: 'increase'
    },
    { 
      name: 'Active Projects', 
      value: '15', 
      icon: ChartBarIcon, 
      change: '+2',
      changeType: 'increase'
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">
          Welcome back, {user?.first_name}!
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative bg-white pt-5 px-4 pb-6 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
          >
            <dt>
              <div className="absolute bg-primary-500 rounded-md p-3">
                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 text-sm font-medium text-gray-500 truncate">
                {item.name}
              </p>
            </dt>
            <dd className="ml-16 flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
              <p
                className={`ml-2 flex items-baseline text-sm font-semibold ${
                  item.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {item.change}
              </p>
            </dd>
          </motion.div>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Recent Activities
            </h2>
            <p className="text-gray-500">No recent activities to display.</p>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Upcoming Events
            </h2>
            <p className="text-gray-500">No upcoming events scheduled.</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard