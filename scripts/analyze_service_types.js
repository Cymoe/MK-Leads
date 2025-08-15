import pg from 'pg'

const connectionString = 'postgresql://postgres.dicscsehiegqsmtwewis:ReactLeadsPassword01@aws-0-us-east-1.pooler.supabase.com:6543/postgres'

const client = new pg.Client({ connectionString })

async function analyzeServiceTypes() {
  try {
    await client.connect()
    
    // Get all unique service types from the database
    const { rows: serviceTypes } = await client.query(`
      SELECT DISTINCT service_type, COUNT(*) as lead_count
      FROM leads
      WHERE service_type IS NOT NULL
      GROUP BY service_type
      ORDER BY lead_count DESC
    `)
    
    console.log('Database Service Types:', serviceTypes.length, 'unique types found')
    console.log('===========================================')
    serviceTypes.forEach(row => {
      console.log(`${row.service_type}: ${row.lead_count} leads`)
    })
    
    // Get service counts for Naples, FL (showing 100% coverage incorrectly)
    console.log('\n\nNaples, FL Service Breakdown:')
    console.log('===========================================')
    
    const { rows: naplesServices } = await client.query(`
      SELECT service_type, COUNT(*) as count
      FROM leads
      WHERE city = 'Naples' AND state = 'FL' AND service_type IS NOT NULL
      GROUP BY service_type
      ORDER BY count DESC
    `)
    
    naplesServices.forEach(row => {
      console.log(`${row.service_type}: ${row.count} leads`)
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
      const directMatch = naplesServices.find(s => s.service_type === uiService)
      if (directMatch) {
        coveredUIServices.add(uiService)
        console.log(`✓ ${uiService}: ${directMatch.count} leads (direct match)`)
        continue
      }
      
      // Check mapped database types
      let totalForService = 0
      for (const dbType of dbTypes) {
        const match = naplesServices.find(s => s.service_type === dbType)
        if (match) {
          totalForService += parseInt(match.count)
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
        const directMatch = naplesServices.find(s => s.service_type === uiService)
        if (directMatch) {
          coveredUIServices.add(uiService)
          console.log(`✓ ${uiService}: ${directMatch.count} leads (no mapping needed)`)
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
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await client.end()
  }
}

analyzeServiceTypes()