import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Loader } from 'lucide-react'
import { supabase } from './lib/supabase'
import MarketCoverage from './pages/MarketCoverage'
import ClaudeChat from './components/ClaudeChat'
import LeadGenDashboard from './components/LeadGenDashboard'
import LeadExport from './components/LeadExport'
import LeadsTable from './components/LeadsTable'
import DatabaseTest from './components/DatabaseTest'
import Navigation from './components/Navigation'
import { ToastContainer } from './components/Toast'
import { useToast, setGlobalToastHandler } from './hooks/useToast'
import Auth from './components/Auth'
import AdminTools from './components/AdminTools'
import TestAiFiltering from './pages/TestAiFiltering'
import DataCleanup from './pages/DataCleanup'
import AIMetrics from './pages/AIMetrics'
import './App.css'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const { toasts, removeToast, toast } = useToast()

  useEffect(() => {
    // Set global toast handler
    setGlobalToastHandler(toast)
    
    // Check for auth callback in URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const errorDescription = hashParams.get('error_description')
    if (errorDescription) {
      console.error('Auth error from URL:', errorDescription)
    }
    
    // Handle OAuth callback and get initial session
    const handleInitialAuth = async () => {
      try {
        // Check if this is an OAuth callback
        const isCallback = window.location.hash.includes('access_token') || 
                          window.location.search.includes('code=')
        
        if (isCallback) {
          console.log('OAuth callback detected, processing...')
          // Let Supabase handle the callback
          const { data, error } = await supabase.auth.getSession()
          if (error) {
            console.error('OAuth callback error:', error)
          } else {
            console.log('OAuth callback successful:', data.session)
          }
          setSession(data.session)
        } else {
          // Normal session check
          const { data: { session }, error } = await supabase.auth.getSession()
          if (error) {
            console.error('Error getting session:', error)
          }
          console.log('Initial session:', session)
          setSession(session)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setLoading(false)
      }
    }
    
    handleInitialAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session)
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-content">
          <Loader size={48} className="loading-spinner" />
          <h2>ReactLeads</h2>
          <p>Initializing your lead generation platform...</p>
        </div>
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
              <LeadGenDashboard session={session} />
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
          <Route path="/test-ai" element={
            <>
              <Navigation session={session} />
              <TestAiFiltering />
            </>
          } />
          <Route path="/cleanup" element={
            <>
              <Navigation session={session} />
              <DataCleanup />
            </>
          } />
          <Route path="/ai-metrics" element={<AIMetrics session={session} />} />
        </Routes>
        <AdminTools />
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    </Router>
  )
}

export default App
