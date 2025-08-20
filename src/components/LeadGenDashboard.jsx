import { useState, useEffect } from 'react'
import { TrendingUp, Users, Target, Calendar } from 'lucide-react'
import { supabase } from '../lib/supabase'
import './LeadGenDashboard.css'

function LeadGenDashboard({ session }) {
  const [stats, setStats] = useState({
    totalLeads: 0,
    newThisWeek: 0,
    conversionRate: 12.5,
    activeMarkets: 0
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [topMarkets, setTopMarkets] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Only load dashboard if we have a valid session
    if (!session || !session.user) {
      console.log('No valid session, skipping dashboard load')
      return
    }
    
    // Only load dashboard if we're not in OAuth flow
    const isOAuthCallback = window.location.hash.includes('access_token') || 
                           window.location.search.includes('code=') ||
                           window.location.pathname.includes('callback')
    
    if (isOAuthCallback) {
      console.log('OAuth callback detected, skipping dashboard load')
      return
    }
    
    // Load dashboard data with delay to ensure auth is complete
    const timer = setTimeout(() => {
      // Load each section independently and asynchronously
      loadDashboardStats().catch(err => {
        console.error('Stats loading failed:', err)
        setLoading(false)
      })
      loadRecentActivity().catch(err => console.error('Activity loading failed:', err))
      loadTopMarkets().catch(err => console.error('Markets loading failed:', err))
    }, 1000) // Reduced back to 1 second since we have session check
    
    return () => clearTimeout(timer)
  }, [session])

  const loadDashboardStats = async () => {
    try {
      setLoading(true)
      
      // Check if we're in OAuth callback process
      if (window.location.hash.includes('access_token') || window.location.search.includes('code=')) {
        console.log('OAuth callback in progress, skipping dashboard load')
        setLoading(false)
        return
      }
      
      // Get current user with timeout protection
      const userPromise = supabase.auth.getUser()
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Auth timeout')), 3000)
      )
      
      const { data: { user }, error: userError } = await Promise.race([
        userPromise,
        timeoutPromise
      ])
      
      if (userError) {
        console.error('Error getting user:', userError)
        setLoading(false)
        return
      }
      if (!user) {
        console.log('No user found, skipping dashboard load')
        setLoading(false)
        return
      }
      
      // Get user's markets first to filter leads properly (with timeout)
      const marketsPromise = supabase.from('markets').select('id')
      const marketsTimeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Markets query timeout')), 5000)
      )
      
      const { data: userMarkets, error: marketsError } = await Promise.race([
        marketsPromise,
        marketsTimeoutPromise
      ])
      
      if (marketsError) {
        console.error('Error loading markets:', marketsError)
        // Set default stats instead of failing
        setStats({
          totalLeads: 0,
          newThisWeek: 0,
          conversionRate: 0,
          activeMarkets: 0
        })
        return
      }
      
      const marketIds = userMarkets?.map(m => m.id) || []
      
      if (marketIds.length === 0) {
        setStats({
          totalLeads: 0,
          newThisWeek: 0,
          conversionRate: 0,
          activeMarkets: 0
        })
        return
      }
      
      // Get total leads count for user's markets
      const { count: totalLeads } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .in('market_id', marketIds)

      // Get leads from this week for user's markets
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      
      const { count: newThisWeek } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .in('market_id', marketIds)
        .gte('created_at', oneWeekAgo.toISOString())

      // Get active markets count (markets with leads)
      const { data: marketsWithLeads } = await supabase
        .from('leads')
        .select('market_id')
        .in('market_id', marketIds)
        .not('market_id', 'is', null)

      const uniqueActiveMarkets = new Set(marketsWithLeads?.map(lead => lead.market_id) || [])
      
      // Calculate basic conversion rate (leads with email/phone vs total)
      const { data: leadsWithContact } = await supabase
        .from('leads')
        .select('id')
        .in('market_id', marketIds)
        .or('email.neq.,phone.neq.')
      
      const conversionRate = totalLeads > 0 ? 
        Math.round(((leadsWithContact?.length || 0) / totalLeads) * 100) : 0
      
      setStats({
        totalLeads: totalLeads || 0,
        newThisWeek: newThisWeek || 0,
        conversionRate: conversionRate,
        activeMarkets: uniqueActiveMarkets.size
      })
    } catch (error) {
      console.error('Error loading dashboard stats:', error)
      setStats({
        totalLeads: 0,
        newThisWeek: 0,
        conversionRate: 0,
        activeMarkets: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const loadRecentActivity = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get user's markets
      const { data: userMarkets } = await supabase
        .from('markets')
        .select('id, name, state')
      
      const marketIds = userMarkets?.map(m => m.id) || []
      if (marketIds.length === 0) return

      // Get recent leads (last 7 days) with market info
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const { data: recentLeads } = await supabase
        .from('leads')
        .select('created_at, market_id, city, state')
        .in('market_id', marketIds)
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(10)

      // Group by day and market
      const activityMap = new Map()
      
      recentLeads?.forEach(lead => {
        const date = new Date(lead.created_at).toDateString()
        const market = userMarkets?.find(m => m.id === lead.market_id)
        const key = `${date}-${lead.market_id}`
        
        if (activityMap.has(key)) {
          activityMap.get(key).count++
        } else {
          activityMap.set(key, {
            date: lead.created_at,
            market: market ? `${market.name}, ${market.state}` : `${lead.city}, ${lead.state}`,
            count: 1
          })
        }
      })

      const activity = Array.from(activityMap.values())
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)

      setRecentActivity(activity)
    } catch (error) {
      console.error('Error loading recent activity:', error)
    }
  }

  const loadTopMarkets = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get markets with lead counts
      const { data: marketsWithCounts } = await supabase
        .from('markets')
        .select(`
          id,
          name,
          state,
          leads:leads(count)
        `)
        .order('name')

      const topMarkets = marketsWithCounts
        ?.map(market => ({
          name: `${market.name}, ${market.state}`,
          count: market.leads?.[0]?.count || 0
        }))
        .filter(market => market.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5) || []

      setTopMarkets(topMarkets)
    } catch (error) {
      console.error('Error loading top markets:', error)
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
        <div className="dashboard-grid">
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Recent Activity</h2>
            </div>
            {loading ? (
              <div className="loading-state">Loading...</div>
            ) : recentActivity.length > 0 ? (
              <div className="recent-list">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="recent-item">
                    <div className="item-info">
                      <div className="item-name">
                        {activity.count} new leads from {activity.market}
                      </div>
                      <div className="item-meta">
                        {new Date(activity.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="item-count">+{activity.count}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No recent activity in the last 7 days</p>
              </div>
            )}
          </div>

          <div className="dashboard-section">
            <div className="section-header">
              <h2>Top Markets</h2>
            </div>
            {loading ? (
              <div className="loading-state">Loading...</div>
            ) : topMarkets.length > 0 ? (
              <div className="recent-list">
                {topMarkets.map((market, index) => (
                  <div key={index} className="recent-item">
                    <div className="item-info">
                      <div className="item-name">{market.name}</div>
                      <div className="item-meta">#{index + 1} by lead count</div>
                    </div>
                    <div className="item-count">{market.count.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No markets with leads found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LeadGenDashboard