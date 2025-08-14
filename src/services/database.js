import { supabase } from '../lib/supabase'

class DatabaseService {
  // Markets/Cities operations
  async getMarkets() {
    try {
      const { data, error } = await supabase
        .from('markets')
        .select(`
          *,
          leads:leads(count)
        `)
        .order('state', { ascending: true })
        .order('name', { ascending: true })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching markets:', error)
      return []
    }
  }

  async createMarket(market) {
    try {
      const { data, error } = await supabase
        .from('markets')
        .insert([market])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating market:', error)
      throw error
    }
  }

  async updateMarket(id, updates) {
    try {
      const { data, error } = await supabase
        .from('markets')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating market:', error)
      throw error
    }
  }

  // Leads operations
  async getLeads(filters = {}) {
    try {
      let query = supabase.from('leads').select('*')

      if (filters.marketId) {
        query = query.eq('market_id', filters.marketId)
      }
      if (filters.city) {
        query = query.eq('city', filters.city)
      }
      if (filters.state) {
        query = query.eq('state', filters.state)
      }
      if (filters.source) {
        query = query.eq('source', filters.source)
      }
      if (filters.category) {
        query = query.eq('category', filters.category)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching leads:', error)
      return []
    }
  }

  async createLeads(leads) {
    try {
      // Remove duplicates based on name and address
      const uniqueLeads = this.deduplicateLeads(leads)

      const { data, error } = await supabase
        .from('leads')
        .insert(uniqueLeads)
        .select()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating leads:', error)
      throw error
    }
  }

  async updateLead(id, updates) {
    try {
      const { data, error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating lead:', error)
      throw error
    }
  }

  async deleteLead(id) {
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting lead:', error)
      throw error
    }
  }

  // Import operations
  async getImportHistory(limit = 50) {
    try {
      const { data, error } = await supabase
        .from('import_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching import history:', error)
      return []
    }
  }

  async createImportRecord(importData) {
    try {
      const { data, error } = await supabase
        .from('import_history')
        .insert([importData])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating import record:', error)
      throw error
    }
  }

  // Statistics and analytics
  async getMarketStats(marketId) {
    try {
      const { data, error } = await supabase
        .rpc('get_market_stats', { market_id: marketId })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching market stats:', error)
      return null
    }
  }

  async getDashboardStats() {
    try {
      const { data, error } = await supabase
        .rpc('get_dashboard_stats')

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      return null
    }
  }

  // Helper functions
  deduplicateLeads(leads) {
    const seen = new Set()
    return leads.filter(lead => {
      const key = `${lead.name}-${lead.address}`.toLowerCase()
      if (seen.has(key)) {
        return false
      }
      seen.add(key)
      return true
    })
  }

  // Real-time subscriptions
  subscribeToLeads(callback) {
    const subscription = supabase
      .channel('leads_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'leads' },
        callback
      )
      .subscribe()

    return subscription
  }

  subscribeToMarkets(callback) {
    const subscription = supabase
      .channel('markets_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'markets' },
        callback
      )
      .subscribe()

    return subscription
  }

  // Cleanup subscription
  unsubscribe(subscription) {
    if (subscription) {
      supabase.removeChannel(subscription)
    }
  }
}

export default new DatabaseService()
