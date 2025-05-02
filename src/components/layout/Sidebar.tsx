import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContextRenamed'
import {
  HomeIcon,
  UserGroupIcon,
  UserIcon,
  CalendarIcon,
  BriefcaseIcon,
  Cog8ToothIcon
} from '@heroicons/react/24/outline'

interface SidebarProps {
  open: boolean
  setOpen: (open: boolean) => void
  mobile: boolean
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Member Directory', href: '/directory', icon: UserGroupIcon },
  { name: 'My Profile', href: '/profile', icon: UserIcon },
  { name: 'Events', href: '/events', icon: CalendarIcon },
  { name: 'Opportunities', href: '/opportunities', icon: BriefcaseIcon },
]

const Sidebar = ({ open, setOpen, mobile }: SidebarProps) => {
  const location = useLocation()
  const { user } = useAuth()
  
  const isAdmin = user?.role === 'admin'
  
  const adminNavigation = [
    { name: 'Settings', href: '/admin/settings', icon: Cog8ToothIcon },
  ]
  
  const allNavigation = isAdmin ? [...navigation, ...adminNavigation] : navigation

  const sidebarContent = (
    <div className="flex flex-col flex-1 h-0 bg-primary-700">
      <div className="flex items-center h-16 flex-shrink-0 px-4 bg-primary-800">
        <img
          className="h-8 w-auto"
          src="/src/assets/gncci-logo.svg"
          alt="GNCCI Logo"
        />
        <span className="ml-2 text-lg font-bold text-white">GNCCI Connect</span>
      </div>
      <div className="flex-1 flex flex-col overflow-y-auto">
        <nav className="flex-1 px-2 py-4 space-y-1">
          {allNavigation.map((item) => {
            const current = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`${
                  current
                    ? 'bg-primary-800 text-white'
                    : 'text-primary-100 hover:bg-primary-600'
                } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
              >
                <item.icon
                  className={`${
                    current ? 'text-primary-300' : 'text-primary-300'
                  } mr-3 flex-shrink-0 h-6 w-6`}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )

  if (mobile) {
    return (
      <Transition.Root show={open} as={React.Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 flex z-40 md:hidden"
          onClose={setOpen}
        >
          <Transition.Child
            as={React.Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </Transition.Child>
          <Transition.Child
            as={React.Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-primary-700">
              <Transition.Child
                as={React.Fragment}
                enter="ease-in-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="absolute top-0 right-0 -mr-12 pt-2">
                  <button
                    type="button"
                    className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    onClick={() => setOpen(false)}
                  >
                    <span className="sr-only">Close sidebar</span>
                    <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </button>
                </div>
              </Transition.Child>
              {sidebarContent}
            </div>
          </Transition.Child>
          <div className="flex-shrink-0 w-14">{/* Force sidebar to shrink to fit close icon */}</div>
        </Dialog>
      </Transition.Root>
    )
  }

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">{sidebarContent}</div>
    </div>
  )
}

export default Sidebar