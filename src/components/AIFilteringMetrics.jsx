import { useState, useEffect } from 'react'
import { Bot, TrendingUp, TrendingDown, AlertCircle, DollarSign, BarChart3 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import './AIFilteringMetrics.css'

function AIFilteringMetrics({ session }) {
  const [metrics, setMetrics] = useState({
    totalFiltered: 0,
    totalProcessed: 0,
    filteringRate: 0,
    costEstimate: 0,
    serviceBreakdown: {},
    recentSessions: []
  })
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('week') // week, month, all

  useEffect(() => {
    if (session?.user?.id) {
      fetchMetrics()
    }
  }, [session, timeRange])

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      
      // Calculate date range
      const now = new Date()
      let startDate = new Date()
      if (timeRange === 'week') {
        startDate.setDate(now.getDate() - 7)
      } else if (timeRange === 'month') {
        startDate.setMonth(now.getMonth() - 1)
      } else {
        startDate = new Date('2024-01-01') // All time
      }

      // Fetch AI filtering logs
      const { data: logs, error } = await supabase
        .from('ai_filtering_logs')
        .select('*')
        .eq('user_id', session.user.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })

      if (error) throw error

      // Calculate metrics
      const totalProcessed = logs.reduce((sum, log) => sum + (log.total_processed || 0), 0)
      const totalFiltered = logs.reduce((sum, log) => sum + (log.total_filtered || 0), 0)
      const filteringRate = totalProcessed > 0 ? (totalFiltered / totalProcessed * 100).toFixed(1) : 0

      // Calculate cost (using GPT-3.5 pricing by default)
      const avgTokensPerBusiness = 300 // input + output
      const costPerMillionTokens = 2.00 // blended rate
      const costEstimate = (totalProcessed * avgTokensPerBusiness / 1000000 * costPerMillionTokens).toFixed(2)

      // Service breakdown
      const serviceBreakdown = {}
      logs.forEach(log => {
        const service = log.service_type || 'Unknown'
        if (!serviceBreakdown[service]) {
          serviceBreakdown[service] = {
            processed: 0,
            filtered: 0,
            rate: 0
          }
        }
        serviceBreakdown[service].processed += log.total_processed || 0
        serviceBreakdown[service].filtered += log.total_filtered || 0
      })

      // Calculate rates for each service
      Object.keys(serviceBreakdown).forEach(service => {
        const data = serviceBreakdown[service]
        data.rate = data.processed > 0 ? (data.filtered / data.processed * 100).toFixed(1) : 0
      })

      // Get recent sessions (last 10)
      const recentSessions = logs.slice(0, 10).map(log => ({
        id: log.id,
        date: new Date(log.created_at).toLocaleDateString(),
        time: new Date(log.created_at).toLocaleTimeString(),
        serviceType: log.service_type,
        processed: log.total_processed,
        filtered: log.total_filtered,
        rate: log.total_processed > 0 ? (log.total_filtered / log.total_processed * 100).toFixed(1) : 0,
        market: log.market_name
      }))

      setMetrics({
        totalFiltered,
        totalProcessed,
        filteringRate,
        costEstimate,
        serviceBreakdown,
        recentSessions
      })
    } catch (error) {
      console.error('Error fetching AI metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="ai-metrics-container">
        <div className="loading-state">
          <Bot size={24} className="animate-pulse" />
          <p>Loading AI filtering metrics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="ai-metrics-container">
      <div className="metrics-header">
        <div className="header-title">
          <Bot size={24} />
          <h2>AI Filtering Analytics</h2>
        </div>
        <div className="time-range-selector">
          <button 
            className={timeRange === 'week' ? 'active' : ''}
            onClick={() => setTimeRange('week')}
          >
            Last 7 Days
          </button>
          <button 
            className={timeRange === 'month' ? 'active' : ''}
            onClick={() => setTimeRange('month')}
          >
            Last 30 Days
          </button>
          <button 
            className={timeRange === 'all' ? 'active' : ''}
            onClick={() => setTimeRange('all')}
          >
            All Time
          </button>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">
            <BarChart3 size={20} />
          </div>
          <div className="metric-content">
            <h3>Total Processed</h3>
            <p className="metric-value">{metrics.totalProcessed.toLocaleString()}</p>
            <p className="metric-label">businesses analyzed</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <AlertCircle size={20} />
          </div>
          <div className="metric-content">
            <h3>Total Filtered</h3>
            <p className="metric-value">{metrics.totalFiltered.toLocaleString()}</p>
            <p className="metric-label">non-service businesses removed</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            {metrics.filteringRate > 5 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
          </div>
          <div className="metric-content">
            <h3>Filtering Rate</h3>
            <p className="metric-value">{metrics.filteringRate}%</p>
            <p className="metric-label">of businesses filtered out</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <DollarSign size={20} />
          </div>
          <div className="metric-content">
            <h3>Estimated Cost</h3>
            <p className="metric-value">${metrics.costEstimate}</p>
            <p className="metric-label">AI processing costs</p>
          </div>
        </div>
      </div>

      {Object.keys(metrics.serviceBreakdown).length > 0 && (
        <div className="service-breakdown">
          <h3>Filtering by Service Type</h3>
          <div className="breakdown-table">
            <table>
              <thead>
                <tr>
                  <th>Service Type</th>
                  <th>Processed</th>
                  <th>Filtered</th>
                  <th>Rate</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(metrics.serviceBreakdown)
                  .sort((a, b) => b[1].processed - a[1].processed)
                  .map(([service, data]) => (
                    <tr key={service}>
                      <td>{service}</td>
                      <td>{data.processed.toLocaleString()}</td>
                      <td>{data.filtered.toLocaleString()}</td>
                      <td>
                        <span className={`rate-badge ${data.rate > 10 ? 'high' : 'low'}`}>
                          {data.rate}%
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {metrics.recentSessions.length > 0 && (
        <div className="recent-sessions">
          <h3>Recent Filtering Sessions</h3>
          <div className="sessions-list">
            {metrics.recentSessions.map(session => (
              <div key={session.id} className="session-item">
                <div className="session-header">
                  <span className="session-service">{session.serviceType}</span>
                  <span className="session-date">{session.date} {session.time}</span>
                </div>
                <div className="session-stats">
                  <span>{session.market}</span>
                  <span>{session.processed} processed</span>
                  <span>{session.filtered} filtered ({session.rate}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default AIFilteringMetrics