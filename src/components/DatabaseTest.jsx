import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function DatabaseTest() {
  const [testResults, setTestResults] = useState([])
  const [loading, setLoading] = useState(false)

  const runTests = async () => {
    setLoading(true)
    const results = []

    try {
      // Test 1: Basic connection
      results.push({ test: 'Supabase Connection', status: 'Testing...', data: null })
      
      // Test 2: Count total leads
      const { data: countData, error: countError } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
      
      if (countError) {
        results.push({ 
          test: 'Count Leads', 
          status: 'Error', 
          data: countError.message 
        })
      } else {
        results.push({ 
          test: 'Count Leads', 
          status: 'Success', 
          data: `${countData} total leads` 
        })
      }

      // Test 3: Get sample market data
      const { data: sampleData, error: sampleError } = await supabase
        .from('leads')
        .select('market_id, city, state')
        .not('market_id', 'is', null)
        .limit(5)
      
      if (sampleError) {
        results.push({ 
          test: 'Sample Market Data', 
          status: 'Error', 
          data: sampleError.message 
        })
      } else {
        results.push({ 
          test: 'Sample Market Data', 
          status: 'Success', 
          data: `${sampleData?.length || 0} records: ${JSON.stringify(sampleData?.slice(0, 2), null, 2)}` 
        })
      }

      // Test 4: Group by market_id
      const { data: groupData, error: groupError } = await supabase
        .from('leads')
        .select('market_id, city, state')
        .not('market_id', 'is', null)
        .limit(100)
      
      if (groupError) {
        results.push({ 
          test: 'Group Market Data', 
          status: 'Error', 
          data: groupError.message 
        })
      } else {
        const marketStats = {}
        groupData?.forEach(lead => {
          if (!marketStats[lead.market_id]) {
            marketStats[lead.market_id] = {
              market_id: lead.market_id,
              city: lead.city,
              state: lead.state,
              count: 0
            }
          }
          marketStats[lead.market_id].count++
        })
        
        const topMarkets = Object.values(marketStats)
          .sort((a, b) => b.count - a.count)
          .slice(0, 3)
        
        results.push({ 
          test: 'Group Market Data', 
          status: 'Success', 
          data: `${Object.keys(marketStats).length} unique markets. Top 3: ${JSON.stringify(topMarkets, null, 2)}` 
        })
      }

    } catch (err) {
      results.push({ 
        test: 'General Error', 
        status: 'Error', 
        data: err.message 
      })
    }

    setTestResults(results)
    setLoading(false)
  }

  useEffect(() => {
    runTests()
  }, [])

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Database Connection Test</h2>
      <button onClick={runTests} disabled={loading} style={{ marginBottom: '20px', padding: '10px 20px' }}>
        {loading ? 'Running Tests...' : 'Run Tests Again'}
      </button>
      
      <div>
        {testResults.map((result, index) => (
          <div key={index} style={{ 
            marginBottom: '15px', 
            padding: '15px', 
            border: '1px solid #ccc', 
            borderRadius: '5px',
            backgroundColor: result.status === 'Success' ? '#d4edda' : result.status === 'Error' ? '#f8d7da' : '#fff3cd'
          }}>
            <h4>{result.test}: <span style={{ color: result.status === 'Success' ? 'green' : result.status === 'Error' ? 'red' : 'orange' }}>{result.status}</span></h4>
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px', maxHeight: '200px', overflow: 'auto' }}>
              {result.data}
            </pre>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DatabaseTest
