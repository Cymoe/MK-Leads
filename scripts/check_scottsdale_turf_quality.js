import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY
)

async function checkScottsdaleTurfQuality() {
  try {
    console.log('Checking quality of Scottsdale Artificial Turf Installation leads...\n')
    
    // Get all Scottsdale turf leads
    const { data: leads, error } = await supabase
      .from('leads')
      .select('*')
      .eq('city', 'Scottsdale')
      .eq('state', 'AZ')
      .eq('service_type', 'Artificial Turf Installation')
      .order('rating', { ascending: false })
    
    if (error) {
      console.error('Error fetching leads:', error)
      return
    }
    
    console.log(`Total Scottsdale Artificial Turf Installation leads: ${leads.length}\n`)
    
    // Categorize leads
    const categories = {
      legitimate: [],
      questionable: [],
      likelyWrong: []
    }
    
    leads.forEach(lead => {
      const name = lead.company_name.toLowerCase()
      const phone = lead.phone || ''
      
      // Check for obvious non-service providers
      if (name.includes('mobile estate') || 
          name.includes('mobile manor') ||
          name.includes('marketplace') ||
          name.includes('village') ||
          name.includes('plaza') ||
          name.includes('equipment') ||
          name.includes('supply') ||
          name.includes('wholesale')) {
        categories.likelyWrong.push(lead)
      }
      // Check for questionable ones
      else if (name.includes('sports') ||
               name.includes('golf') ||
               name.includes('stadium') ||
               name.includes('complex') ||
               !phone) {
        categories.questionable.push(lead)
      }
      // Likely legitimate
      else {
        categories.legitimate.push(lead)
      }
    })
    
    // Display results
    console.log('=== QUALITY ANALYSIS ===\n')
    console.log(`✅ Legitimate Turf Installers: ${categories.legitimate.length} (${Math.round(categories.legitimate.length / leads.length * 100)}%)`)
    console.log(`❓ Questionable: ${categories.questionable.length} (${Math.round(categories.questionable.length / leads.length * 100)}%)`)
    console.log(`❌ Likely Wrong: ${categories.likelyWrong.length} (${Math.round(categories.likelyWrong.length / leads.length * 100)}%)\n`)
    
    // Show examples from each category
    console.log('=== LEGITIMATE TURF INSTALLERS ===')
    categories.legitimate.slice(0, 10).forEach(lead => {
      console.log(`✅ ${lead.company_name}`)
      console.log(`   Phone: ${lead.phone || 'N/A'} | Rating: ${lead.rating || 'N/A'} | Reviews: ${lead.review_count || 0}`)
      if (lead.website) console.log(`   Website: ${lead.website}`)
      console.log('')
    })
    
    if (categories.questionable.length > 0) {
      console.log('\n=== QUESTIONABLE BUSINESSES ===')
      categories.questionable.slice(0, 5).forEach(lead => {
        console.log(`❓ ${lead.company_name}`)
        console.log(`   Phone: ${lead.phone || 'N/A'} | Rating: ${lead.rating || 'N/A'}`)
        console.log('')
      })
    }
    
    if (categories.likelyWrong.length > 0) {
      console.log('\n=== LIKELY NON-SERVICE PROVIDERS ===')
      categories.likelyWrong.forEach(lead => {
        console.log(`❌ ${lead.company_name}`)
        console.log(`   Phone: ${lead.phone || 'N/A'} | Rating: ${lead.rating || 'N/A'}`)
        console.log('')
      })
    }
    
    // Rating analysis
    const withRatings = leads.filter(l => l.rating > 0)
    const avgRating = withRatings.reduce((sum, l) => sum + l.rating, 0) / withRatings.length
    
    console.log('\n=== RATING ANALYSIS ===')
    console.log(`Leads with ratings: ${withRatings.length} (${Math.round(withRatings.length / leads.length * 100)}%)`)
    console.log(`Average rating: ${avgRating.toFixed(2)}`)
    console.log(`5-star businesses: ${leads.filter(l => l.rating === 5).length}`)
    console.log(`4+ star businesses: ${leads.filter(l => l.rating >= 4).length}`)
    
    // Phone number analysis
    const withPhones = leads.filter(l => l.phone)
    console.log('\n=== CONTACT INFO ===')
    console.log(`With phone numbers: ${withPhones.length} (${Math.round(withPhones.length / leads.length * 100)}%)`)
    console.log(`With websites: ${leads.filter(l => l.website).length} (${Math.round(leads.filter(l => l.website).length / leads.length * 100)}%)`)
    
  } catch (error) {
    console.error('Error:', error)
  }
}

// Run the check
checkScottsdaleTurfQuality()