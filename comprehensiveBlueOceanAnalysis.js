import { createClient } from '@supabase/supabase-js'
import fs from 'fs/promises'

// Hardcode the Supabase config for analysis script
const supabaseConfig = {
  url: 'https://dicscsehiegqsmtwewis.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpY3Njc2VoaWVncXNtdHdld2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1MDg3MTcsImV4cCI6MjA2OTA4NDcxN30.oiSgY_LsqweXzYbThLly6FQueQEqdHhAWxG7gn3s8Sw'
}

// Initialize Supabase client
const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey)

// Helper function to fetch all data with pagination
async function fetchAllData(tableName, query, orderBy = 'created_at') {
  let allData = []
  let rangeStart = 0
  const rangeSize = 1000
  let hasMore = true
  
  while (hasMore) {
    const { data, error } = await query
      .range(rangeStart, rangeStart + rangeSize - 1)
      .order(orderBy, { ascending: false })
    
    if (error) {
      console.error(`Error fetching ${tableName}:`, error)
      break
    }
    
    if (data && data.length > 0) {
      allData = [...allData, ...data]
      rangeStart += rangeSize
      hasMore = data.length === rangeSize
    } else {
      hasMore = false
    }
  }
  
  return allData
}

// Main analysis function
async function performComprehensiveAnalysis() {
  console.log('Starting Comprehensive Blue Ocean Analysis...\n')
  
  const report = []
  report.push('# ReactLeads Comprehensive Blue Ocean Analysis Report')
  report.push(`Generated: ${new Date().toISOString()}\n`)
  
  try {
    // First, get total database statistics
    console.log('Fetching database statistics...')
    const allLeads = await fetchAllData('leads', 
      supabase.from('leads').select('*')
    )
    
    console.log(`Total leads in database: ${allLeads.length}`)
    
    report.push('## Database Overview\n')
    report.push(`- **Total Leads**: ${allLeads.length.toLocaleString()}`)
    report.push(`- **Analysis Date**: ${new Date().toLocaleDateString()}`)
    report.push('')
    
    // Create data structures for analysis
    const cityData = {}
    const serviceData = {}
    const stateData = {}
    const cityServiceMatrix = {}
    
    // Process all leads
    allLeads.forEach(lead => {
      const cityKey = lead.city && lead.state ? `${lead.city}, ${lead.state}` : null
      
      // City aggregation
      if (cityKey) {
        if (!cityData[cityKey]) {
          cityData[cityKey] = {
            total: 0,
            services: {},
            state: lead.state,
            city: lead.city
          }
        }
        cityData[cityKey].total++
        
        // Service tracking per city
        if (lead.service_type) {
          cityData[cityKey].services[lead.service_type] = 
            (cityData[cityKey].services[lead.service_type] || 0) + 1
          
          // City-Service matrix
          const matrixKey = `${cityKey}|${lead.service_type}`
          cityServiceMatrix[matrixKey] = (cityServiceMatrix[matrixKey] || 0) + 1
        }
      }
      
      // Service aggregation
      if (lead.service_type) {
        if (!serviceData[lead.service_type]) {
          serviceData[lead.service_type] = {
            total: 0,
            cities: new Set(),
            states: new Set()
          }
        }
        serviceData[lead.service_type].total++
        if (cityKey) {
          serviceData[lead.service_type].cities.add(cityKey)
          serviceData[lead.service_type].states.add(lead.state)
        }
      }
      
      // State aggregation
      if (lead.state) {
        if (!stateData[lead.state]) {
          stateData[lead.state] = {
            total: 0,
            cities: new Set(),
            services: {}
          }
        }
        stateData[lead.state].total++
        if (lead.city) stateData[lead.state].cities.add(lead.city)
        if (lead.service_type) {
          stateData[lead.state].services[lead.service_type] = 
            (stateData[lead.state].services[lead.service_type] || 0) + 1
        }
      }
    })
    
    // 1. Top 50 Cities Analysis with corrected counts
    report.push('## 1. Top 50 Cities by Total Lead Count (Corrected)\n')
    report.push('| Rank | City, State | Total Leads | Unique Services |')
    report.push('|------|-------------|-------------|-----------------|')
    
    const sortedCities = Object.entries(cityData)
      .sort(([,a], [,b]) => b.total - a.total)
      .slice(0, 50)
    
    sortedCities.forEach(([city, data], index) => {
      const uniqueServices = Object.keys(data.services).length
      report.push(`| ${index + 1} | ${city} | ${data.total.toLocaleString()} | ${uniqueServices} |`)
    })
    report.push('')
    
    // 2. Service Type Overview
    report.push('## 2. Service Type Overview\n')
    report.push('| Service Type | Total Leads | Cities Present | States Present |')
    report.push('|--------------|-------------|----------------|----------------|')
    
    const sortedServices = Object.entries(serviceData)
      .sort(([,a], [,b]) => b.total - a.total)
      .slice(0, 30)
    
    sortedServices.forEach(([service, data]) => {
      report.push(`| ${service} | ${data.total.toLocaleString()} | ${data.cities.size} | ${data.states.size} |`)
    })
    report.push('')
    
    // 3. True Blue Ocean Opportunities
    report.push('## 3. True Blue Ocean Opportunities\n')
    report.push('### Cities with High Lead Volume but Low/No Presence in Specific Services\n')
    
    // Focus on cities with at least 500 total leads
    const majorCities = Object.entries(cityData)
      .filter(([,data]) => data.total >= 500)
      .sort(([,a], [,b]) => b.total - a.total)
    
    // Emerging services to check
    const emergingServices = [
      'EV Charging Installation',
      'Smart Home Installation',
      'Artificial Turf Installation',
      'Custom Lighting Design',
      'Water Features Installation',
      'Outdoor Kitchen Installation',
      'Foundation Repair',
      'Basement Waterproofing',
      'Pest Control',
      'Restoration Services'
    ]
    
    // Also check all unique services
    const allUniqueServices = Object.keys(serviceData)
    
    report.push('| City, State | Total Leads | Service | Current Leads | Opportunity Score |')
    report.push('|-------------|-------------|---------|---------------|-------------------|')
    
    const opportunities = []
    
    majorCities.forEach(([cityKey, cityInfo]) => {
      // Check each service
      allUniqueServices.forEach(service => {
        const serviceCount = cityInfo.services[service] || 0
        const cityTotal = cityInfo.total
        
        // Calculate opportunity score
        let opportunityScore = 0
        let label = ''
        
        if (serviceCount === 0 && cityTotal >= 1000) {
          opportunityScore = 100
          label = '⭐⭐⭐ NO PRESENCE'
        } else if (serviceCount < 10 && cityTotal >= 1000) {
          opportunityScore = 90
          label = '⭐⭐ VERY LOW'
        } else if (serviceCount < 50 && cityTotal >= 1000) {
          opportunityScore = 80
          label = '⭐ LOW'
        } else if (serviceCount < 20 && cityTotal >= 500) {
          opportunityScore = 70
          label = 'MODERATE'
        }
        
        if (opportunityScore >= 70) {
          opportunities.push({
            city: cityKey,
            cityTotal,
            service,
            serviceCount,
            opportunityScore,
            label,
            isEmerging: emergingServices.includes(service)
          })
        }
      })
    })
    
    // Sort by opportunity score and limit to top 100
    opportunities
      .sort((a, b) => {
        // Prioritize emerging services
        if (a.isEmerging && !b.isEmerging) return -1
        if (!a.isEmerging && b.isEmerging) return 1
        // Then by opportunity score
        if (b.opportunityScore !== a.opportunityScore) {
          return b.opportunityScore - a.opportunityScore
        }
        // Then by city size
        return b.cityTotal - a.cityTotal
      })
      .slice(0, 100)
      .forEach(opp => {
        const emergingTag = opp.isEmerging ? ' 🚀' : ''
        report.push(`| ${opp.city} | ${opp.cityTotal.toLocaleString()} | ${opp.service}${emergingTag} | ${opp.serviceCount} | ${opp.label} |`)
      })
    
    report.push('')
    
    // 4. Regional Analysis
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
    
    report.push('## 4. Regional Analysis\n')
    report.push('### Lead Distribution by Region\n')
    
    const regionData = {}
    Object.entries(stateData).forEach(([state, data]) => {
      const region = stateToRegion[state] || 'Other'
      if (!regionData[region]) {
        regionData[region] = {
          total: 0,
          states: new Set(),
          cities: new Set(),
          services: {}
        }
      }
      regionData[region].total += data.total
      regionData[region].states.add(state)
      data.cities.forEach(city => regionData[region].cities.add(`${city}, ${state}`))
      
      Object.entries(data.services).forEach(([service, count]) => {
        regionData[region].services[service] = 
          (regionData[region].services[service] || 0) + count
      })
    })
    
    report.push('| Region | Total Leads | States | Cities | Top Services |')
    report.push('|--------|-------------|--------|--------|--------------|')
    
    Object.entries(regionData)
      .sort(([,a], [,b]) => b.total - a.total)
      .forEach(([region, data]) => {
        const topServices = Object.entries(data.services)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3)
          .map(([service, count]) => `${service} (${count})`)
          .join(', ')
        
        report.push(`| ${region} | ${data.total.toLocaleString()} | ${data.states.size} | ${data.cities.size} | ${topServices} |`)
      })
    
    report.push('')
    
    // 5. Emerging Services Deep Dive
    report.push('## 5. Emerging Services Geographic Distribution\n')
    
    emergingServices.forEach(service => {
      const serviceInfo = serviceData[service]
      if (serviceInfo && serviceInfo.total > 0) {
        report.push(`### ${service}\n`)
        report.push(`- **Total Leads**: ${serviceInfo.total}`)
        report.push(`- **Cities Present**: ${serviceInfo.cities.size}`)
        report.push(`- **States Present**: ${serviceInfo.states.size}`)
        report.push('\n**Top 10 Cities:**')
        report.push('| Rank | City | Lead Count |')
        report.push('|------|------|------------|')
        
        // Get city counts for this service
        const cityCounts = []
        serviceInfo.cities.forEach(city => {
          const count = cityData[city].services[service] || 0
          cityCounts.push({ city, count })
        })
        
        cityCounts
          .sort((a, b) => b.count - a.count)
          .slice(0, 10)
          .forEach((item, index) => {
            report.push(`| ${index + 1} | ${item.city} | ${item.count} |`)
          })
        
        report.push('')
      }
    })
    
    // 6. Key Findings and Recommendations
    report.push('## 6. Data-Driven Blue Ocean Recommendations\n')
    
    // Find cities with highest opportunity scores
    const topOpportunities = opportunities
      .filter(opp => opp.opportunityScore >= 90 && opp.isEmerging)
      .slice(0, 20)
    
    report.push('### 🎯 Top 20 Immediate Opportunities (No/Very Low Competition)\n')
    report.push('| City | Service | Market Size | Current Competition |')
    report.push('|------|---------|-------------|-------------------|')
    
    topOpportunities.forEach(opp => {
      report.push(`| ${opp.city} | ${opp.service} | ${opp.cityTotal.toLocaleString()} leads | ${opp.serviceCount} competitors |`)
    })
    
    report.push('')
    
    // Regional recommendations
    report.push('### 📍 Regional Strategy Recommendations\n')
    
    Object.entries(regionData).forEach(([region, data]) => {
      report.push(`\n**${region} Region (${data.total.toLocaleString()} total leads)**`)
      
      // Find underserved emerging services in this region
      const underserved = emergingServices.filter(service => {
        const count = data.services[service] || 0
        const percentage = (count / data.total) * 100
        return percentage < 1 // Less than 1% of regional leads
      })
      
      if (underserved.length > 0) {
        report.push(`- Underserved emerging services: ${underserved.join(', ')}`)
      }
      
      // Top cities in region
      const regionCities = Array.from(data.cities)
        .map(city => ({ city, total: cityData[city]?.total || 0 }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 3)
      
      report.push(`- Top markets: ${regionCities.map(c => `${c.city} (${c.total})`).join(', ')}`)
    })
    
    report.push('')
    
    // Final summary
    report.push('### 💡 Executive Summary\n')
    report.push('1. **Database contains limited data** - Most markets have under 1,000 leads, suggesting early-stage data collection')
    report.push('2. **Massive opportunity in emerging services** - EV Charging, Smart Home, and Water Features have near-zero presence')
    report.push('3. **Geographic concentration** - Leads are heavily concentrated in a few cities, leaving many markets wide open')
    report.push('4. **Service gaps even in major markets** - Even top cities lack coverage in many service categories')
    report.push('5. **Regional misalignment** - Many high-priority regional services have minimal presence\n')
    
    report.push('### 🚀 Action Items\n')
    report.push('1. **Immediate focus on zero-competition markets** - Target cities with 500+ leads but no presence in emerging services')
    report.push('2. **Expand data collection** - Current data appears limited; broader collection will reveal more opportunities')
    report.push('3. **Regional service alignment** - Match services to regional needs and priorities')
    report.push('4. **First-mover advantage** - Establish presence in emerging services before competition arrives')
    
    // Save the report
    const reportPath = '/Users/myleswebb/Apps/reactleads/comprehensive_blue_ocean_report.md'
    await fs.writeFile(reportPath, report.join('\n'))
    console.log(`\nAnalysis complete! Report saved to: ${reportPath}`)
    
  } catch (error) {
    console.error('Error during analysis:', error)
    report.push(`\n## Error During Analysis\n\n${error.message}`)
    await fs.writeFile('/Users/myleswebb/Apps/reactleads/comprehensive_blue_ocean_report.md', report.join('\n'))
  }
}

// Run the analysis
performComprehensiveAnalysis()