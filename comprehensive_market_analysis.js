import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs/promises'

// Load environment variables
dotenv.config()

// Create Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

async function comprehensiveMarketAnalysis() {
  console.log('🔍 Starting Comprehensive Market Analysis...\n')

  try {
    // Get ALL cities with their lead counts
    console.log('📊 Analyzing ALL markets in database...')
    const { data: allLeads, error } = await supabase
      .from('leads')
      .select('city, state, service_type')
      .not('city', 'is', null)
      .not('state', 'is', null)
    
    if (error) throw error
    
    console.log(`Total leads in database: ${allLeads.length}`)

    // Create comprehensive market analysis
    const marketAnalysis = new Map()
    const serviceByMarket = new Map()
    
    allLeads.forEach(lead => {
      const market = `${lead.city}, ${lead.state}`
      
      // Count total leads per market
      if (!marketAnalysis.has(market)) {
        marketAnalysis.set(market, {
          city: lead.city,
          state: lead.state,
          totalLeads: 0,
          services: new Map()
        })
      }
      
      const marketData = marketAnalysis.get(market)
      marketData.totalLeads++
      
      // Count service distribution
      if (lead.service_type) {
        const serviceCount = marketData.services.get(lead.service_type) || 0
        marketData.services.set(lead.service_type, serviceCount + 1)
      }
    })

    // Convert to array and sort by total leads
    const sortedMarkets = Array.from(marketAnalysis.entries())
      .map(([market, data]) => ({
        market,
        ...data
      }))
      .sort((a, b) => b.totalLeads - a.totalLeads)

    console.log(`\nTotal unique markets: ${sortedMarkets.length}`)
    console.log(`Markets with 10+ leads: ${sortedMarkets.filter(m => m.totalLeads >= 10).length}`)
    console.log(`Markets with 50+ leads: ${sortedMarkets.filter(m => m.totalLeads >= 50).length}`)
    console.log(`Markets with 100+ leads: ${sortedMarkets.filter(m => m.totalLeads >= 100).length}`)

    // Check specific tech hubs
    console.log('\n🚀 Checking Major Tech Hubs:')
    const techHubs = [
      'Austin, TX', 'Seattle, WA', 'San Francisco, CA', 'San Jose, CA',
      'Denver, CO', 'Boston, MA', 'Portland, OR', 'Raleigh, NC',
      'Atlanta, GA', 'Phoenix, AZ', 'Dallas, TX', 'Miami, FL',
      'Salt Lake City, UT', 'Nashville, TN', 'Charlotte, NC'
    ]

    techHubs.forEach(hub => {
      const marketData = sortedMarkets.find(m => m.market === hub)
      if (marketData) {
        console.log(`\n${hub}:`)
        console.log(`  Total leads: ${marketData.totalLeads}`)
        const evLeads = marketData.services.get('EV Charging Installation') || 0
        const smartHomeLeads = (marketData.services.get('Smart Home Installation') || 0) + 
                              (marketData.services.get('Smart Home') || 0)
        console.log(`  EV Charging: ${evLeads} leads`)
        console.log(`  Smart Home: ${smartHomeLeads} leads`)
      } else {
        console.log(`\n${hub}: NO DATA`)
      }
    })

    // Find ALL blue ocean opportunities across ALL markets
    console.log('\n\n💎 COMPREHENSIVE Blue Ocean Analysis:')
    
    const emergingServices = [
      { name: 'EV Charging Installation', growth: 27.11 },
      { name: 'Smart Home Installation', growth: 23.4 },
      { name: 'Artificial Turf Installation', growth: 19.7 },
      { name: 'Outdoor Kitchen Installation', growth: 8.9 },
      { name: 'Water Features Installation', growth: 8.0 },
      { name: 'Custom Lighting Design', growth: 5.72 },
      { name: 'Outdoor Living Structures', growth: 5.3 },
      { name: 'Foundation Repair', growth: 5.0 },
      { name: 'Basement Waterproofing', growth: 5.0 }
    ]

    const allOpportunities = []

    sortedMarkets.forEach(market => {
      if (market.totalLeads >= 10) { // Only consider markets with at least 10 leads
        emergingServices.forEach(service => {
          const serviceLeads = market.services.get(service.name) || 0
          const coverage = (serviceLeads / market.totalLeads) * 100
          
          if (coverage < 5) { // Less than 5% coverage
            allOpportunities.push({
              market: market.market,
              state: market.state,
              service: service.name,
              growth: service.growth,
              serviceLeads,
              marketTotal: market.totalLeads,
              coverage: coverage.toFixed(2),
              opportunity: serviceLeads === 0 ? 'NO_PRESENCE' : 
                          coverage < 1 ? 'VERY_LOW' : 
                          coverage < 3 ? 'LOW' : 'MODERATE',
              score: (market.totalLeads * service.growth) / (serviceLeads + 1)
            })
          }
        })
      }
    })

    // Sort by opportunity score
    allOpportunities.sort((a, b) => b.score - a.score)

    // Group by service to find best markets for each
    const opportunitiesByService = new Map()
    emergingServices.forEach(service => {
      opportunitiesByService.set(service.name, [])
    })

    allOpportunities.forEach(opp => {
      const serviceOpps = opportunitiesByService.get(opp.service)
      if (serviceOpps.length < 10) { // Keep top 10 markets per service
        serviceOpps.push(opp)
      }
    })

    // Generate comprehensive report
    let report = `# COMPREHENSIVE ReactLeads Blue Ocean Analysis

## Database Overview
- Total Leads: ${allLeads.length.toLocaleString()}
- Unique Markets: ${sortedMarkets.length}
- Markets with 50+ leads: ${sortedMarkets.filter(m => m.totalLeads >= 50).length}

## 🏆 TOP BLUE OCEAN OPPORTUNITIES BY SERVICE

`

    // Add top opportunities for each service
    for (const [serviceName, opportunities] of opportunitiesByService.entries()) {
      const service = emergingServices.find(s => s.name === serviceName)
      report += `\n### ${serviceName} (${service.growth}% Annual Growth)\n\n`
      
      opportunities.slice(0, 5).forEach((opp, index) => {
        report += `${index + 1}. **${opp.market}**\n`
        report += `   - Market Size: ${opp.marketTotal} total leads\n`
        report += `   - Current Competition: ${opp.serviceLeads} leads (${opp.coverage}%)\n`
        report += `   - Opportunity: ${opp.opportunity}\n\n`
      })
    }

    // Add regional analysis
    report += `\n## 📍 REGIONAL ANALYSIS\n\n`

    const regionMap = {
      'TX': 'South', 'FL': 'South', 'GA': 'South', 'NC': 'South', 'SC': 'South',
      'CA': 'West', 'AZ': 'West', 'NV': 'West', 'NM': 'West',
      'NY': 'Northeast', 'NJ': 'Northeast', 'CT': 'Northeast', 'MA': 'Northeast', 'PA': 'Northeast',
      'OH': 'Midwest', 'MI': 'Midwest', 'IL': 'Midwest', 'IN': 'Midwest', 'WI': 'Midwest',
      'WA': 'Pacific Northwest', 'OR': 'Pacific Northwest', 'ID': 'Pacific Northwest',
      'CO': 'Mountain', 'UT': 'Mountain', 'WY': 'Mountain'
    }

    const regionalOpportunities = new Map()
    
    allOpportunities.forEach(opp => {
      const region = regionMap[opp.state] || 'Other'
      if (!regionalOpportunities.has(region)) {
        regionalOpportunities.set(region, [])
      }
      if (regionalOpportunities.get(region).length < 10) {
        regionalOpportunities.get(region).push(opp)
      }
    })

    for (const [region, opps] of regionalOpportunities.entries()) {
      report += `### ${region} Region Top Opportunities\n\n`
      opps.slice(0, 5).forEach((opp, index) => {
        report += `${index + 1}. ${opp.service} in ${opp.market} (${opp.marketTotal} leads, ${opp.opportunity})\n`
      })
      report += '\n'
    }

    // Add surprising findings
    report += `\n## 🎯 SURPRISING FINDINGS\n\n`

    // Find large markets with NO emerging services
    const largeMarketsNoEmerging = sortedMarkets
      .filter(m => m.totalLeads >= 50)
      .filter(m => {
        const hasEmerging = emergingServices.some(s => 
          (m.services.get(s.name) || 0) > 0
        )
        return !hasEmerging
      })

    if (largeMarketsNoEmerging.length > 0) {
      report += `### Large Markets with ZERO Emerging Services:\n\n`
      largeMarketsNoEmerging.slice(0, 5).forEach(m => {
        report += `- ${m.market}: ${m.totalLeads} total leads\n`
      })
      report += '\n'
    }

    // Save comprehensive report
    await fs.writeFile('./comprehensive_blue_ocean_report.md', report)
    console.log('\n✅ Comprehensive report saved to comprehensive_blue_ocean_report.md')

    // Also create a CSV for easier analysis
    let csv = 'Market,State,Service,Growth Rate,Service Leads,Market Total,Coverage %,Opportunity Level,Score\n'
    allOpportunities.slice(0, 100).forEach(opp => {
      csv += `"${opp.market}",${opp.state},"${opp.service}",${opp.growth},${opp.serviceLeads},${opp.marketTotal},${opp.coverage},${opp.opportunity},${opp.score.toFixed(2)}\n`
    })
    
    await fs.writeFile('./blue_ocean_opportunities.csv', csv)
    console.log('✅ Top 100 opportunities saved to blue_ocean_opportunities.csv')

  } catch (error) {
    console.error('Analysis error:', error)
  }
}

// Run the analysis
comprehensiveMarketAnalysis()