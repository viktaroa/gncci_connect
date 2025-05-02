import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import { motion } from 'framer-motion'

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Sidebar for mobile */}
      <Sidebar 
        open={sidebarOpen} 
        setOpen={setSidebarOpen} 
        mobile={true} 
      />
      
      {/* Static sidebar for desktop */}
      <Sidebar 
        open={true} 
        setOpen={() => {}} 
        mobile={false} 
      />
      
      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <motion.div 
            className="py-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  )
}

export default Layout