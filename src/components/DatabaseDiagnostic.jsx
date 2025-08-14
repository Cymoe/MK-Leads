import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Database, AlertCircle, CheckCircle, XCircle } from 'lucide-react'

function DatabaseDiagnostic() {
  const [diagnostics, setDiagnostics] = useState({
    leads: null,
    markets: null,
    sampleLeads: [],
    uniqueMarketIds: [],
    loading: true
  })

  useEffect(() => {
    runDiagnostics()
  }, [])

  const runDiagnostics = async () => {
    try {
      console.log('Running database diagnostics...')
      
      // 1. Check total leads
      const { count: leadCount, error: leadError } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
      
      // 2. Get sample leads to see structure
      const { data: sampleLeads, error: sampleError } = await supabase
        .from('leads')
        .select('*')
        .limit(5)
      
      // 3. Get unique market_ids
      const { data: marketData, error: marketError } = await supabase
        .from('leads')
        .select('market_id')
        .not('market_id', 'is', null)
        .limit(100)
      
      // 4. Check if markets table exists
      const { count: marketTableCount, error: marketTableError } = await supabase
        .from('markets')
        .select('*', { count: 'exact', head: true })
      
      // Process unique market_ids
      const uniqueIds = [...new Set(marketData?.map(d => d.market_id) || [])]
      
      setDiagnostics({
        leads: {
          count: leadCount,
          error: leadError?.message
        },
        markets: {
          count: marketTableCount,
          error: marketTableError?.message
        },
        sampleLeads: sampleLeads || [],
        uniqueMarketIds: uniqueIds,
        loading: false
      })
      
      console.log('Diagnostics complete:', {
        leadCount,
        marketTableCount,
        sampleLeads,
        uniqueMarketIds: uniqueIds
      })
      
    } catch (err) {
      console.error('Diagnostic error:', err)
      setDiagnostics(prev => ({ ...prev, loading: false, error: err.message }))
    }
  }

  if (diagnostics.loading) {
    return (
      <div style={{ padding: '20px', color: 'white' }}>
        <h2>Running Database Diagnostics...</h2>
      </div>
    )
  }

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: 'rgba(30, 41, 59, 0.5)',
      borderRadius: '12px',
      margin: '20px',
      color: 'white'
    }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        <Database size={24} />
        Database Diagnostic Report
      </h2>
      
      {/* Leads Table Status */}
      <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {diagnostics.leads?.error ? <XCircle size={20} color="#ef4444" /> : <CheckCircle size={20} color="#10b981" />}
          Leads Table
        </h3>
        {diagnostics.leads?.error ? (
          <p style={{ color: '#ef4444' }}>Error: {diagnostics.leads.error}</p>
        ) : (
          <p>Total Records: <strong>{diagnostics.leads?.count || 0}</strong></p>
        )}
      </div>

      {/* Markets Table Status */}
      <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {diagnostics.markets?.error ? <AlertCircle size={20} color="#eab308" /> : <CheckCircle size={20} color="#10b981" />}
          Markets Table
        </h3>
        {diagnostics.markets?.error ? (
          <p style={{ color: '#eab308' }}>Warning: {diagnostics.markets.error} (Table might not exist)</p>
        ) : (
          <p>Total Records: <strong>{diagnostics.markets?.count || 0}</strong></p>
        )}
      </div>

      {/* Unique Market IDs */}
      <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
        <h3>Unique Market IDs Found: {diagnostics.uniqueMarketIds.length}</h3>
        {diagnostics.uniqueMarketIds.length > 0 ? (
          <ul style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
            {diagnostics.uniqueMarketIds.slice(0, 10).map(id => (
              <li key={id}>{id}</li>
            ))}
            {diagnostics.uniqueMarketIds.length > 10 && (
              <li>... and {diagnostics.uniqueMarketIds.length - 10} more</li>
            )}
          </ul>
        ) : (
          <p style={{ color: '#eab308' }}>
            <AlertCircle size={16} style={{ display: 'inline', marginRight: '8px' }} />
            No market_ids found. Leads might not have market_id values set.
          </p>
        )}
      </div>

      {/* Sample Lead Structure */}
      <div style={{ padding: '16px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
        <h3>Sample Lead Structure</h3>
        {diagnostics.sampleLeads.length > 0 ? (
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
            <p>First lead fields:</p>
            <pre style={{ 
              backgroundColor: 'rgba(0,0,0,0.5)', 
              padding: '12px', 
              borderRadius: '4px',
              overflow: 'auto',
              maxHeight: '200px'
            }}>
              {JSON.stringify(diagnostics.sampleLeads[0], null, 2)}
            </pre>
          </div>
        ) : (
          <p style={{ color: '#eab308' }}>No leads found in database</p>
        )}
      </div>

      {/* Recommendations */}
      <div style={{ 
        marginTop: '20px', 
        padding: '16px', 
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: '8px' 
      }}>
        <h3 style={{ color: '#60a5fa' }}>Recommendations:</h3>
        <ul style={{ fontSize: '14px', lineHeight: '1.8' }}>
          {diagnostics.leads?.count === 0 && (
            <li>Your leads table is empty. Import some leads to get started.</li>
          )}
          {diagnostics.uniqueMarketIds.length === 0 && diagnostics.leads?.count > 0 && (
            <li>Your leads don't have market_id values. You may need to update your import process to include market_ids.</li>
          )}
          {diagnostics.markets?.error && (
            <li>The markets table doesn't exist. Run the setup SQL to create it.</li>
          )}
          {diagnostics.uniqueMarketIds.length > 0 && (
            <li>Found {diagnostics.uniqueMarketIds.length} unique markets. The app should display these in the sidebar.</li>
          )}
        </ul>
      </div>

      <button 
        onClick={runDiagnostics}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer'
        }}
      >
        Re-run Diagnostics
      </button>
    </div>
  )
}

export default DatabaseDiagnostic
