import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dicscsehiegqsmtwewis.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpY3Njc2VoaWVncXNtdHdld2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1MDg3MTcsImV4cCI6MjA2OTA4NDcxN30.oiSgY_LsqweXzYbThLly6FQueQEqdHhAWxG7gn3s8Sw'

const supabase = createClient(supabaseUrl, supabaseKey)

async function analyzeServiceTypes() {
  try {
    // Get all unique service types from the database
    const { data: serviceTypes, error: error1 } = await supabase
      .from('leads')
      .select('service_type')
      .not('service_type', 'is', null)
    
    if (error1) throw error1
    
    // Count occurrences
    const typeCounts = {}
    serviceTypes.forEach(row => {
      typeCounts[row.service_type] = (typeCounts[row.service_type] || 0) + 1
    })
    
    console.log('Database Service Types:', Object.keys(typeCounts).length, 'unique types found')
    console.log('===========================================')
    Object.entries(typeCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]) => {
        console.log(`${type}: ${count} leads`)
      })
    
    // Get service counts for Naples, FL (showing 100% coverage incorrectly)
    console.log('\n\nNaples, FL Service Breakdown:')
    console.log('===========================================')
    
    const { data: naplesLeads, error: error2 } = await supabase
      .from('leads')
      .select('service_type')
      .eq('city', 'Naples')
      .eq('state', 'FL')
      .not('service_type', 'is', null)
    
    if (error2) throw error2
    
    // Count Naples services
    const naplesServices = {}
    naplesLeads.forEach(row => {
      naplesServices[row.service_type] = (naplesServices[row.service_type] || 0) + 1
    })
    
    Object.entries(naplesServices)
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]) => {
        console.log(`${type}: ${count} leads`)
      })
    
    // Calculate how many unique UI services have leads
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
    
    // Service mapping from UI to database
    const serviceMapping = {
      'Deck Builders': ['Deck builder', 'Deck contractor', 'Deck construction'],
      'Concrete Contractors': ['Concrete contractor', 'Concrete work', 'Concrete company', 'Contractor'],
      'Window & Door': ['Window installation service', 'Door installation', 'Window and door contractor', 'Window installer', 'Window tinting service'],
      'Roofing Contractors': ['Roofing contractor', 'Roofer', 'Roofing company', 'Roof repair'],
      'Tree Services': ['Tree service', 'Tree removal', 'Tree trimming', 'Arborist'],
      'Solar Installers': ['Solar energy contractor', 'Solar panel installation', 'Solar installer'],
      'Fence Contractors': ['Fence contractor', 'Fence installation', 'Fencing company'],
      'Pool Builders': ['Swimming pool contractor', 'Pool cleaning service', 'Pool installation', 'Pool repair'],
      'Turf Installers': ['Landscaper', 'Lawn care service', 'Artificial turf installation', 'Turf supplier', 'Turf installation'],
      'Kitchen Remodeling': ['Kitchen remodeler', 'Kitchen renovation', 'Kitchen contractor'],
      'Bathroom Remodeling': ['Bathroom remodeler', 'Bathroom renovation', 'Bathroom contractor'],
      'Whole Home Remodel': ['General contractor', 'Remodeler', 'Home renovation', 'Construction company', 'General'],
      'Home Addition': ['General contractor', 'Home addition contractor', 'Room addition', 'Construction company'],
      'Exterior Contractors': ['Siding contractor', 'Exterior renovation', 'Exterior remodeling', 'Gutter service'],
      'Hardscape Contractors': ['Landscape designer', 'Hardscaping', 'Patio builder', 'Hardscape contractor', 'Paving contractor'],
      'Landscaping Design': ['Landscaper', 'Landscape designer', 'Landscaping service', 'Landscape architect', 'Landscape lighting designer'],
      'Outdoor Kitchen': ['Outdoor kitchen installation', 'Outdoor kitchen contractor', 'BBQ island builder'],
      'Painting Companies': ['Painter', 'Painting contractor', 'House painter', 'Painting Companies'],
      'Smart Home': ['Smart home installation', 'Home automation', 'Technology installer'],
      'Epoxy Flooring': ['Epoxy flooring contractor', 'Floor coating', 'Garage floor epoxy'],
      'Garage Door Services': ['Garage door installer', 'Garage door repair', 'Overhead door contractor'],
      'Cabinet Makers': ['Cabinet maker', 'Cabinet installer', 'Kitchen cabinet contractor'],
      'Tile & Stone': ['Tile contractor', 'Stone contractor', 'Tile installer'],
      'Paving & Asphalt': ['Paving contractor', 'Asphalt contractor', 'Driveway paving'],
      'Custom Home Builders': ['Custom home builder', 'Home builder', 'Residential builder', 'Construction company'],
      'Flooring Contractors': ['Flooring contractor', 'Floor installation', 'Carpet installer']
    }
    
    // Check which UI services have leads in Naples
    console.log('\n\nNaples UI Service Coverage Analysis:')
    console.log('===========================================')
    
    let coveredUIServices = new Set()
    
    for (const [uiService, dbTypes] of Object.entries(serviceMapping)) {
      // Check if the UI service name itself has leads
      if (naplesServices[uiService]) {
        coveredUIServices.add(uiService)
        console.log(`✓ ${uiService}: ${naplesServices[uiService]} leads (direct match)`)
        continue
      }
      
      // Check mapped database types
      let totalForService = 0
      for (const dbType of dbTypes) {
        if (naplesServices[dbType]) {
          totalForService += naplesServices[dbType]
        }
      }
      
      if (totalForService > 0) {
        coveredUIServices.add(uiService)
        console.log(`✓ ${uiService}: ${totalForService} leads (mapped)`)
      }
    }
    
    // Check for unmapped UI services
    for (const uiService of uiServices) {
      if (!serviceMapping[uiService] && !coveredUIServices.has(uiService)) {
        if (naplesServices[uiService]) {
          coveredUIServices.add(uiService)
          console.log(`✓ ${uiService}: ${naplesServices[uiService]} leads (no mapping needed)`)
        }
      }
    }
    
    console.log(`\n\nTotal UI Services with leads: ${coveredUIServices.size} out of ${uiServices.length}`)
    console.log(`Coverage percentage: ${Math.round((coveredUIServices.size / uiServices.length) * 100)}%`)
    
    // List UI services without leads
    console.log('\n\nUI Services WITHOUT leads in Naples:')
    console.log('===========================================')
    uiServices.forEach(service => {
      if (!coveredUIServices.has(service)) {
        console.log(`✗ ${service}`)
      }
    })
    
    // List database service types that don't map to any UI service
    console.log('\n\nUnmapped Database Service Types in Naples:')
    console.log('===========================================')
    
    const allMappedDbTypes = new Set()
    Object.values(serviceMapping).forEach(types => {
      types.forEach(type => allMappedDbTypes.add(type))
    })
    
    Object.keys(naplesServices).forEach(dbType => {
      if (!allMappedDbTypes.has(dbType) && !uiServices.includes(dbType)) {
        console.log(`? ${dbType}: ${naplesServices[dbType]} leads (not mapped to any UI service)`)
      }
    })
    
  } catch (error) {
    console.error('Error:', error)
  }
}

analyzeServiceTypes()