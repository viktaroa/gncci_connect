import React from 'react'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { Tab } from '@headlessui/react'
import EventManagement from '../../components/admin/EventManagement'
import UserManagement from '../../components/admin/UserManagement'
import PackageManagement from '../../components/admin/PackageManagement'
import PaymentSettings from '../../components/admin/PaymentSettings'
import {
  UsersIcon,
  CalendarIcon,
  DocumentCheckIcon,
  ChartBarIcon,
  CheckCircleIcon,
  CreditCardIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const tabs = [
  { name: 'Overview', icon: ChartBarIcon },
  { name: 'Membership Applications', icon: DocumentCheckIcon },
  { name: 'Events', icon: CalendarIcon },
  { name: 'Users', icon: UsersIcon },
  { name: 'Membership Packages', icon: CreditCardIcon },
  { name: 'Payment Settings', icon: CurrencyDollarIcon }
]

const AdminSettings = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const defaultStats: AdminStats = {
        totalMembers: 0,
        activeMembers: 0,
        pendingApplications: 0,
        upcomingEvents: 0,
        memberGrowth: '0.0',
        revenueGrowth: '0.0',
        collectionRate: 0,
        monthlyRevenue: 0,
        totalRegistrations: 0,
        averageAttendance: 0
      }

      try {
        const [
          { count: totalMembers },
          { count: activeMembers },
          { count: pendingApplications },
          { count: upcomingEvents },
          { data: metrics }
        ] = await Promise.all([
          supabase.from('companies').select('*', { count: 'exact' }),
          supabase.from('memberships').select('*', { count: 'exact' }).eq('status', 'active'),
          supabase.from('membership_applications').select('*', { count: 'exact' }).eq('status', 'pending'),
          supabase.from('events').select('*', { count: 'exact' }).gte('start_date', new Date().toISOString()),
          supabase.from('metric_snapshots').select('*').order('snapshot_date', { ascending: false }).limit(2)
        ])

        // Ensure we have valid numbers for calculations
        const totalMembersCount = totalMembers ?? 0
        const activeMembersCount = activeMembers ?? 0
        const pendingApplicationsCount = pendingApplications ?? 0
        const upcomingEventsCount = upcomingEvents ?? 0

        const [current, previous] = metrics || []
        const memberGrowth = previous?.total_members
          ? ((totalMembersCount - (previous.total_members || 0)) / (previous.total_members || 1) * 100).toFixed(1)
          : '0.0'

        const revenueGrowth = previous?.total_revenue
          ? ((current?.total_revenue || 0 - previous.total_revenue) / previous.total_revenue * 100).toFixed(1)
          : '0.0'

        return {
          totalMembers: totalMembersCount,
          activeMembers: activeMembersCount,
          pendingApplications: pendingApplicationsCount,
          upcomingEvents: upcomingEventsCount,
          memberGrowth,
          revenueGrowth,
          collectionRate: 85,
          monthlyRevenue: 0,
          totalRegistrations: 0,
          averageAttendance: 0
        }
      } catch (error) {
        console.error('Error fetching admin stats:', error) 
        return defaultStats
      }
    },
    retry: 2
  })
  
  const queryClient = useQueryClient()
  const [selectedTab, setSelectedTab] = useState(0)

  // Fetch membership applications
  const { data: applications, isLoading: isLoadingApplications } = useQuery({
    queryKey: ['membership-applications'],
    queryFn: async () => {
      // First fetch the applications
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('membership_applications')
        .select(`
          *,
          company:companies(name)
        `)
        .order('created_at', { ascending: false })

      if (applicationsError) throw applicationsError

      // Then fetch the reviewers for applications that have been reviewed
      const reviewerIds = applicationsData
        .filter(app => app.reviewed_by)
        .map(app => app.reviewed_by)

      if (reviewerIds.length > 0) {
        const { data: reviewers, error: reviewersError } = await supabase
          .from('users')
          .select('id, email')
          .in('id', reviewerIds)

        if (reviewersError) throw reviewersError

        // Combine the data
        return applicationsData.map(application => ({
          ...application,
          reviewed_by_user: reviewers?.find(user => user.id === application.reviewed_by)
        }))
      }

      return applicationsData
    }
  })

  // Handle application approval/rejection
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
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update application')
    }
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  const renderApplications = () => {
    if (isLoadingApplications) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      )
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Applied
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {applications?.map((application) => (
              <tr key={application.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {application.company?.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {application.membership_type.toUpperCase()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    application.status === 'approved' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {application.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(application.created_at), 'PPP')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {application.status === 'pending' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => updateApplication.mutate({
                          id: application.id,
                          status: 'approved'
                        })}
                        className="text-green-600 hover:text-green-900"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updateApplication.mutate({
                          id: application.id,
                          status: 'rejected'
                        })}
                        className="text-red-600 hover:text-red-900"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-primary-50 rounded-xl">
                <UsersIcon className="h-6 w-6 text-primary-600" />
              </div>
              <span className="text-sm font-medium text-gray-400">Total Members</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats?.totalMembers}</p>
            <div className="mt-2 flex items-center text-sm text-green-600">
              <span className="font-medium">+{stats?.memberGrowth}%</span>
              <span className="ml-1">from last month</span>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-50 rounded-xl">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-400">Active Members</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats?.activeMembers}</p>
            <div className="mt-2 flex items-center text-sm text-green-600">
              <span className="font-medium">+5%</span>
              <span className="ml-1">from last month</span>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-50 rounded-xl">
                <DocumentCheckIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <span className="text-sm font-medium text-gray-400">Pending Applications</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats?.pendingApplications}</p>
            <div className="mt-2 flex items-center text-sm text-yellow-600">
              <span className="font-medium">+3</span>
              <span className="ml-1">new this week</span>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <CalendarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-400">Upcoming Events</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats?.upcomingEvents}</p>
            <div className="mt-2 flex items-center text-sm text-blue-600">
              <span className="font-medium">Next event</span>
              <span className="ml-1">in 3 days</span>
            </div>
          </div>
        </div>

        <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
          <Tab.List className="flex space-x-2 mb-6">
            {tabs.map((tab) => (
              <Tab
                key={tab.name}
                className={({ selected }) =>
                  `px-6 py-3 rounded-xl text-sm font-medium leading-5 flex items-center transition-all
                   ${selected
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25'
                    : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.name}
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels>
            <Tab.Panel>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Membership Growth</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <dl className="grid grid-cols-2 gap-4">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Total Members</dt>
                          <dd className="mt-1 text-2xl font-semibold text-gray-900">{stats?.totalMembers}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Active Members</dt>
                          <dd className="mt-1 text-2xl font-semibold text-gray-900">{stats?.activeMembers}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Pending Applications</dt>
                          <dd className="mt-1 text-2xl font-semibold text-gray-900">{stats?.pendingApplications}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Growth Rate</dt>
                          <dd className="mt-1 text-2xl font-semibold text-green-600">+12%</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Statistics</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <dl className="grid grid-cols-2 gap-4">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Upcoming Events</dt>
                          <dd className="mt-1 text-2xl font-semibold text-gray-900">{stats?.upcomingEvents}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Total Registrations</dt>
                          <dd className="mt-1 text-2xl font-semibold text-gray-900">{stats?.totalRegistrations}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Average Attendance</dt>
                          <dd className="mt-1 text-2xl font-semibold text-gray-900">{stats?.averageAttendance}%</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Event Growth</dt>
                          <dd className="mt-1 text-2xl font-semibold text-green-600">+5%</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Opportunities</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <dl className="grid grid-cols-2 gap-4">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Active Opportunities</dt>
                          <dd className="mt-1 text-2xl font-semibold text-gray-900">24</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Total Applications</dt>
                          <dd className="mt-1 text-2xl font-semibold text-gray-900">89</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Success Rate</dt>
                          <dd className="mt-1 text-2xl font-semibold text-gray-900">42%</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Monthly Growth</dt>
                          <dd className="mt-1 text-2xl font-semibold text-green-600">+15%</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Overview</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <dl className="grid grid-cols-2 gap-4">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Total Revenue</dt>
                          <dd className="mt-1 text-2xl font-semibold text-gray-900">
                            GHS {(stats?.monthlyRevenue || 0).toLocaleString()}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Outstanding</dt>
                          <dd className="mt-1 text-2xl font-semibold text-gray-900">GHS 15,000</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Collection Rate</dt>
                          <dd className="mt-1 text-2xl font-semibold text-gray-900">{stats?.collectionRate}%</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Monthly Growth</dt>
                          <dd className="mt-1 text-2xl font-semibold text-green-600">+{stats?.revenueGrowth}%</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </Tab.Panel>
            <Tab.Panel>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Membership Applications</h2>
                </div>
                {renderApplications()}
              </div>
            </Tab.Panel>
            <Tab.Panel>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Event Management</h2>
                <EventManagement />
              </div>
            </Tab.Panel>
            <Tab.Panel>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">User Management</h2>
                <UserManagement />
              </div>
            </Tab.Panel>
            <Tab.Panel>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <PackageManagement />
              </div>
            </Tab.Panel>
            <Tab.Panel>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <PaymentSettings />
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </motion.div>
    </div>
  )
}

export default AdminSettings