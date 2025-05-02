import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContextRenamed'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Login from './pages/auth/Login'
import CompanyForm from './pages/directory/CompanyForm'
import Register from './pages/auth/Register'
import MemberDirectory from './pages/directory/MemberDirectory'
import CompanyProfile from './pages/directory/CompanyProfile'
import CompanyProfileEdit from './pages/directory/CompanyProfileEdit'
import MemberProfile from './pages/profile/MemberProfile'
import MembershipDetails from './pages/profile/MembershipDetails'
import MembershipApplication from './pages/membership/MembershipApplication'
import OpportunityForm from './pages/opportunities/OpportunityForm'
import OpportunityDetails from './pages/opportunities/OpportunityDetails'
import EventsCalendar from './pages/events/EventsCalendar'
import BusinessOpportunities from './pages/opportunities/BusinessOpportunities'
import AdminSettings from './pages/admin/AdminSettings'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Loader from './components/ui/Loader'
import NotFound from './pages/NotFound'

function App() {
  const { user, loading } = useAuth()
  const [appLoading, setAppLoading] = useState(true)

  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        setAppLoading(false)
      }, 1000)
    }
  }, [loading])

  if (appLoading || loading) {
    return <Loader />
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
      
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="directory" element={<MemberDirectory />} />
        <Route path="directory/new" element={<CompanyForm />} />
        <Route path="directory/:id" element={<CompanyProfile />} />
        <Route path="directory/:id/edit" element={<CompanyProfileEdit />} />
        <Route path="profile" element={<MemberProfile />} />
        <Route path="membership/:id" element={<MembershipDetails />} />
        <Route path="membership/new" element={<MembershipApplication />} />
        <Route path="events" element={<EventsCalendar />} />
        <Route path="opportunities" element={<BusinessOpportunities />} />
        <Route path="opportunities/new" element={<OpportunityForm />} />
        <Route path="opportunities/:id" element={<OpportunityDetails />} />
        <Route path="opportunities/:id/edit" element={<OpportunityForm />} />
        <Route 
          path="admin/*" 
          element={
            <ProtectedRoute requireAdmin>
              <AdminSettings />
            </ProtectedRoute>
          } 
        />
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App