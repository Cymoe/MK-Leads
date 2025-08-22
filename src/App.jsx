import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Loader } from 'lucide-react'
import { supabase } from './lib/supabase'
import MarketCoverage from './pages/MarketCoverage'
import LeadGenDashboard from './components/LeadGenDashboard'
import LeadExport from './components/LeadExport'
import LeadsTable from './components/LeadsTable'
import DatabaseTest from './components/DatabaseTest'
import Navigation from './components/Navigation'
import { ToastContainer } from './components/Toast'
import { useToast, setGlobalToastHandler } from './hooks/useToast'
import Auth from './components/Auth'
import TestAiFiltering from './pages/TestAiFiltering'
import DataCleanup from './pages/DataCleanup'
import AIMetrics from './pages/AIMetrics'
import MarketIntelligence from './pages/MarketIntelligence'
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
                          window.location.search.includes('code=') ||
                          window.location.search.includes('access_token=')
        
        if (isCallback) {
          console.log('OAuth callback detected, processing...')
          const url = new URL(window.location.href)
          const code = url.searchParams.get('code')
          const error = url.searchParams.get('error_description')

          if (error) {
            console.error('OAuth error returned:', error)
          }

          let currentSession = null
          try {
            if (code) {
              // Complete PKCE flow on desktop
              const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession({ code })
              if (exchangeError) {
                console.error('exchangeCodeForSession error:', exchangeError)
              } else {
                currentSession = data.session
              }
            } else {
              // Implicit flow (hash access_token)
              const { data, error: getErr } = await supabase.auth.getSession()
              if (getErr) {
                console.error('getSession after implicit callback error:', getErr)
              } else {
                currentSession = data.session
              }
            }
          } finally {
            // Clean up URL
            window.history.replaceState({}, document.title, url.origin + url.pathname)
          }
          setSession(currentSession)
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
          <Route path="/market-intelligence" element={<MarketIntelligence session={session} />} />
        </Routes>
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    </Router>
  )
}

export default App
