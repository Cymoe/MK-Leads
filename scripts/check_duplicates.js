import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

async function checkDuplicates() {
  try {
    console.log('Checking for duplicate leads in the database...\n')
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error('You must be logged in to check duplicates')
      return
    }
    
    // Check duplicates by phone number
    const { data: phoneData, error: phoneError } = await supabase
      .from('leads')
      .select('phone, company_name, city, state, service_type')
      .eq('user_id', user.id)
      .not('phone', 'is', null)
      .order('phone')
    
    if (phoneError) {
      console.error('Error fetching leads by phone:', phoneError)
      return
    }
    
    // Find phone duplicates
    const phoneMap = new Map()
    phoneData.forEach(lead => {
      if (!phoneMap.has(lead.phone)) {
        phoneMap.set(lead.phone, [])
      }
      phoneMap.get(lead.phone).push(lead)
    })
    
    const phoneDuplicates = Array.from(phoneMap.entries())
      .filter(([phone, leads]) => leads.length > 1)
    
    console.log(`Found ${phoneDuplicates.length} phone numbers with duplicates:\n`)
    
    // Show first 10 phone duplicates
    phoneDuplicates.slice(0, 10).forEach(([phone, leads]) => {
      console.log(`Phone: ${phone} (${leads.length} duplicates)`)
      leads.forEach(lead => {
        console.log(`  - ${lead.company_name} | ${lead.city}, ${lead.state} | ${lead.service_type}`)
      })
      console.log('')
    })
    
    // Check duplicates by company name (exact match)
    const { data: nameData, error: nameError } = await supabase
      .from('leads')
      .select('company_name, city, state, phone, service_type')
      .eq('user_id', user.id)
      .order('company_name')
    
    if (nameError) {
      console.error('Error fetching leads by name:', nameError)
      return
    }
    
    // Find name duplicates
    const nameMap = new Map()
    nameData.forEach(lead => {
      const key = `${lead.company_name}|${lead.city}|${lead.state}`
      if (!nameMap.has(key)) {
        nameMap.set(key, [])
      }
      nameMap.get(key).push(lead)
    })
    
    const nameDuplicates = Array.from(nameMap.entries())
      .filter(([key, leads]) => leads.length > 1)
    
    console.log(`\nFound ${nameDuplicates.length} company names with duplicates in same city:\n`)
    
    // Show first 10 name duplicates
    nameDuplicates.slice(0, 10).forEach(([key, leads]) => {
      const [name, city, state] = key.split('|')
      console.log(`Company: ${name} in ${city}, ${state} (${leads.length} duplicates)`)
      leads.forEach(lead => {
        console.log(`  - Phone: ${lead.phone || 'N/A'} | Service: ${lead.service_type}`)
      })
      console.log('')
    })
    
    // Summary statistics
    const totalLeads = phoneData.length
    const totalPhoneDuplicates = phoneDuplicates.reduce((sum, [_, leads]) => sum + leads.length - 1, 0)
    const totalNameDuplicates = nameDuplicates.reduce((sum, [_, leads]) => sum + leads.length - 1, 0)
    
    console.log('\n=== SUMMARY ===')
    console.log(`Total leads: ${totalLeads}`)
    console.log(`Duplicate phone numbers: ${phoneDuplicates.length} (${totalPhoneDuplicates} extra records)`)
    console.log(`Duplicate company names in same city: ${nameDuplicates.length} (${totalNameDuplicates} extra records)`)
    console.log(`Estimated total duplicates: ${Math.max(totalPhoneDuplicates, totalNameDuplicates)} records`)
    
    // Check for duplicates by Google Maps URL
    const { data: urlData, error: urlError } = await supabase
      .from('leads')
      .select('google_maps_url, company_name, city, state')
      .eq('user_id', user.id)
      .not('google_maps_url', 'is', null)
      .order('google_maps_url')
    
    if (!urlError) {
      const urlMap = new Map()
      urlData.forEach(lead => {
        if (!urlMap.has(lead.google_maps_url)) {
          urlMap.set(lead.google_maps_url, [])
        }
        urlMap.get(lead.google_maps_url).push(lead)
      })
      
      const urlDuplicates = Array.from(urlMap.entries())
        .filter(([url, leads]) => leads.length > 1)
      
      if (urlDuplicates.length > 0) {
        console.log(`\nDuplicate Google Maps URLs: ${urlDuplicates.length}`)
        urlDuplicates.slice(0, 5).forEach(([url, leads]) => {
          console.log(`\nURL: ${url.substring(0, 50)}...`)
          leads.forEach(lead => {
            console.log(`  - ${lead.company_name} | ${lead.city}, ${lead.state}`)
          })
        })
      }
    }
    
  } catch (error) {
    console.error('Error checking duplicates:', error)
  }
}

// Run the check
checkDuplicates()