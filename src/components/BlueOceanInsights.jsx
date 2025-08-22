import { useState, useEffect } from 'react'
import { TrendingUp, Zap, Home, Droplets, Wrench, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import './BlueOceanInsights.css'

function BlueOceanInsights() {
  const [insights, setInsights] = useState({
    loading: true,
    topOpportunities: [],
    marketStats: {},
    regionalGaps: []
  })

  // Emerging services with growth rates
  const emergingServices = [
    { name: 'EV Charging Installation', growth: 27.11, icon: Zap, color: '#10b981' },
    { name: 'Smart Home Installation', growth: 23.4, icon: Home, color: '#3b82f6' },
    { name: 'Artificial Turf Installation', growth: 19.7, icon: Droplets, color: '#8b5cf6' },
    { name: 'Foundation Repair', growth: 5.0, icon: Wrench, color: '#f59e0b' },
    { name: 'Basement Waterproofing', growth: 5.0, icon: Droplets, color: '#06b6d4' }
  ]

  useEffect(() => {
    analyzeBlueOceanOpportunities()
  }, [])

  const analyzeBlueOceanOpportunities = async () => {
    try {
      // Get all markets with lead counts
      const { data: allLeads, error: leadsError } = await supabase
        .from('leads')
        .select('city, state, service_type')
        .not('city', 'is', null)
        .not('state', 'is', null)

      if (leadsError) throw leadsError

      // Analyze market data
      const marketAnalysis = new Map()
      
      allLeads.forEach(lead => {
        const market = `${lead.city}, ${lead.state}`
        
        if (!marketAnalysis.has(market)) {
          marketAnalysis.set(market, {
            totalLeads: 0,
            services: new Map(),
            state: lead.state
          })
        }
        
        const marketData = marketAnalysis.get(market)
        marketData.totalLeads++
        
        if (lead.service_type) {
          marketData.services.set(
            lead.service_type, 
            (marketData.services.get(lead.service_type) || 0) + 1
          )
        }
      })

      // Find blue ocean opportunities
      const opportunities = []
      
      // Only analyze markets with significant presence (50+ leads)
      Array.from(marketAnalysis.entries())
        .filter(([_, data]) => data.totalLeads >= 50)
        .forEach(([market, data]) => {
          emergingServices.forEach(service => {
            const serviceLeads = data.services.get(service.name) || 0
            const coverage = (serviceLeads / data.totalLeads) * 100
            
            // Blue ocean = less than 2% market share
            if (coverage < 2) {
              opportunities.push({
                market,
                state: data.state,
                service: service.name,
                growth: service.growth,
                icon: service.icon,
                color: service.color,
                currentLeads: serviceLeads,
                marketSize: data.totalLeads,
                coverage: coverage.toFixed(2),
                opportunityScore: (data.totalLeads * service.growth) / (serviceLeads + 1)
              })
            }
          })
        })

      // Sort by opportunity score
      opportunities.sort((a, b) => b.opportunityScore - a.opportunityScore)

      // Calculate market stats
      const totalMarkets = marketAnalysis.size
      const marketsWithEmerging = Array.from(marketAnalysis.values()).filter(data => 
        emergingServices.some(service => data.services.has(service.name))
      ).length

      // Find regional gaps
      const regionalGaps = findRegionalGaps(marketAnalysis)

      setInsights({
        loading: false,
        topOpportunities: opportunities.slice(0, 10),
        marketStats: {
          totalMarkets,
          totalLeads: allLeads.length,
          marketsWithEmerging,
          percentageWithoutEmerging: ((totalMarkets - marketsWithEmerging) / totalMarkets * 100).toFixed(1)
        },
        regionalGaps
      })

    } catch (error) {
      console.error('Error analyzing blue ocean opportunities:', error)
      setInsights(prev => ({ ...prev, loading: false }))
    }
  }

  const findRegionalGaps = (marketAnalysis) => {
    const regions = {
      'Northeast': ['NY', 'NJ', 'CT', 'MA', 'PA', 'MD', 'DE', 'ME', 'NH', 'VT', 'RI'],
      'South': ['TX', 'FL', 'GA', 'NC', 'SC', 'VA', 'AL', 'MS', 'LA', 'TN', 'KY', 'AR', 'OK', 'WV'],
      'West': ['CA', 'AZ', 'NV', 'NM', 'HI'],
      'Midwest': ['OH', 'MI', 'IL', 'IN', 'WI', 'MN', 'IA', 'MO', 'KS', 'NE', 'ND', 'SD'],
      'Mountain': ['CO', 'UT', 'WY', 'ID', 'MT']
    }

    const gaps = []
    
    Object.entries(regions).forEach(([region, states]) => {
      const regionMarkets = Array.from(marketAnalysis.entries())
        .filter(([_, data]) => states.includes(data.state))
      
      if (regionMarkets.length > 0) {
        const totalRegionLeads = regionMarkets.reduce((sum, [_, data]) => sum + data.totalLeads, 0)
        const avgLeadsPerMarket = totalRegionLeads / regionMarkets.length
        
        // Find which emerging services are missing
        const missingServices = emergingServices.filter(service => {
          const marketsWithService = regionMarkets.filter(([_, data]) => 
            data.services.has(service.name)
          ).length
          return marketsWithService < regionMarkets.length * 0.1 // Less than 10% penetration
        })
        
        if (missingServices.length > 0) {
          gaps.push({
            region,
            marketCount: regionMarkets.length,
            avgLeadsPerMarket: Math.round(avgLeadsPerMarket),
            missingServices: missingServices.map(s => s.name),
            topMissingService: missingServices[0]?.name
          })
        }
      }
    })
    
    return gaps
  }

  const getRegionForState = (state) => {
    const regionMap = {
      'TX': 'South', 'FL': 'South', 'GA': 'South', 'NC': 'South', 'SC': 'South',
      'CA': 'West', 'AZ': 'West', 'NV': 'West',
      'NY': 'Northeast', 'NJ': 'Northeast', 'CT': 'Northeast', 'MA': 'Northeast',
      'OH': 'Midwest', 'MI': 'Midwest', 'IL': 'Midwest', 'IN': 'Midwest',
      'CO': 'Mountain', 'UT': 'Mountain',
      'WA': 'Pacific NW', 'OR': 'Pacific NW'
    }
    return regionMap[state] || 'Other'
  }

  if (insights.loading) {
    return (
      <div className="blue-ocean-insights loading">
        <div className="loading-spinner"></div>
        <p>Analyzing market opportunities...</p>
      </div>
    )
  }

  return (
    <div className="blue-ocean-insights">
      <div className="insights-header">
        <h2>🌊 Blue Ocean Opportunities</h2>
        <p>High-growth services with minimal competition in your markets</p>
      </div>

      {/* Market Overview */}
      <div className="market-overview">
        <div className="stat-card">
          <span className="stat-value">{insights.marketStats.totalMarkets}</span>
          <span className="stat-label">Active Markets</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{insights.marketStats.totalLeads.toLocaleString()}</span>
          <span className="stat-label">Total Leads</span>
        </div>
        <div className="stat-card alert">
          <span className="stat-value">{insights.marketStats.percentageWithoutEmerging}%</span>
          <span className="stat-label">Markets Missing Emerging Services</span>
        </div>
      </div>

      {/* Top Opportunities */}
      <div className="opportunities-section">
        <h3>Top 10 Blue Ocean Opportunities</h3>
        <div className="opportunities-list">
          {insights.topOpportunities.map((opp, index) => {
            const Icon = opp.icon
            return (
              <div key={index} className="opportunity-card">
                <div className="opportunity-rank">#{index + 1}</div>
                <div className="opportunity-icon" style={{ backgroundColor: opp.color }}>
                  <Icon size={24} color="white" />
                </div>
                <div className="opportunity-details">
                  <div className="opportunity-service">{opp.service}</div>
                  <div className="opportunity-market">{opp.market}</div>
                  <div className="opportunity-stats">
                    <span className="growth-rate">📈 {opp.growth}% growth</span>
                    <span className="market-size">• {opp.marketSize} total leads</span>
                    <span className="competition">• {opp.currentLeads} competitors</span>
                  </div>
                </div>
                <div className="opportunity-score">
                  <div className="score-label">Opportunity Score</div>
                  <div className="score-value">{Math.round(opp.opportunityScore).toLocaleString()}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Regional Gaps */}
      {insights.regionalGaps.length > 0 && (
        <div className="regional-gaps-section">
          <h3>Regional Service Gaps</h3>
          <div className="gaps-grid">
            {insights.regionalGaps.map((gap, index) => (
              <div key={index} className="gap-card">
                <div className="gap-region">{gap.region}</div>
                <div className="gap-stats">
                  <span>{gap.marketCount} markets</span>
                  <span>•</span>
                  <span>{gap.avgLeadsPerMarket} avg leads</span>
                </div>
                <div className="gap-services">
                  <AlertCircle size={16} />
                  <span>Missing: {gap.topMissingService}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Recommendations */}
      <div className="recommendations-section">
        <h3>💡 Quick Recommendations</h3>
        <ul>
          {insights.topOpportunities.length > 0 && (
            <>
              <li>
                <strong>Highest Priority:</strong> Launch {insights.topOpportunities[0].service} in{' '}
                {insights.topOpportunities[0].market} (Score: {Math.round(insights.topOpportunities[0].opportunityScore).toLocaleString()})
              </li>
              <li>
                <strong>Fastest Growth:</strong> Focus on EV Charging Installation (27.11% annual growth) across all major markets
              </li>
              <li>
                <strong>Regional Opportunity:</strong> {insights.regionalGaps[0]?.region || 'Multiple regions'} lacking {insights.regionalGaps[0]?.topMissingService || 'emerging services'}
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  )
}

export default BlueOceanInsights