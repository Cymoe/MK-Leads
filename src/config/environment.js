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
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpY3Njc2VoaWVncXNtdHdld2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1MDg3MTcsImV4cCI6MjA2OTA4NDcxN30.oiSgY_LsqweXzYbThLly6FQueQEqdHhAWxG7gn3s8Sw'
}

// Environment info for debugging
export const environmentInfo = {
  isDevelopment,
  isProduction,
  currentUrl: typeof window !== 'undefined' ? window.location.origin : 'unknown',
  appUrl: getAppUrl()
}
