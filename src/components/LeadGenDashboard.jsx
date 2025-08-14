import { useState, useEffect } from 'react'
import { TrendingUp, Users, Target, Calendar } from 'lucide-react'
import { supabase } from '../lib/supabase'
import './LeadGenDashboard.css'

function LeadGenDashboard() {
  const [stats, setStats] = useState({
    totalLeads: 0,
    newThisWeek: 0,
    conversionRate: 12.5,
    activeMarkets: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardStats()
  }, [])

  const loadDashboardStats = async () => {
    try {
      setLoading(true)
      
      // Get total leads count
      const { count: totalLeads } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })

      // Get leads from this week
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      
      const { count: newThisWeek } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', oneWeekAgo.toISOString())

      // Get active markets count
      const { data: marketsData } = await supabase
        .from('leads')
        .select('market_id')
        .not('market_id', 'is', null)
        .not('market_id', 'eq', '')

      const uniqueMarkets = new Set(marketsData?.map(lead => lead.market_id) || [])
      
      setStats({
        totalLeads: totalLeads || 0,
        newThisWeek: newThisWeek || 0,
        conversionRate: 12.5, // This would need actual conversion tracking
        activeMarkets: uniqueMarkets.size
      })
    } catch (error) {
      console.error('Error loading dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Lead Generation Dashboard</h1>
        <p>Track your lead collection performance across all markets</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.totalLeads.toLocaleString()}</span>
            <span className="stat-label">Total Leads</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">+{stats.newThisWeek}</span>
            <span className="stat-label">New This Week</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon yellow">
            <Target size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.conversionRate}%</span>
            <span className="stat-label">Conversion Rate</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <Calendar size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.activeMarkets}</span>
            <span className="stat-label">Active Markets</span>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="chart-container">
          <h2>Lead Collection Trend</h2>
          <div className="chart-placeholder">
            <p>Chart visualization will be implemented here</p>
          </div>
        </div>

        <div className="recent-activity">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            <div className="activity-item">
              <span className="activity-time">2 hours ago</span>
              <span className="activity-text">253 leads imported from Fort Collins</span>
            </div>
            <div className="activity-item">
              <span className="activity-time">5 hours ago</span>
              <span className="activity-text">Facebook Ads sync completed</span>
            </div>
            <div className="activity-item">
              <span className="activity-time">1 day ago</span>
              <span className="activity-text">New market added: Steamboat Springs</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LeadGenDashboard