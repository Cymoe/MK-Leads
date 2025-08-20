import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from the URL
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          navigate('/login?error=' + encodeURIComponent(error.message))
          return
        }

        if (session) {
          console.log('Auth successful, redirecting to dashboard')
          navigate('/')
        } else {
          console.log('No session found, redirecting to login')
          navigate('/login')
        }
      } catch (err) {
        console.error('Unexpected error in auth callback:', err)
        navigate('/login?error=' + encodeURIComponent('Authentication failed'))
      }
    }

    handleAuthCallback()
  }, [navigate])

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh' 
    }}>
      <div>Processing authentication...</div>
    </div>
  )
}

export default AuthCallback