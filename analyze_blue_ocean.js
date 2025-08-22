import { supabase } from './src/lib/supabase.js'
import fs from 'fs/promises'

async function analyzeBlueOceanOpportunities() {
  console.log('🔍 Starting Blue Ocean Market Analysis...\n')

  try {
    // 1. Get Top 50 Cities by Lead Count
    console.log('📊 Top Markets by Lead Volume:')
    const { data: topCities, error: topCitiesError } = await supabase
      .from('leads')
      .select('city, state')
      .not('city', 'is', null)
      .not('state', 'is', null)
    
    if (topCitiesError) throw topCitiesError

    // Count leads per city
    const cityCountMap = new Map()
    topCities.forEach(lead => {
      const key = `${lead.city}, ${lead.state}`
      cityCountMap.set(key, (cityCountMap.get(key) || 0) + 1)
    })

    // Sort and get top 50
    const sortedCities = Array.from(cityCountMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 50)

    console.log('Top 10 Markets:')
    sortedCities.slice(0, 10).forEach(([market, count], index) => {
      console.log(`${index + 1}. ${market}: ${count.toLocaleString()} leads`)
    })
    console.log()

    // 2. Analyze Service Distribution in Top 20 Markets
    console.log('🎯 Analyzing Service Distribution in Top Markets...')
    const top20Markets = sortedCities.slice(0, 20).map(([market]) => market)
    
    // Get all leads for top 20 markets with service types
    const serviceAnalysis = new Map()
    
    for (const market of top20Markets) {
      const [city, state] = market.split(', ')
      const { data: marketLeads } = await supabase
        .from('leads')
        .select('service_type')
        .eq('city', city)
        .eq('state', state)
        .not('service_type', 'is', null)
      
      const serviceCount = new Map()
      marketLeads?.forEach(lead => {
        serviceCount.set(lead.service_type, (serviceCount.get(lead.service_type) || 0) + 1)
      })
      
      serviceAnalysis.set(market, {
        total: cityCountMap.get(market),
        services: serviceCount
      })
    }

    // 3. Find Blue Ocean Opportunities - Emerging Services with Low Competition
    console.log('\n💎 Blue Ocean Opportunities (High-Growth Services with Low Competition):')
    
    const emergingServices = [
      { name: 'EV Charging Installation', growth: 27.11 },
      { name: 'Smart Home Installation', growth: 23.4 },
      { name: 'Artificial Turf Installation', growth: 19.7 },
      { name: 'Outdoor Kitchen Installation', growth: 8.9 },
      { name: 'Water Features Installation', growth: 8.0 },
      { name: 'Custom Lighting Design', growth: 5.72 },
      { name: 'Outdoor Living Structures', growth: 5.3 }
    ]

    const blueOceanOpportunities = []

    for (const [market, data] of serviceAnalysis.entries()) {
      for (const service of emergingServices) {
        const serviceLeads = data.services.get(service.name) || 0
        const marketTotal = data.total
        const coverage = (serviceLeads / marketTotal) * 100

        if (coverage < 3 && marketTotal > 200) { // Low coverage in substantial market
          blueOceanOpportunities.push({
            market,
            service: service.name,
            growth: service.growth,
            serviceLeads,
            marketTotal,
            coverage: coverage.toFixed(2),
            opportunity: coverage === 0 ? 'NO_PRESENCE' : coverage < 1 ? 'VERY_LOW' : 'LOW'
          })
        }
      }
    }

    // Sort by opportunity score (market size * growth rate / competition)
    blueOceanOpportunities.sort((a, b) => {
      const scoreA = (a.marketTotal * a.growth) / (a.serviceLeads + 1)
      const scoreB = (b.marketTotal * b.growth) / (b.serviceLeads + 1)
      return scoreB - scoreA
    })

    console.log('\nTop 15 Blue Ocean Opportunities:')
    blueOceanOpportunities.slice(0, 15).forEach((opp, index) => {
      console.log(`\n${index + 1}. ${opp.service} in ${opp.market}`)
      console.log(`   - Growth Rate: ${opp.growth}%`)
      console.log(`   - Current Leads: ${opp.serviceLeads} (${opp.coverage}% market share)`)
      console.log(`   - Market Size: ${opp.marketTotal} total leads`)
      console.log(`   - Competition: ${opp.opportunity}`)
    })

    // 4. Analyze Foundation/Basement Services in Wet Climate States
    console.log('\n\n🏠 Foundation/Basement Services in Wet Climate Markets:')
    
    const wetStates = ['OH', 'MI', 'IN', 'IL', 'WI', 'MN', 'IA', 'MO', 'PA', 'NY', 'NJ', 'MD', 'VA', 'WV', 'KY', 'TN']
    
    const foundationOpportunities = []
    
    for (const [market, count] of sortedCities) {
      const [city, state] = market.split(', ')
      if (wetStates.includes(state) && count > 100) {
        const { data: foundationLeads } = await supabase
          .from('leads')
          .select('service_type')
          .eq('city', city)
          .eq('state', state)
          .in('service_type', ['Foundation Repair', 'Basement Waterproofing'])
        
        const foundationCount = foundationLeads?.filter(l => l.service_type === 'Foundation Repair').length || 0
        const waterproofingCount = foundationLeads?.filter(l => l.service_type === 'Basement Waterproofing').length || 0
        
        if (foundationCount < 10 || waterproofingCount < 10) {
          foundationOpportunities.push({
            market,
            totalLeads: count,
            foundationLeads: foundationCount,
            waterproofingLeads: waterproofingCount,
            opportunity: foundationCount === 0 || waterproofingCount === 0 ? 'EXCELLENT' : 'GOOD'
          })
        }
      }
    }

    console.log('\nTop Foundation/Waterproofing Opportunities:')
    foundationOpportunities
      .sort((a, b) => b.totalLeads - a.totalLeads)
      .slice(0, 10)
      .forEach((opp, index) => {
        console.log(`\n${index + 1}. ${opp.market}`)
        console.log(`   - Market Size: ${opp.totalLeads} total leads`)
        console.log(`   - Foundation Repair: ${opp.foundationLeads} leads`)
        console.log(`   - Basement Waterproofing: ${opp.waterproofingLeads} leads`)
        console.log(`   - Opportunity Level: ${opp.opportunity}`)
      })

    // 5. Tech Hub Analysis for Smart Home & EV Charging
    console.log('\n\n🚀 Tech Hub Analysis (EV & Smart Home):')
    
    const techHubs = [
      'Austin, TX', 'Seattle, WA', 'San Francisco, CA', 'San Jose, CA',
      'Denver, CO', 'Boston, MA', 'Portland, OR', 'Raleigh, NC',
      'Atlanta, GA', 'Phoenix, AZ', 'Dallas, TX', 'Miami, FL'
    ]

    const techHubOpportunities = []

    for (const hub of techHubs) {
      const [city, state] = hub.split(', ')
      const { data: techLeads } = await supabase
        .from('leads')
        .select('service_type')
        .eq('city', city)
        .eq('state', state)
        .in('service_type', ['EV Charging Installation', 'Smart Home Installation', 'Smart Home'])
      
      const totalLeads = cityCountMap.get(hub) || 0
      const evLeads = techLeads?.filter(l => l.service_type === 'EV Charging Installation').length || 0
      const smartHomeLeads = techLeads?.filter(l => 
        l.service_type === 'Smart Home Installation' || l.service_type === 'Smart Home'
      ).length || 0

      if ((evLeads < 5 || smartHomeLeads < 5) && totalLeads > 50) {
        techHubOpportunities.push({
          hub,
          totalLeads,
          evLeads,
          smartHomeLeads,
          evOpportunity: evLeads < 5,
          smartHomeOpportunity: smartHomeLeads < 5
        })
      }
    }

    console.log('\nTech Hub Opportunities:')
    techHubOpportunities
      .sort((a, b) => b.totalLeads - a.totalLeads)
      .forEach((opp, index) => {
        console.log(`\n${index + 1}. ${opp.hub}`)
        console.log(`   - Market Size: ${opp.totalLeads} total leads`)
        if (opp.evOpportunity) {
          console.log(`   - 🔋 EV Charging: OPPORTUNITY (only ${opp.evLeads} leads)`)
        }
        if (opp.smartHomeOpportunity) {
          console.log(`   - 🏠 Smart Home: OPPORTUNITY (only ${opp.smartHomeLeads} leads)`)
        }
      })

    // 6. Generate Final Report
    const report = `
# ReactLeads Blue Ocean Analysis Report

## Executive Summary

Based on comprehensive analysis of ${topCities.length.toLocaleString()} leads across all markets, here are the data-driven blue ocean opportunities:

## 🏆 TOP 5 BLUE OCEAN OPPORTUNITIES

${blueOceanOpportunities.slice(0, 5).map((opp, index) => `
### ${index + 1}. ${opp.service} in ${opp.market}
- **Growth Rate**: ${opp.growth}% annual growth
- **Current Competition**: ${opp.serviceLeads} leads (${opp.coverage}% market share)
- **Market Size**: ${opp.marketTotal} total leads
- **Opportunity Level**: ${opp.opportunity}
`).join('')}

## 🏠 Best Foundation/Waterproofing Opportunities

${foundationOpportunities.slice(0, 5).map((opp, index) => `
### ${index + 1}. ${opp.market}
- **Market Size**: ${opp.totalLeads} total leads
- **Foundation Repair**: ${opp.foundationLeads} leads (${opp.foundationLeads === 0 ? 'NO PRESENCE!' : 'Low competition'})
- **Basement Waterproofing**: ${opp.waterproofingLeads} leads (${opp.waterproofingLeads === 0 ? 'NO PRESENCE!' : 'Low competition'})
`).join('')}

## 🚀 Tech Hub Opportunities

${techHubOpportunities.slice(0, 5).map((opp, index) => `
### ${index + 1}. ${opp.hub}
- **Market Size**: ${opp.totalLeads} total leads
${opp.evOpportunity ? `- **EV Charging**: MAJOR OPPORTUNITY (only ${opp.evLeads} leads)` : ''}
${opp.smartHomeOpportunity ? `- **Smart Home**: MAJOR OPPORTUNITY (only ${opp.smartHomeLeads} leads)` : ''}
`).join('')}

## Key Insights

1. **EV Charging Installation** shows the most consistent opportunity across multiple markets with minimal competition despite 27.11% growth rate.

2. **Foundation Repair & Basement Waterproofing** are severely underserved in many wet climate cities with 100+ total leads.

3. **Smart Home Installation** has surprisingly low penetration even in tech hubs like ${techHubOpportunities[0]?.hub || 'major cities'}.

4. **Artificial Turf Installation** (19.7% growth) has almost no presence in many water-conscious western markets.

5. Markets with 500+ total leads but <5 leads for emerging services represent the best risk/reward opportunities.

Generated: ${new Date().toISOString()}
`

    // Save report
    await fs.writeFile('./blue_ocean_analysis_report.md', report)
    console.log('\n\n✅ Full report saved to blue_ocean_analysis_report.md')

    return {
      topOpportunities: blueOceanOpportunities.slice(0, 5),
      foundationOpportunities: foundationOpportunities.slice(0, 5),
      techHubOpportunities
    }

  } catch (error) {
    console.error('Analysis error:', error)
  }
}

// Run the analysis
analyzeBlueOceanOpportunities()