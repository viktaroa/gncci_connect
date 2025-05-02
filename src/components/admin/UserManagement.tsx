import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import {
  PlusIcon,
  UserIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import CreateUserForm from './CreateUserForm'

interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  phone: string
  role: string
  created_at: string
}

const UserManagement = () => {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as User[]
    }
  })

  const updateUserRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        user_metadata: { role }
      })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User role updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update user role')
    }
  })

  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.auth.admin.deleteUser(userId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete user')
    }
  })

  const filteredUsers = users?.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = !selectedRole || user.role === selectedRole
    return matchesSearch && matchesRole
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <input
              type="search"
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <UserIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <select
            className="pl-4 pr-8 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="member">Member</option>
            <option value="non-member">Non-member</option>
          </select>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn btn-primary flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add User
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers?.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <UserIcon className="h-6 w-6 text-primary-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.first_name} {user.last_name}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={user.role}
                    onChange={(e) => {
                      if (window.confirm(`Are you sure you want to change ${user.first_name}'s role to ${e.target.value}?`)) {
                        updateUserRole.mutate({ userId: user.id, role: e.target.value })
                      }
                    }}
                    className="text-sm rounded-md border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                    <option value="non-member">Non-member</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(user.created_at), 'PP')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        // TODO: Implement edit user modal
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete ${user.first_name}'s account? This action cannot be undone.`)) {
                          deleteUser.mutate(user.id)
                        }
                      }}
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

      {/* Create User Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="max-w-md w-full">
            <CreateUserForm onClose={() => setShowCreateForm(false)} />
          </div>
        </div>
      )}
    </div>
  )
}

export default UserManagement