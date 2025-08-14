import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import DatabaseService from '../services/database'

// Hook to fetch markets with real-time updates
export function useMarkets() {
  const [markets, setMarkets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchMarkets()

    // Subscribe to real-time changes
    const subscription = DatabaseService.subscribeToMarkets((payload) => {
      console.log('Market change received:', payload)
      fetchMarkets() // Refetch on any change
    })

    return () => {
      DatabaseService.unsubscribe(subscription)
    }
  }, [])

  const fetchMarkets = async () => {
    try {
      setLoading(true)
      const data = await DatabaseService.getMarkets()
      setMarkets(data)
      setError(null)
    } catch (err) {
      console.error('Error fetching markets:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { markets, loading, error, refetch: fetchMarkets }
}

// Hook to fetch leads with filters
export function useLeads(filters = {}) {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchLeads()

    // Subscribe to real-time changes
    const subscription = DatabaseService.subscribeToLeads((payload) => {
      console.log('Lead change received:', payload)
      fetchLeads() // Refetch on any change
    })

    return () => {
      DatabaseService.unsubscribe(subscription)
    }
  }, [JSON.stringify(filters)])

  const fetchLeads = async () => {
    try {
      setLoading(true)
      const data = await DatabaseService.getLeads(filters)
      setLeads(data)
      setError(null)
    } catch (err) {
      console.error('Error fetching leads:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createLead = async (lead) => {
    try {
      const data = await DatabaseService.createLeads([lead])
      await fetchLeads() // Refetch to update list
      return data
    } catch (err) {
      console.error('Error creating lead:', err)
      throw err
    }
  }

  const updateLead = async (id, updates) => {
    try {
      const data = await DatabaseService.updateLead(id, updates)
      await fetchLeads() // Refetch to update list
      return data
    } catch (err) {
      console.error('Error updating lead:', err)
      throw err
    }
  }

  const deleteLead = async (id) => {
    try {
      await DatabaseService.deleteLead(id)
      await fetchLeads() // Refetch to update list
    } catch (err) {
      console.error('Error deleting lead:', err)
      throw err
    }
  }

  return { 
    leads, 
    loading, 
    error, 
    refetch: fetchLeads,
    createLead,
    updateLead,
    deleteLead
  }
}

// Hook to fetch dashboard statistics
export function useDashboardStats() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchStats()

    // Refetch stats every 30 seconds
    const interval = setInterval(fetchStats, 30000)

    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const data = await DatabaseService.getDashboardStats()
      setStats(data)
      setError(null)
    } catch (err) {
      console.error('Error fetching stats:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { stats, loading, error, refetch: fetchStats }
}

// Hook to handle Apify imports
export function useApifyImport() {
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState(null)

  const importFromApify = async (datasetIds, marketId, serviceType) => {
    try {
      setImporting(true)
      setError(null)

      // Import leads from Apify
      const ApifyService = (await import('../services/apify')).default
      const apify = new ApifyService()
      const leads = await apify.batchImportLeads(datasetIds, serviceType)

      // Add market_id to all leads
      const leadsWithMarket = leads.map(lead => ({
        ...lead,
        market_id: marketId
      }))

      // Save to database
      const savedLeads = await DatabaseService.createLeads(leadsWithMarket)

      // Create import record
      await DatabaseService.createImportRecord({
        market_id: marketId,
        source: 'apify',
        source_dataset_id: datasetIds.join(','),
        leads_imported: savedLeads.length,
        leads_skipped: leads.length - savedLeads.length,
        status: 'completed',
        metadata: { serviceType, datasetIds }
      })

      return savedLeads
    } catch (err) {
      console.error('Error importing from Apify:', err)
      setError(err.message)
      throw err
    } finally {
      setImporting(false)
    }
  }

  return { importFromApify, importing, error }
}
