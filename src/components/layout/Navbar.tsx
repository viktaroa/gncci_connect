import { Fragment } from 'react'
import { useAuth } from '../../contexts/AuthContextRenamed'
import { Link } from 'react-router-dom'
import { Menu, Transition } from '@headlessui/react'
import { BellIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import logo from '../../assets/gncci-logo.svg'

interface NavbarProps {
  onMenuClick: () => void
}

const Navbar = ({ onMenuClick }: NavbarProps) => {
  const { user, signOut } = useAuth()

  return (
    <header className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow-sm">
      <button
        type="button"
        className="md:hidden px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
        onClick={onMenuClick}
      >
        <span className="sr-only">Open sidebar</span>
        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      
      <div className="flex-1 px-4 flex justify-between">
        <div className="flex-1 flex items-center">
          <div className="flex items-center md:hidden">
            <img
              className="h-8 w-auto"
              src={logo}
              alt="GNCCI Logo"
            />
            <span className="ml-2 text-lg font-bold text-primary-700">GNCCI Connect</span>
          </div>
          <div className="max-w-2xl w-full">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="search"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Search for members, events, or opportunities..."
              />
            </div>
          </div>
        </div>
        
        <div className="ml-4 flex items-center md:ml-6">
          {/* Notification dropdown */}
          <button
            type="button"
            className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            aria-label="View notifications"
          >
            <BellIcon className="h-6 w-6" aria-hidden="true" />
          </button>

          {/* Profile dropdown */}
          <Menu as="div" className="ml-3 relative">
            <div>
              <Menu.Button 
                className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                aria-label="Open user menu"
              >
                <UserCircleIcon className="h-8 w-8 text-gray-400" aria-hidden="true" />
              </Menu.Button>
            </div>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      to="/profile"
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } block px-4 py-2 text-sm text-gray-700`}
                    >
                      Your Profile
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      to="/settings"
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } block px-4 py-2 text-sm text-gray-700`}
                    >
                      Settings
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={signOut}
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                    >
                      Sign out
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
          
          {user && (
            <span className="ml-3 text-sm font-medium text-gray-700 hidden md:block">
              {user.first_name}
            </span>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar