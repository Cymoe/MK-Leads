import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { getAppUrl } from '../config/environment'
import { Loader } from 'lucide-react'
import './Auth.css'

function Auth() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [oauthUrl, setOauthUrl] = useState('')

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('Initiating Google OAuth...')
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          },
          redirectTo: getAppUrl(),
          skipBrowserRedirect: true,
          flowType: 'pkce'
        }
      })
      
      if (error) {
        console.error('OAuth initiation error:', error)
        throw error
      }
      
      console.log('OAuth URL generated:', data.url)
      if (data?.url) {
        setOauthUrl(data.url)
        // Use robust navigation for desktop browsers
        try { window.location.assign(data.url) } catch (_) {}
        // Fallbacks in case navigation is blocked
        setTimeout(() => { try { window.location.href = data.url } catch (_) {} }, 150)
        setTimeout(() => { try { window.open(data.url, '_self') } catch (_) {} }, 400)
      }
      
    } catch (error) {
      console.error('Google Sign In error:', error)
      setError(`Authentication failed: ${error.message}`)
      setLoading(false)
    }
  }



  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome to ReactLeads</h2>
        <p className="auth-subtitle">
          Sign in with your Google account to get started
        </p>

        {/* Google Sign In Button */}
        <button 
          type="button"
          onClick={handleGoogleSignIn}
          className="btn btn-google"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader size={18} className="spinner" />
              Signing in...
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M17.64 9.20454C17.64 8.56636 17.5827 7.95272 17.4764 7.36363H9V10.845H13.8436C13.635 11.97 13.0009 12.9231 12.0477 13.5613V15.8195H14.9564C16.6582 14.2527 17.64 11.9454 17.64 9.20454Z" fill="#4285F4"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5613C11.2418 14.1013 10.2109 14.4204 9 14.4204C6.65591 14.4204 4.67182 12.8372 3.96409 10.71H0.957275V13.0418C2.43818 15.9831 5.48182 18 9 18Z" fill="#34A853"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957273C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957273 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </>
          )}
        </button>

        {oauthUrl && (
          <div style={{ marginTop: '12px' }}>
            <a href={oauthUrl} style={{ color: '#60a5fa', textDecoration: 'underline' }}>
              If nothing happens, click here to continue to Google
            </a>
          </div>
        )}

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}



        <div className="auth-info">
          <p>By signing in, you agree to use ReactLeads for lead generation and business development.</p>
        </div>
      </div>
    </div>
  )
}

export default Auth