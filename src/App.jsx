import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { supabase } from './lib/supabase'
import MarketCoverage from './pages/MarketCoverage'
import ClaudeChat from './components/ClaudeChat'
import LeadGenDashboard from './components/LeadGenDashboard'
import LeadExport from './components/LeadExport'
import LeadsTable from './components/LeadsTable'
import DatabaseTest from './components/DatabaseTest'
import Navigation from './components/Navigation'

import Auth from './components/Auth'
import AdminTools from './components/AdminTools'
import './App.css'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="app-loading">
        <h2>Loading...</h2>
      </div>
    )
  }

  if (!session) {
    return <Auth />
  }

  return (
    <Router>
      <div className="app">
        <Routes>
          {/* MarketCoverage has special layout with integrated navigation */}
          <Route path="/" element={<MarketCoverage session={session} />} />
          
          {/* Other pages use standard layout with top navigation */}
          <Route path="/claude" element={
            <>
              <Navigation session={session} />
              <ClaudeChat />
            </>
          } />
          <Route path="/dashboard" element={
            <>
              <Navigation session={session} />
              <LeadGenDashboard />
            </>
          } />
          <Route path="/leads" element={
            <>
              <Navigation session={session} />
              <LeadsTable />
            </>
          } />
          <Route path="/export" element={
            <>
              <Navigation session={session} />
              <LeadExport />
            </>
          } />
          <Route path="/test" element={
            <>
              <Navigation session={session} />
              <DatabaseTest />
            </>
          } />
        </Routes>
        <AdminTools />
      </div>
    </Router>
  )
}

export default App
