import { useState, useEffect } from 'react'
import { TrendingUp, Users, Target, Calendar } from 'lucide-react'
import { supabase } from '../lib/supabase'
import BlueOceanInsights from './BlueOceanInsights'
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
      
      console.log('Dashboard - Current user ID:', user.id)
      
      // TEMPORARY: Show all leads regardless of user/market association
      // This is to debug the data issue
      
      // Get total leads count (all leads in database)
      const { count: totalLeads, error: leadsError } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
      
      if (leadsError) {
        console.error('Error counting leads:', leadsError)
      }
      
      console.log('Total leads in database:', totalLeads)

      // Get leads from this week (all leads)
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      
      const { count: newThisWeek } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', oneWeekAgo.toISOString())

      // Get active markets count using RPC or fallback
      const { data: marketCountData, error: marketCountError } = await supabase
        .rpc('get_unique_cities_count')
      
      let uniqueActiveMarkets = 0
      
      if (marketCountError || !marketCountData) {
        // Fallback: Get all cities to count them
        const { data: allCities } = await supabase
          .from('leads')
          .select('city, state')
          .not('city', 'is', null)
        
        const uniqueCitySet = new Set(allCities?.map(lead => `${lead.city}, ${lead.state}`) || [])
        uniqueActiveMarkets = uniqueCitySet.size
        console.log('Active markets (fallback):', uniqueActiveMarkets)
      } else {
        uniqueActiveMarkets = marketCountData
        console.log('Active markets (RPC):', uniqueActiveMarkets)
      }
      
      // Calculate basic conversion rate (leads with email/phone vs total)
      const { count: leadsWithPhone } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .not('phone', 'is', null)
      
      // Use leads with phone as the metric since most have phone
      const leadsWithContact = leadsWithPhone || 0
      
      console.log('Leads with contact:', leadsWithContact, 'Total leads:', totalLeads)
      
      const conversionRate = totalLeads > 0 ? 
        Math.round((leadsWithContact / totalLeads) * 100) : 0
      
      setStats({
        totalLeads: totalLeads || 0,
        newThisWeek: newThisWeek || 0,
        conversionRate: conversionRate,
        activeMarkets: uniqueActiveMarkets
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
      // Get recent leads (last 7 days) - showing all leads
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const { data: recentLeads } = await supabase
        .from('leads')
        .select('created_at, market_id, city, state')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(1000)  // Get more leads

      // Group by day and market more accurately
      const activityMap = new Map()
      
      recentLeads?.forEach(lead => {
        // Use local date to avoid timezone issues
        const leadDate = new Date(lead.created_at)
        const dateKey = leadDate.toLocaleDateString()
        const marketLocation = `${lead.city}, ${lead.state}`
        const key = `${dateKey}-${marketLocation}`
        
        if (activityMap.has(key)) {
          activityMap.get(key).count++
        } else {
          activityMap.set(key, {
            date: lead.created_at,
            market: marketLocation,
            count: 1,
            dateKey: dateKey
          })
        }
      })

      // Sort by date and count, show top activities
      const activity = Array.from(activityMap.values())
        .sort((a, b) => {
          const dateCompare = new Date(b.date) - new Date(a.date)
          if (dateCompare !== 0) return dateCompare
          return b.count - a.count  // Secondary sort by count
        })
        .slice(0, 5)

      setRecentActivity(activity)
    } catch (error) {
      console.error('Error loading recent activity:', error)
    }
  }

  const loadTopMarkets = async () => {
    try {
      // Get lead counts grouped by city/state
      const { data: leadCounts, error } = await supabase
        .rpc('get_lead_counts_by_city')
      
      if (error) {
        console.error('RPC error, using fallback:', error)
        // Fallback: manually group leads
        const { data: allLeads } = await supabase
          .from('leads')
          .select('city, state')
        
        const cityCountMap = new Map()
        allLeads?.forEach(lead => {
          const key = `${lead.city}, ${lead.state}`
          cityCountMap.set(key, (cityCountMap.get(key) || 0) + 1)
        })
        
        const topMarkets = Array.from(cityCountMap.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
        
        setTopMarkets(topMarkets)
      } else {
        // Use RPC results
        const topMarkets = leadCounts
          ?.map(item => ({
            name: `${item.city}, ${item.state}`,
            count: item.lead_count || 0
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5) || []
        
        setTopMarkets(topMarkets)
      }
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

      {/* Blue Ocean Insights */}
      <BlueOceanInsights />
    </div>
  )
}

export default LeadGenDashboard