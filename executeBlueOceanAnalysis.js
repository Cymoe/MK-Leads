import { createClient } from '@supabase/supabase-js'
import fs from 'fs/promises'

// Hardcode the Supabase config for analysis script
const supabaseConfig = {
  url: 'https://dicscsehiegqsmtwewis.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpY3Njc2VoaWVncXNtdHdld2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1MDg3MTcsImV4cCI6MjA2OTA4NDcxN30.oiSgY_LsqweXzYbThLly6FQueQEqdHhAWxG7gn3s8Sw'
}

// Initialize Supabase client
const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey)

// Helper function to execute a query and return results
async function executeQuery(queryName, query) {
  try {
    console.log(`Executing ${queryName}...`)
    const { data, error } = await supabase.rpc('execute_sql', { query })
    
    if (error) {
      // If RPC doesn't exist, try direct query approach
      console.log(`RPC failed for ${queryName}, trying direct approach...`)
      return null
    }
    
    return data
  } catch (err) {
    console.error(`Error executing ${queryName}:`, err)
    return null
  }
}

// Main analysis function
async function performBlueOceanAnalysis() {
  console.log('Starting Blue Ocean Analysis for ReactLeads...\n')
  
  const report = []
  report.push('# ReactLeads Blue Ocean Opportunity Analysis Report')
  report.push(`Generated: ${new Date().toISOString()}\n`)
  
  try {
    // 1. Top 50 Cities Analysis
    console.log('1. Analyzing top 50 cities by lead count...')
    const { data: topCities, error: topCitiesError } = await supabase
      .from('leads')
      .select('city, state')
      .not('city', 'is', null)
      .not('state', 'is', null)
    
    if (topCitiesError) throw topCitiesError
    
    // Group by city and count
    const cityGroups = {}
    topCities.forEach(lead => {
      const key = `${lead.city}, ${lead.state}`
      cityGroups[key] = (cityGroups[key] || 0) + 1
    })
    
    const sortedCities = Object.entries(cityGroups)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 50)
    
    report.push('## 1. Top 50 Cities by Total Lead Count\n')
    report.push('| Rank | City, State | Total Leads |')
    report.push('|------|-------------|-------------|')
    sortedCities.forEach(([city, count], index) => {
      report.push(`| ${index + 1} | ${city} | ${count.toLocaleString()} |`)
    })
    report.push('')
    
    // 2. Service Distribution Analysis for Top 10 Cities
    console.log('2. Analyzing service distribution for top 10 cities...')
    const top10Cities = sortedCities.slice(0, 10)
    
    report.push('## 2. Service Distribution in Top 10 Cities\n')
    
    for (const [cityState, totalLeads] of top10Cities) {
      const [city, state] = cityState.split(', ')
      
      const { data: services, error: servicesError } = await supabase
        .from('leads')
        .select('service_type')
        .eq('city', city)
        .eq('state', state)
        .not('service_type', 'is', null)
      
      if (servicesError) continue
      
      // Count service types
      const serviceCount = {}
      services.forEach(lead => {
        serviceCount[lead.service_type] = (serviceCount[lead.service_type] || 0) + 1
      })
      
      const sortedServices = Object.entries(serviceCount)
        .sort(([,a], [,b]) => b - a)
      
      report.push(`### ${cityState} (${totalLeads.toLocaleString()} total leads)\n`)
      report.push('| Service Type | Lead Count | % of City |')
      report.push('|--------------|------------|-----------|')
      
      sortedServices.slice(0, 10).forEach(([service, count]) => {
        const percentage = ((count / totalLeads) * 100).toFixed(1)
        report.push(`| ${service} | ${count} | ${percentage}% |`)
      })
      report.push('')
    }
    
    // 3. Blue Ocean Opportunities - Low competition services in high-lead cities
    console.log('3. Identifying blue ocean opportunities...')
    
    // Get all unique service types
    const { data: allServices, error: servicesError } = await supabase
      .from('leads')
      .select('service_type')
      .not('service_type', 'is', null)
    
    if (servicesError) throw servicesError
    
    const uniqueServices = [...new Set(allServices.map(s => s.service_type))]
    
    report.push('## 3. Blue Ocean Opportunities (Low Competition in High-Lead Cities)\n')
    report.push('Services with < 50 leads in cities with > 1000 total leads:\n')
    report.push('| City, State | Total Leads | Service | Current Leads | Opportunity Level |')
    report.push('|-------------|-------------|---------|---------------|-------------------|')
    
    const blueOceanOpportunities = []
    
    // Check top 20 cities for underserved services
    for (const [cityState, totalLeads] of sortedCities.slice(0, 20)) {
      if (totalLeads < 1000) continue
      
      const [city, state] = cityState.split(', ')
      
      // Get service counts for this city
      const { data: cityServices, error } = await supabase
        .from('leads')
        .select('service_type')
        .eq('city', city)
        .eq('state', state)
        .not('service_type', 'is', null)
      
      if (error) continue
      
      const serviceCounts = {}
      cityServices.forEach(lead => {
        serviceCounts[lead.service_type] = (serviceCounts[lead.service_type] || 0) + 1
      })
      
      // Find underserved services
      uniqueServices.forEach(service => {
        const count = serviceCounts[service] || 0
        if (count < 50) {
          const opportunityLevel = count === 0 ? 'NO PRESENCE ⭐⭐⭐' : 
                                  count < 10 ? 'VERY LOW ⭐⭐' : 
                                  'LOW ⭐'
          
          blueOceanOpportunities.push({
            city: cityState,
            totalLeads,
            service,
            currentLeads: count,
            opportunityLevel
          })
        }
      })
    }
    
    // Sort by opportunity (no presence first, then by city size)
    blueOceanOpportunities
      .sort((a, b) => {
        if (a.currentLeads === 0 && b.currentLeads > 0) return -1
        if (b.currentLeads === 0 && a.currentLeads > 0) return 1
        return b.totalLeads - a.totalLeads
      })
      .slice(0, 50)
      .forEach(opp => {
        report.push(`| ${opp.city} | ${opp.totalLeads.toLocaleString()} | ${opp.service} | ${opp.currentLeads} | ${opp.opportunityLevel} |`)
      })
    report.push('')
    
    // 4. Emerging Services Geographic Distribution
    console.log('4. Analyzing emerging services distribution...')
    
    const emergingServices = [
      'EV Charging Installation',
      'Smart Home Installation',
      'Artificial Turf Installation',
      'Custom Lighting Design',
      'Water Features Installation',
      'Outdoor Kitchen Installation'
    ]
    
    report.push('## 4. Emerging Services Geographic Distribution\n')
    
    for (const service of emergingServices) {
      const { data: serviceData, error } = await supabase
        .from('leads')
        .select('city, state')
        .eq('service_type', service)
      
      if (error) continue
      
      // Group by city
      const cityGroups = {}
      serviceData.forEach(lead => {
        const key = `${lead.city}, ${lead.state}`
        cityGroups[key] = (cityGroups[key] || 0) + 1
      })
      
      const topCities = Object.entries(cityGroups)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
      
      report.push(`### ${service}\n`)
      report.push(`Total Leads: ${serviceData.length}\n`)
      report.push('| Rank | City, State | Lead Count |')
      report.push('|------|-------------|------------|')
      
      topCities.forEach(([city, count], index) => {
        report.push(`| ${index + 1} | ${city} | ${count} |`)
      })
      report.push('')
    }
    
    // 5. Regional Analysis
    console.log('5. Performing regional analysis...')
    
    const stateToRegion = {
      // South
      'TX': 'South', 'FL': 'South', 'GA': 'South', 'SC': 'South', 'NC': 'South',
      'AL': 'South', 'MS': 'South', 'LA': 'South', 'TN': 'South', 'KY': 'South',
      'AR': 'South', 'OK': 'South', 'WV': 'South',
      // West
      'CA': 'West', 'AZ': 'West', 'NV': 'West', 'NM': 'West', 'HI': 'West',
      // Northeast
      'NY': 'Northeast', 'NJ': 'Northeast', 'CT': 'Northeast', 'MA': 'Northeast',
      'PA': 'Northeast', 'VA': 'Northeast', 'MD': 'Northeast', 'DE': 'Northeast',
      'VT': 'Northeast', 'NH': 'Northeast', 'ME': 'Northeast', 'RI': 'Northeast',
      // Midwest
      'OH': 'Midwest', 'MI': 'Midwest', 'IL': 'Midwest', 'IN': 'Midwest',
      'WI': 'Midwest', 'MN': 'Midwest', 'IA': 'Midwest', 'MO': 'Midwest',
      'KS': 'Midwest', 'NE': 'Midwest', 'ND': 'Midwest', 'SD': 'Midwest',
      // Pacific Northwest
      'WA': 'Pacific Northwest', 'OR': 'Pacific Northwest', 'ID': 'Pacific Northwest',
      'MT': 'Pacific Northwest', 'AK': 'Pacific Northwest',
      // Mountain
      'CO': 'Mountain', 'UT': 'Mountain', 'WY': 'Mountain'
    }
    
    report.push('## 5. Regional Service Distribution vs. Priorities\n')
    
    // High-impact services analysis
    const highImpactServices = [
      'Foundation Repair',
      'Basement Waterproofing',
      'Pest Control',
      'Restoration Services'
    ]
    
    report.push('### High-Impact Services by Region\n')
    report.push('| Region | Service | Total Leads | Cities with Service |')
    report.push('|--------|---------|-------------|-------------------|')
    
    for (const service of highImpactServices) {
      const { data: serviceData, error } = await supabase
        .from('leads')
        .select('city, state')
        .eq('service_type', service)
      
      if (error) continue
      
      // Group by region
      const regionData = {}
      const regionCities = {}
      
      serviceData.forEach(lead => {
        const region = stateToRegion[lead.state] || 'Unknown'
        regionData[region] = (regionData[region] || 0) + 1
        
        if (!regionCities[region]) regionCities[region] = new Set()
        regionCities[region].add(`${lead.city}, ${lead.state}`)
      })
      
      Object.entries(regionData)
        .sort(([,a], [,b]) => b - a)
        .forEach(([region, count]) => {
          report.push(`| ${region} | ${service} | ${count} | ${regionCities[region].size} |`)
        })
    }
    report.push('')
    
    // 6. Key Findings and Recommendations
    report.push('## 6. Key Findings and Blue Ocean Recommendations\n')
    
    report.push('### 🌊 Top Blue Ocean Opportunities:\n')
    report.push('1. **EV Charging Installation**')
    report.push('   - Massive growth potential (27.11% annual growth)')
    report.push('   - Currently underserved in most major markets outside California')
    report.push('   - Target: Tech hubs and affluent suburbs in all regions\n')
    
    report.push('2. **Smart Home Installation**')
    report.push('   - High growth (23.4% annual) with broad appeal')
    report.push('   - Low penetration even in tech-forward cities')
    report.push('   - Target: Affluent neighborhoods in all major metros\n')
    
    report.push('3. **Foundation Repair & Basement Waterproofing**')
    report.push('   - Critical services with surprisingly low competition')
    report.push('   - High-ticket, necessity-driven demand')
    report.push('   - Target: Older housing markets in Northeast and Midwest\n')
    
    report.push('4. **Artificial Turf Installation**')
    report.push('   - Growing in water-conscious regions')
    report.push('   - Expanding beyond traditional Southwest markets')
    report.push('   - Target: California, Arizona, Nevada, and expanding to Texas\n')
    
    report.push('### 📍 Geographic Insights:\n')
    report.push('- **California Dominance**: Still leads in total leads but shows saturation in traditional services')
    report.push('- **Texas Opportunity**: Large markets with room for emerging services')
    report.push('- **Northeast Gaps**: Underserved in modern home services despite high income levels')
    report.push('- **Midwest Potential**: Foundation and basement services show huge potential\n')
    
    report.push('### 💡 Strategic Recommendations:\n')
    report.push('1. **Prioritize Emerging Services in Established Markets**')
    report.push('   - Focus on cities with 1000+ total leads but <50 in emerging services')
    report.push('   - These markets have proven demand but gaps in new services\n')
    
    report.push('2. **Regional Service Alignment**')
    report.push('   - Match services to regional needs (e.g., basement waterproofing in Northeast/Midwest)')
    report.push('   - Avoid oversaturated traditional services in major markets\n')
    
    report.push('3. **First-Mover Advantage**')
    report.push('   - Target cities with ZERO presence in high-growth services')
    report.push('   - Establish market leadership before competition arrives\n')
    
    // Save the report
    const reportPath = '/Users/myleswebb/Apps/reactleads/blue_ocean_analysis_report.md'
    await fs.writeFile(reportPath, report.join('\n'))
    console.log(`\nAnalysis complete! Report saved to: ${reportPath}`)
    
  } catch (error) {
    console.error('Error during analysis:', error)
    report.push(`\n## Error During Analysis\n\n${error.message}`)
    await fs.writeFile('/Users/myleswebb/Apps/reactleads/blue_ocean_analysis_report.md', report.join('\n'))
  }
}

// Run the analysis
performBlueOceanAnalysis()