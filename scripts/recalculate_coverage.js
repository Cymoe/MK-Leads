import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dicscsehiegqsmtwewis.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpY3Njc2VoaWVncXNtdHdld2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1MDg3MTcsImV4cCI6MjA2OTA4NDcxN30.oiSgY_LsqweXzYbThLly6FQueQEqdHhAWxG7gn3s8Sw'

const supabase = createClient(supabaseUrl, supabaseKey)

// Complete list of UI services (34 total)
const uiServices = [
  'Deck Builders', 'Concrete Contractors', 'Window & Door', 'Roofing Contractors',
  'Tree Services', 'Solar Installers', 'Fence Contractors', 'Pool Builders',
  'Turf Installers', 'Kitchen Remodeling', 'Bathroom Remodeling', 'Whole Home Remodel',
  'Home Addition', 'Exterior Contractors', 'Hardscape Contractors', 'Landscaping Design',
  'Outdoor Kitchen', 'Painting Companies', 'Smart Home', 'Epoxy Flooring',
  'Garage Door Services', 'Cabinet Makers', 'Tile & Stone', 'Paving & Asphalt',
  'Custom Home Builders', 'Flooring Contractors', 'EV Charging Installation',
  'Artificial Turf Installation', 'Smart Home Installation', 'Outdoor Living Structures',
  'Custom Lighting Design', 'Water Features Installation', 'Outdoor Kitchen Installation',
  'Palapa/Tropical Structures'
]

// Service mapping from UI to database - expanded to catch more variations
const serviceMapping = {
  'Deck Builders': ['Deck builder', 'Deck contractor', 'Deck construction'],
  'Concrete Contractors': ['Concrete contractor', 'Concrete work', 'Concrete company', 'Contractor'],
  'Window & Door': ['Window installation service', 'Door installation', 'Window and door contractor', 'Window installer', 'Window tinting service'],
  'Roofing Contractors': ['Roofing contractor', 'Roofer', 'Roofing company', 'Roof repair'],
  'Tree Services': ['Tree service', 'Tree removal', 'Tree trimming', 'Arborist'],
  'Solar Installers': ['Solar energy contractor', 'Solar panel installation', 'Solar installer', 'Solar energy company'],
  'Fence Contractors': ['Fence contractor', 'Fence installation', 'Fencing company'],
  'Pool Builders': ['Swimming pool contractor', 'Pool cleaning service', 'Pool installation', 'Pool repair', 'Swimming pool repair service'],
  'Turf Installers': ['Landscaper', 'Lawn care service', 'Artificial turf installation', 'Turf supplier', 'Turf installation'],
  'Kitchen Remodeling': ['Kitchen remodeler', 'Kitchen renovation', 'Kitchen contractor'],
  'Bathroom Remodeling': ['Bathroom remodeler', 'Bathroom renovation', 'Bathroom contractor'],
  'Whole Home Remodel': ['General contractor', 'Remodeler', 'Home renovation', 'Construction company', 'General'],
  'Home Addition': ['General contractor', 'Home addition contractor', 'Room addition', 'Construction company'],
  'Exterior Contractors': ['Siding contractor', 'Exterior renovation', 'Exterior remodeling', 'Gutter service', 'Gutter cleaning service'],
  'Hardscape Contractors': ['Landscape designer', 'Hardscaping', 'Patio builder', 'Hardscape contractor', 'Paving contractor'],
  'Landscaping Design': ['Landscaper', 'Landscape designer', 'Landscaping service', 'Landscape architect', 'Landscape lighting designer'],
  'Outdoor Kitchen': ['Outdoor kitchen installation', 'Outdoor kitchen contractor', 'BBQ island builder'],
  'Painting Companies': ['Painter', 'Painting contractor', 'House painter', 'Painting Companies', 'Painting'],
  'Smart Home': ['Smart home installation', 'Home automation', 'Technology installer', 'Home automation company'],
  'Epoxy Flooring': ['Epoxy flooring contractor', 'Floor coating', 'Garage floor epoxy'],
  'Garage Door Services': ['Garage door installer', 'Garage door repair', 'Overhead door contractor'],
  'Cabinet Makers': ['Cabinet maker', 'Cabinet installer', 'Kitchen cabinet contractor'],
  'Tile & Stone': ['Tile contractor', 'Stone contractor', 'Tile installer'],
  'Paving & Asphalt': ['Paving contractor', 'Asphalt contractor', 'Driveway paving'],
  'Custom Home Builders': ['Custom home builder', 'Home builder', 'Residential builder', 'Construction company'],
  'Flooring Contractors': ['Flooring contractor', 'Floor installation', 'Carpet installer'],
  'Outdoor Living Structures': ['Carport and pergola builder', 'Pergola builder', 'Gazebo builder']
}

async function calculateCoverage(city, state) {
  // Get all service types for this city
  const { data: leads, error } = await supabase
    .from('leads')
    .select('service_type')
    .eq('city', city)
    .eq('state', state)
    .not('service_type', 'is', null)
  
  if (error) {
    console.error(`Error fetching leads for ${city}, ${state}:`, error)
    return 0
  }
  
  // Count service types
  const serviceTypes = {}
  leads.forEach(lead => {
    serviceTypes[lead.service_type] = (serviceTypes[lead.service_type] || 0) + 1
  })
  
  // Check which UI services have leads
  const coveredUIServices = new Set()
  
  for (const [uiService, dbTypes] of Object.entries(serviceMapping)) {
    // Check if the UI service name itself has leads
    if (serviceTypes[uiService]) {
      coveredUIServices.add(uiService)
      continue
    }
    
    // Check mapped database types
    let hasLeads = false
    for (const dbType of dbTypes) {
      if (serviceTypes[dbType]) {
        hasLeads = true
        break
      }
    }
    
    if (hasLeads) {
      coveredUIServices.add(uiService)
    }
  }
  
  // Check for unmapped UI services (services without explicit mapping)
  for (const uiService of uiServices) {
    if (!serviceMapping[uiService] && !coveredUIServices.has(uiService)) {
      if (serviceTypes[uiService]) {
        coveredUIServices.add(uiService)
      }
    }
  }
  
  // Calculate coverage percentage
  const coverage = Math.round((coveredUIServices.size / uiServices.length) * 100)
  
  return { coverage, coveredCount: coveredUIServices.size, totalCount: uiServices.length }
}

async function updateAllCoverages() {
  console.log('Recalculating coverage for all markets...')
  console.log('Total UI Services:', uiServices.length)
  console.log('===========================================\n')
  
  // Get all unique city/state combinations
  const { data: markets, error } = await supabase
    .from('markets')
    .select('id, name, state')
  
  if (error) {
    console.error('Error fetching markets:', error)
    return
  }
  
  console.log(`Found ${markets.length} markets to update\n`)
  
  // Update each market
  for (const market of markets) {
    const { coverage, coveredCount, totalCount } = await calculateCoverage(market.name, market.state)
    
    console.log(`${market.name}, ${market.state}: ${coverage}% (${coveredCount}/${totalCount} services)`)
    
    // Update market_coverage table
    const { error: updateError } = await supabase
      .from('market_coverage')
      .upsert({
        city: market.name,
        state: market.state,
        coverage_percentage: coverage
      }, {
        onConflict: 'city,state'
      })
    
    if (updateError) {
      console.error(`Error updating coverage for ${market.name}, ${market.state}:`, updateError)
    }
  }
  
  console.log('\nCoverage recalculation complete!')
  
  // Show some statistics
  const { data: coverageStats } = await supabase
    .from('market_coverage')
    .select('coverage_percentage')
  
  if (coverageStats) {
    const avgCoverage = coverageStats.reduce((sum, item) => sum + item.coverage_percentage, 0) / coverageStats.length
    const maxCoverage = Math.max(...coverageStats.map(item => item.coverage_percentage))
    const minCoverage = Math.min(...coverageStats.map(item => item.coverage_percentage))
    
    console.log('\nCoverage Statistics:')
    console.log(`Average coverage: ${avgCoverage.toFixed(1)}%`)
    console.log(`Max coverage: ${maxCoverage}%`)
    console.log(`Min coverage: ${minCoverage}%`)
  }
}

updateAllCoverages()