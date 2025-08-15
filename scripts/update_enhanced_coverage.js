import { createClient } from '@supabase/supabase-js'
import { 
  coreUIServices, 
  enhancedServiceMapping, 
  otherHomeServices,
  calculateEnhancedCoverage 
} from '../src/utils/enhancedServiceMapping.js'

const supabaseUrl = 'https://dicscsehiegqsmtwewis.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpY3Njc2VoaWVncXNtdHdld2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1MDg3MTcsImV4cCI6MjA2OTA4NDcxN30.oiSgY_LsqweXzYbThLly6FQueQEqdHhAWxG7gn3s8Sw'

const supabase = createClient(supabaseUrl, supabaseKey)

async function updateEnhancedCoverage() {
  console.log('Updating coverage with enhanced service mapping...')
  console.log('Core UI Services:', coreUIServices.length)
  console.log('Other Service Categories:', Object.keys(otherHomeServices).length)
  console.log('===========================================\n')

  // Get all markets
  const { data: markets, error } = await supabase
    .from('markets')
    .select('id, name, state')
  
  if (error) {
    console.error('Error fetching markets:', error)
    return
  }
  
  console.log(`Found ${markets.length} markets to update\n`)
  
  // Markets with high lead counts that we're particularly interested in
  const specialMarkets = ['Greenwich', 'Newark', 'Naples']
  
  // Update each market
  for (const market of markets) {
    // Get all service types for this city
    const { data: leads, error: leadError } = await supabase
      .from('leads')
      .select('service_type')
      .eq('city', market.name)
      .eq('state', market.state)
      .not('service_type', 'is', null)
    
    if (leadError) {
      console.error(`Error fetching leads for ${market.name}, ${market.state}:`, leadError)
      continue
    }
    
    // Count service types
    const serviceTypes = {}
    leads.forEach(lead => {
      serviceTypes[lead.service_type] = (serviceTypes[lead.service_type] || 0) + 1
    })
    
    // Calculate enhanced coverage
    const coverage = calculateEnhancedCoverage(serviceTypes)
    
    // Log detailed info for special markets
    if (specialMarkets.includes(market.name)) {
      console.log(`\n${market.name}, ${market.state} - Detailed Analysis:`)
      console.log(`- Core Coverage: ${coverage.coreCoverage}% (${coverage.coreServicesCount}/${coverage.totalCoreServices})`)
      console.log(`- Other Home Services: ${coverage.otherServicesCount} categories`)
      console.log(`- Unmapped Services: ${coverage.unmappedServicesCount} unique types`)
      console.log(`- Total Unique Services: ${coverage.totalUniqueServices}`)
      
      if (coverage.unmappedServices.length > 0) {
        console.log('- Sample Unmapped Services:', coverage.unmappedServices.slice(0, 5).join(', '))
      }
    } else {
      console.log(`${market.name}, ${market.state}: ${coverage.coreCoverage}% (${coverage.coreServicesCount}/${coverage.totalCoreServices} core services)`)
    }
    
    // Update market_coverage table with core coverage percentage
    const { error: updateError } = await supabase
      .from('market_coverage')
      .upsert({
        market_id: market.id,
        coverage_percentage: coverage.coreCoverage
      }, {
        onConflict: 'market_id'
      })
    
    if (updateError) {
      console.error(`Error updating coverage for ${market.name}, ${market.state}:`, updateError)
    }
  }
  
  console.log('\n===========================================')
  console.log('Enhanced coverage update complete!')
  
  // Show overall statistics
  const { data: coverageStats } = await supabase
    .from('market_coverage')
    .select('coverage_percentage')
  
  if (coverageStats) {
    const avgCoverage = coverageStats.reduce((sum, item) => sum + item.coverage_percentage, 0) / coverageStats.length
    const maxCoverage = Math.max(...coverageStats.map(item => item.coverage_percentage))
    const minCoverage = Math.min(...coverageStats.map(item => item.coverage_percentage))
    
    console.log('\nOverall Coverage Statistics:')
    console.log(`Average core coverage: ${avgCoverage.toFixed(1)}%`)
    console.log(`Max core coverage: ${maxCoverage}%`)
    console.log(`Min core coverage: ${minCoverage}%`)
  }
}

// Run the update
updateEnhancedCoverage()