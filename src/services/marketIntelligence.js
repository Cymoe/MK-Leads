import { supabase } from '../lib/supabase'
import { GoogleTrendsService } from './googleTrends'
import { CompetitorAnalysisService } from './competitorAnalysis'
import { EconomicDataService } from './economicData'

export class MarketIntelligenceService {
  // Calculate demand score based on multiple data sources
  static async calculateDemandScores(marketId, includeExternalData = false) {
    try {
      // Get market details
      const { data: market, error: marketError } = await supabase
        .from('market_coverage')
        .select('*')
        .eq('id', marketId)
        .single()

      if (marketError) throw marketError

      const city = market.market_name.split(',')[0]
      const state = market.market_name.split(', ')[1]

      // Fetch external data if requested
      if (includeExternalData) {
        console.log('Fetching external data sources...')
        
        // Fetch Google Trends data
        await GoogleTrendsService.fetchMarketTrends(marketId, city, state)
        
        // Analyze competition
        await CompetitorAnalysisService.analyzeMarketCompetition(marketId, city, state)
        
        // Fetch economic data
        await EconomicDataService.fetchMarketEconomics(marketId, city, state)
      }

      // Get all service types
      const { data: serviceTypes, error: servicesError } = await supabase
        .from('service_types_master')
        .select('*')
        .eq('is_active', true)

      if (servicesError) throw servicesError

      // Get lead counts by service type for this market
      const { data: leadCounts, error: leadsError } = await supabase
        .from('leads')
        .select('service_type')
        .eq('city', market.market_name.split(',')[0])
        .eq('state', market.market_name.split(', ')[1])

      if (leadsError) throw leadsError

      // Count leads per service type
      const serviceCounts = {}
      leadCounts?.forEach(lead => {
        if (lead.service_type) {
          serviceCounts[lead.service_type] = (serviceCounts[lead.service_type] || 0) + 1
        }
      })

      // Calculate demand scores
      const maxCount = Math.max(...Object.values(serviceCounts), 1)

      const demandMetrics = []

      for (const serviceType of serviceTypes) {
        const count = serviceCounts[serviceType.name] || 0
        
        // Calculate comprehensive demand score using multiple data sources
        let demandScore = await this.calculateComprehensiveDemandScore(
          serviceType.id,
          serviceType.name,
          count,
          maxCount,
          marketId,
          includeExternalData
        )

        // Determine competition level based on service type
        const competitionLevel = this.estimateCompetition(serviceType.name, market.market_name)

        // Calculate trend (mock for now - would use historical data)
        const trend = this.calculateTrend(count, serviceCounts)

        // Get search volume from Google Trends data if available
        let searchVolume = 0
        if (includeExternalData) {
          // Try to get actual search volume from trends data
          const trendsData = await this.getTrendsDataForService(marketId, serviceType.id)
          searchVolume = trendsData?.estimatedMonthlySearches || 0
        } else {
          // Estimate based on service type and market size
          searchVolume = this.estimateSearchVolume(serviceType.name, market)
        }

        demandMetrics.push({
          market_id: marketId,
          service_type_id: serviceType.id,
          demand_score: demandScore,
          search_volume: searchVolume,
          trend_direction: trend.direction,
          trend_percentage: trend.percentage,
          competitor_count: Math.floor(Math.random() * 200 + 50), // Mock data
          competition_level: competitionLevel,
          time_period: '30d',
          measured_at: new Date().toISOString()
        })
      }

      // Upsert demand metrics
      const { error: upsertError } = await supabase
        .from('service_demand_metrics')
        .upsert(demandMetrics, {
          onConflict: 'market_id,service_type_id,time_period'
        })

      if (upsertError) throw upsertError

      // Generate insights based on the data
      await this.generateMarketInsights(marketId, serviceCounts, market)

      return demandMetrics
    } catch (error) {
      console.error('Error calculating demand scores:', error)
      throw error
    }
  }

  // Calculate comprehensive demand score using multiple data sources
  static async calculateComprehensiveDemandScore(serviceTypeId, serviceName, leadCount, maxLeadCount, marketId, includeExternalData = true) {
    let score = 0
    let weights = {
      leadPerformance: 0.3,
      googleTrends: 0.25,
      competition: 0.2,
      economic: 0.15,
      volume: 0.1
    }

    try {
      // 1. Lead Performance Score (30%)
      if (leadCount > 0 && maxLeadCount > 0) {
        const leadScore = (leadCount / maxLeadCount) * 100
        score += leadScore * weights.leadPerformance
      } else {
        // Default score if no leads
        score += 25 * weights.leadPerformance
      }

    // 2. Google Trends Score (25%)
    if (includeExternalData) {
      try {
        const { data: trendsData, error } = await supabase
          .from('service_demand_metrics')
          .select('google_trends_score')
          .eq('market_id', marketId)
          .eq('service_type_id', serviceTypeId)
          .single()
        
        if (error) {
          console.log('Trends query error:', error)
          score += 50 * weights.googleTrends
        } else if (trendsData?.google_trends_score) {
          score += trendsData.google_trends_score * weights.googleTrends
        } else {
          // Fallback if no trends data yet
          score += 50 * weights.googleTrends
        }
      } catch (err) {
        console.log('Trends fetch error:', err)
        score += 50 * weights.googleTrends
      }
    } else {
      // Use simple estimation based on lead count
      score += 50 * weights.googleTrends
    }

    // 3. Competition Score (20%) - Lower competition = higher score
    if (includeExternalData) {
      try {
        const { data: competitorData, error } = await supabase
          .from('competitor_analysis')
          .select('saturation_level')
          .eq('market_id', marketId)
          .eq('service_type_id', serviceTypeId)
          .single()
        
        const competitionScore = {
          'low': 90,
          'medium': 60,
          'high': 30,
          'very_high': 10
        }
        
        if (error) {
          console.log('Competition query error:', error)
          score += 50 * weights.competition
        } else if (competitorData?.saturation_level) {
          score += competitionScore[competitorData.saturation_level] * weights.competition
        } else {
          score += 50 * weights.competition
        }
      } catch (err) {
        console.log('Competition fetch error:', err)
        score += 50 * weights.competition
      }
    } else {
      // Use estimated competition level
      const estimatedCompetition = this.estimateCompetition(serviceName)
      const competitionScore = {
        'low': 90,
        'medium': 60,
        'high': 30
      }
      score += competitionScore[estimatedCompetition] * weights.competition
    }

    // 4. Economic Impact Score (15%)
    if (includeExternalData) {
      try {
        const { data: economicData, error } = await supabase
          .from('market_economic_data')
          .select('*')
          .eq('market_id', marketId)
          .single()
        
        if (error) {
          console.log('Economic query error:', error)
          score += 50 * weights.economic
        } else if (economicData) {
          const economicImpact = EconomicDataService.calculateEconomicImpact(economicData, serviceName)
          score += economicImpact * weights.economic
        } else {
          score += 50 * weights.economic
        }
      } catch (err) {
        console.log('Economic fetch error:', err)
        score += 50 * weights.economic
      }
    } else {
      // Default economic score
      score += 50 * weights.economic
    }

    // 5. Volume Bonus (10%)
    let volumeBonus = 0
    if (leadCount > 1000) volumeBonus = 100
    else if (leadCount > 500) volumeBonus = 80
    else if (leadCount > 100) volumeBonus = 60
    else if (leadCount > 50) volumeBonus = 40
    else if (leadCount > 0) volumeBonus = 20
    
    score += volumeBonus * weights.volume

      return Math.round(Math.min(100, Math.max(0, score)))
    } catch (error) {
      console.error('Error calculating comprehensive demand score:', error)
      // Fallback to simple calculation
      if (leadCount > 0 && maxLeadCount > 0) {
        return Math.round((leadCount / maxLeadCount) * 70)
      }
      return 30 // Default score
    }
  }

  // Estimate competition level based on service type and market
  static estimateCompetition(serviceName) {
    // High competition services
    const highCompetition = ['Painting Companies', 'Landscaping Design', 'Kitchen Remodeling']
    if (highCompetition.includes(serviceName)) return 'high'

    // Low competition services
    const lowCompetition = ['EV Charging Installation', 'Smart Home Installation', 'Custom Lighting Design']
    if (lowCompetition.includes(serviceName)) return 'low'

    return 'medium'
  }

  // Calculate trend based on current data (mock implementation)
  static calculateTrend(currentCount, allCounts) {
    const avgCount = Object.values(allCounts).reduce((sum, c) => sum + c, 0) / Object.keys(allCounts).length

    if (currentCount > avgCount * 1.2) {
      return { direction: 'up', percentage: Math.round((currentCount / avgCount - 1) * 100) }
    } else if (currentCount < avgCount * 0.8) {
      return { direction: 'down', percentage: Math.round((1 - currentCount / avgCount) * -100) }
    }

    return { direction: 'stable', percentage: 0 }
  }

  // Generate market insights
  static async generateMarketInsights(marketId, serviceCounts, market) {
    const insights = []

    // Find top performing services
    const topServices = Object.entries(serviceCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)

    if (topServices.length > 0) {
      insights.push({
        market_id: marketId,
        insight_text: `${topServices[0][0]} is the highest demand service with ${topServices[0][1]} leads captured`,
        insight_type: 'trend',
        importance: 'high'
      })
    }

    // Regional insights
    const state = market.market_name.split(', ')[1]
    if (state === 'TX' && serviceCounts['Solar Installers'] > 50) {
      insights.push({
        market_id: marketId,
        insight_text: 'Solar installer demand is high, likely driven by state incentives and high electricity costs',
        insight_type: 'economic',
        importance: 'high'
      })
    }

    // Seasonal insights
    const month = new Date().getMonth()
    if ([2, 3, 4].includes(month) && serviceCounts['Pool Builders']) {
      insights.push({
        market_id: marketId,
        insight_text: 'Pool builder searches typically peak in spring (March-May) as homeowners prepare for summer',
        insight_type: 'seasonal',
        importance: 'medium'
      })
    }

    // Insert insights
    if (insights.length > 0) {
      await supabase
        .from('market_insights')
        .upsert(insights, { onConflict: 'market_id,insight_text' })
    }
  }

  // Get market intelligence data for display
  static async getMarketIntelligence(marketId) {
    try {
      // Try to get data from market_intelligence_view first
      let demandData = []
      try {
        const { data, error } = await supabase
          .from('market_intelligence_view')
          .select('*')
          .eq('market_id', marketId)
          .order('demand_score', { ascending: false })
          .limit(10)
        
        if (!error) {
          demandData = data || []
        } else {
          console.log('market_intelligence_view not available, using fallback')
        }
      } catch (err) {
        console.log('market_intelligence_view error, using fallback')
      }
      
      // If view doesn't exist or has no data, try service_demand_metrics table
      if (demandData.length === 0) {
        const { data: metricsData } = await supabase
          .from('service_demand_metrics')
          .select(`
            *,
            service_types_master (
              name,
              category
            )
          `)
          .eq('market_id', marketId)
          .order('demand_score', { ascending: false })
          .limit(10)
        
        if (metricsData) {
          // Transform to match expected format
          demandData = metricsData.map(m => ({
            ...m,
            service_name: m.service_types_master?.name || 'Unknown'
          }))
        }
      }

      // Get insights
      const { data: insights, error: insightsError } = await supabase
        .from('market_insights')
        .select('*')
        .eq('market_id', marketId)
        .gte('valid_until', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(5)

      if (insightsError) throw insightsError

      // Get data source info
      // Commented out - market_data_sources table doesn't exist
      // const { data: dataSources } = await supabase
      //   .from('market_data_sources')
      //   .select('*')
      //   .eq('market_id', marketId)
      //   .single()

      return {
        demandMetrics: demandData || [],
        insights: insights || [],
        lastUpdated: new Date().toISOString(), // Use current time as fallback
        dataQuality: 75 // Default quality score
      }
    } catch (error) {
      console.error('Error fetching market intelligence:', error)
      return {
        demandMetrics: [],
        insights: [],
        lastUpdated: null,
        dataQuality: 0
      }
    }
  }

  // Get trends data for a specific service
  static async getTrendsDataForService(marketId, serviceTypeId) {
    try {
      const { data } = await supabase
        .from('service_demand_metrics')
        .select('trends_data')
        .eq('market_id', marketId)
        .eq('service_type_id', serviceTypeId)
        .single()
      
      return data?.trends_data
    } catch (error) {
      return null
    }
  }

  // Estimate search volume based on service type and market
  static estimateSearchVolume(serviceName, market) {
    // Base search volumes by service type (monthly searches)
    const baseVolumes = {
      'Roofing Contractors': 12000,
      'Kitchen Remodeling': 8000,
      'Bathroom Remodeling': 6500,
      'HVAC Installation': 9000,
      'Painting Companies': 7500,
      'Landscaping Design': 5500,
      'Solar Installers': 4500,
      'Pool Builders': 3500,
      'Fence Contractors': 4000,
      'Concrete Contractors': 5000,
      'Window & Door': 5500,
      'Tree Services': 4500,
      'Deck Builders': 3000,
      'Flooring Contractors': 4500,
      'Garage Door Services': 3500,
      'Smart Home Installation': 2000,
      'EV Charging Installation': 1500,
      'Artificial Turf Installation': 1000,
      'Water Features Installation': 800,
      'Custom Lighting Design': 1200
    }
    
    const baseVolume = baseVolumes[serviceName] || 2000
    
    // Adjust by market size
    let marketMultiplier = 1
    if (market.market_type === 'LARGE') {
      marketMultiplier = 2.5
    } else if (market.market_type === 'MEDIUM') {
      marketMultiplier = 1.5
    } else if (market.market_type === 'SMALL') {
      marketMultiplier = 0.5
    }
    
    // Add some randomization (±20%)
    const randomFactor = 0.8 + Math.random() * 0.4
    
    return Math.round(baseVolume * marketMultiplier * randomFactor)
  }

  // Update demand data for all markets
  static async updateAllMarkets(includeExternalData = false) {
    try {
      const { data: markets, error } = await supabase
        .from('market_coverage')
        .select('id')

      if (error) throw error

      let updated = 0
      for (const market of markets) {
        try {
          await this.calculateDemandScores(market.id, includeExternalData)
          updated++
        } catch (err) {
          console.error(`Error updating market ${market.id}:`, err)
        }
      }

      return { success: true, marketsUpdated: updated }
    } catch (error) {
      console.error('Error updating all markets:', error)
      return { success: false, error: error.message }
    }
  }
}