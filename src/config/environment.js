
// Environment configuration for different deployment environments

const isDevelopment = import.meta.env.DEV
const isProduction = import.meta.env.PROD

// Get the current app URL based on environment
export const getAppUrl = () => {
  // In development, use localhost
  if (isDevelopment) {
    return 'http://localhost:5173'
  }
  
  // In production, use the actual domain
  if (isProduction) {
    // Check if we have a custom production URL set
    const productionUrl = import.meta.env.VITE_PRODUCTION_URL
    if (productionUrl) {
      return productionUrl
    }
    
    // Fallback to window.location.origin for production
    // This will work for Vercel and other hosting platforms
    return window.location.origin
  }
  
  // Default fallback
  return window.location.origin
}

// Supabase configuration
export const supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL || 'https://dicscsehiegqsmtwewis.supabase.co',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
}

// Environment info for debugging
export const environmentInfo = {
  isDevelopment,
  isProduction,
  currentUrl: typeof window !== 'undefined' ? window.location.origin : 'unknown',
  appUrl: getAppUrl()
}
