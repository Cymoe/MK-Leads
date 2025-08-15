import React, { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, AlertCircle, BarChart3, Target, RefreshCw, Users } from 'lucide-react'
import { MarketIntelligenceService } from '../services/marketIntelligence'
import './MarketIntelligence.css'

function MarketIntelligence({ market }) {
  const [loading, setLoading] = useState(true)
  const [marketData, setMarketData] = useState(null)
  const [timeRange, setTimeRange] = useState('30d')
  const [isUpdating, setIsUpdating] = useState(false)

  const fetchMarketIntelligence = async () => {
    if (!market?.id) return

    try {
      setLoading(true)
      const data = await MarketIntelligenceService.getMarketIntelligence(market.id)
      
      // Transform data for display
      const transformed = {
        topServices: data.demandMetrics.map(metric => ({
          name: metric.service_name,
          demand: metric.demand_score || 0,
          trend: metric.trend_direction || 'stable',
          change: metric.trend_percentage ? 
            `${metric.trend_percentage > 0 ? '+' : ''}${metric.trend_percentage}%` : '0%',
          searches: metric.search_volume || 0,
          competition: metric.saturation_level || metric.competition_level || 'unknown',
          trendsScore: metric.google_trends_score || null,
          trendsChange: metric.trends_monthly_change || null,
          competitors: metric.total_providers || null,
          avgRating: metric.competitor_avg_rating || null
        })),
        insights: data.insights.map(i => i.insight_text),
        lastUpdated: data.lastUpdated,
        dataQuality: data.dataQuality,
        economicData: {
          medianHomeValue: data.demandMetrics[0]?.median_home_value,
          medianIncome: data.demandMetrics[0]?.median_household_income,
          populationGrowth: data.demandMetrics[0]?.population_growth_rate
        }
      }

      // Group competitors by level
      const competitors = { high: 0, medium: 0, low: 0 }
      data.demandMetrics.forEach(metric => {
        if (metric.competition_level) {
          competitors[metric.competition_level] += metric.competitor_count || 0
        }
      })
      transformed.competitors = competitors

      setMarketData(transformed)
    } catch (error) {
      console.error('Error fetching market intelligence:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateDemandData = async (includeExternal = false) => {
    if (!market?.id || isUpdating) return

    try {
      setIsUpdating(true)
      await MarketIntelligenceService.calculateDemandScores(market.id, includeExternal)
      await fetchMarketIntelligence()
    } catch (error) {
      console.error('Error updating demand data:', error)
      alert('Error updating demand data. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  useEffect(() => {
    fetchMarketIntelligence()
  }, [market]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="market-intelligence loading">
        <div className="intel-header">
          <h3>
            <BarChart3 size={20} />
            Loading Market Intelligence...
          </h3>
        </div>
      </div>
    )
  }

  if (!marketData || marketData.topServices.length === 0) {
    return (
      <div className="market-intelligence empty">
        <div className="intel-header">
          <h3>
            <BarChart3 size={20} />
            Market Intelligence
          </h3>
          <button 
            className="btn-icon"
            onClick={updateDemandData}
            disabled={isUpdating}
            title="Calculate demand scores"
          >
            <RefreshCw size={16} className={isUpdating ? 'spinning' : ''} />
          </button>
        </div>
        <div className="empty-state">
          <p>No demand data available yet.</p>
          <div className="button-group">
            <button 
              className="btn btn-primary"
              onClick={() => updateDemandData(false)}
              disabled={isUpdating}
            >
              {isUpdating ? 'Calculating...' : 'Quick Analysis (Lead Data Only)'}
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => updateDemandData(true)}
              disabled={isUpdating}
            >
              {isUpdating ? 'Calculating...' : 'Full Analysis (All Data Sources)'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const getDemandColor = (demand) => {
    if (demand >= 80) return '#22c55e'
    if (demand >= 60) return '#f59e0b'
    return '#ef4444'
  }

  return (
    <div className="market-intelligence">
      <div className="intel-header">
        <h3>
          <BarChart3 size={20} />
          Market Intelligence
        </h3>
        <div className="header-actions">
          <div className="time-selector">
            <button 
              className={timeRange === '7d' ? 'active' : ''} 
              onClick={() => setTimeRange('7d')}
            >
              7D
            </button>
            <button 
              className={timeRange === '30d' ? 'active' : ''} 
              onClick={() => setTimeRange('30d')}
            >
              30D
            </button>
            <button 
              className={timeRange === '90d' ? 'active' : ''} 
              onClick={() => setTimeRange('90d')}
            >
              90D
            </button>
          </div>
          <button 
            className="btn-icon"
            onClick={updateDemandData}
            disabled={isUpdating}
            title="Update demand data"
          >
            <RefreshCw size={16} className={isUpdating ? 'spinning' : ''} />
          </button>
        </div>
      </div>

      <div className="demand-grid">
        <h4>Real-Time Service Demand</h4>
        {marketData.topServices.map((service, index) => (
          <div key={service.name} className="demand-item">
            <div className="demand-rank">#{index + 1}</div>
            <div className="demand-info">
              <div className="demand-name">{service.name}</div>
              <div className="demand-stats">
                <span className="searches">{service.searches.toLocaleString()} searches/mo</span>
                {service.trendsScore && (
                  <span className="trends-score" title="Google Trends Score">
                    <BarChart3 size={12} />
                    {service.trendsScore}/100
                  </span>
                )}
                {service.competitors && (
                  <span className="competitors" title={`${service.competitors} providers`}>
                    <Users size={12} />
                    {service.competitors}
                  </span>
                )}
                <span className={`trend ${service.trend}`}>
                  {service.trend === 'up' ? <TrendingUp size={14} /> : 
                   service.trend === 'down' ? <TrendingDown size={14} /> : null}
                  {service.change}
                </span>
              </div>
            </div>
            <div className="demand-bar">
              <div 
                className="demand-fill" 
                style={{ 
                  width: `${service.demand}%`,
                  backgroundColor: getDemandColor(service.demand)
                }}
              />
              <span className="demand-score">{service.demand}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="market-insights">
        <h4>
          <AlertCircle size={16} />
          Market Insights
        </h4>
        <ul>
          {marketData.insights.map((insight, i) => (
            <li key={i}>{insight}</li>
          ))}
        </ul>
      </div>

      {marketData.economicData.medianHomeValue && (
        <div className="economic-indicators">
          <h4>Economic Indicators</h4>
          <div className="indicators-grid">
            <div className="indicator">
              <span className="indicator-label">Median Home Value</span>
              <span className="indicator-value">
                ${(marketData.economicData.medianHomeValue / 1000).toFixed(0)}K
              </span>
            </div>
            <div className="indicator">
              <span className="indicator-label">Median Income</span>
              <span className="indicator-value">
                ${(marketData.economicData.medianIncome / 1000).toFixed(0)}K
              </span>
            </div>
            <div className="indicator">
              <span className="indicator-label">Population Growth</span>
              <span className="indicator-value">
                {marketData.economicData.populationGrowth > 0 ? '+' : ''}
                {marketData.economicData.populationGrowth?.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="competition-meter">
        <h4>Competition Analysis</h4>
        <div className="competition-bars">
          <div className="comp-level">
            <span>High Competition</span>
            <div className="comp-bar high">
              <div className="comp-fill" style={{ width: '75%' }} />
              <span>{marketData.competitors.high} providers</span>
            </div>
          </div>
          <div className="comp-level">
            <span>Medium Competition</span>
            <div className="comp-bar medium">
              <div className="comp-fill" style={{ width: '45%' }} />
              <span>{marketData.competitors.medium} providers</span>
            </div>
          </div>
          <div className="comp-level">
            <span>Low Competition</span>
            <div className="comp-bar low">
              <div className="comp-fill" style={{ width: '85%' }} />
              <span>{marketData.competitors.low} providers</span>
            </div>
          </div>
        </div>
      </div>

      <div className="intel-footer">
        <p className="update-time">Last updated: 2 minutes ago</p>
        <button className="btn-link">
          <Target size={14} />
          Adjust Priorities Based on Data
        </button>
      </div>
    </div>
  )
}

export default MarketIntelligence