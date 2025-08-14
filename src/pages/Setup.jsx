import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { sendMessageToClaude } from '../lib/claude'
import { openAIService, googleMapsService, censusService } from '../lib/apiServices'
import { CheckCircle, XCircle, AlertCircle, Database, Loader, Key, Bot, Map, BarChart3 } from 'lucide-react'
import './Setup.css'

function Setup() {
  const [status, setStatus] = useState({
    connection: null,
    tables: {},
    sampleData: null,
    apis: {}
  })
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState([])
  const [activeTab, setActiveTab] = useState('database')

  const addLog = (message, type = 'info') => {
    setLogs(prev => [...prev, { message, type, timestamp: new Date().toISOString() }])
  }

  const testConnection = async () => {
    addLog('Testing Supabase connection...', 'info')
    try {
      const { data, error } = await supabase.from('markets').select('count').limit(1)
      
      if (error && error.code === '42P01') {
        addLog('Tables not found. Please create them first.', 'error')
        return false
      } else if (error) {
        addLog(`Connection error: ${error.message}`, 'error')
        return false
      }
      
      addLog('Successfully connected to Supabase!', 'success')
      return true
    } catch (err) {
      addLog(`Failed to connect: ${err.message}`, 'error')
      return false
    }
  }

  const checkTables = async () => {
    const tables = ['markets', 'leads', 'import_history', 'market_phases']
    const results = {}
    
    addLog('Checking tables...', 'info')
    
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
        
        if (error) {
          results[table] = { exists: false, error: error.message }
          addLog(`${table}: Not found`, 'warning')
        } else {
          results[table] = { exists: true, count }
          addLog(`${table}: Found (${count || 0} records)`, 'success')
        }
      } catch (err) {
        results[table] = { exists: false, error: err.message }
        addLog(`${table}: Error - ${err.message}`, 'error')
      }
    }
    
    return results
  }

  const insertSampleData = async () => {
    try {
      addLog('Inserting sample data...', 'info')
      
      // Insert sample markets
      const markets = [
        {
          name: 'Fort Collins',
          state: 'CO',
          type: 'SMALL',
          region: 'Mountain',
          service_types: ['Painting', 'Deck Building', 'Turf Installation'],
          coverage_percentage: 75
        },
        {
          name: 'Boulder',
          state: 'CO',
          type: 'SMALL',
          region: 'Mountain',
          service_types: ['Painting', 'Landscaping'],
          coverage_percentage: 60
        },
        {
          name: 'Phoenix',
          state: 'AZ',
          type: 'MEGA',
          region: 'Southwest',
          service_types: ['Painting', 'Pool Service', 'HVAC'],
          coverage_percentage: 45
        }
      ]
      
      const { data: marketData, error: marketError } = await supabase
        .from('markets')
        .upsert(markets, { onConflict: 'name,state' })
        .select()
      
      if (marketError) {
        addLog(`Markets: Error - ${marketError.message}`, 'error')
        return false
      } else {
        addLog(`Markets: Inserted ${marketData.length} sample markets`, 'success')
      }
      
      // Insert sample leads for Fort Collins
      if (marketData && marketData.length > 0) {
        const fortCollinsMarket = marketData.find(m => m.name === 'Fort Collins')
        
        if (fortCollinsMarket) {
          const sampleLeads = [
            {
              market_id: fortCollinsMarket.id,
              name: 'ABC Painting Co',
              address: '123 Main St, Fort Collins, CO 80521',
              city: 'Fort Collins',
              state: 'CO',
              zip: '80521',
              phone: '(970) 555-0123',
              website: 'https://abcpainting.example.com',
              category: 'Painting Contractors',
              rating: 4.5,
              reviews: 127,
              source: 'apify',
              verified: true
            },
            {
              market_id: fortCollinsMarket.id,
              name: 'Mountain Deck Builders',
              address: '456 Oak Ave, Fort Collins, CO 80524',
              city: 'Fort Collins',
              state: 'CO',
              zip: '80524',
              phone: '(970) 555-0456',
              category: 'Deck Builders',
              rating: 4.8,
              reviews: 89,
              source: 'apify',
              verified: true
            }
          ]
          
          const { data: leadData, error: leadError } = await supabase
            .from('leads')
            .upsert(sampleLeads, { onConflict: 'name,address' })
            .select()
          
          if (leadError) {
            addLog(`Leads: Error - ${leadError.message}`, 'error')
          } else {
            addLog(`Leads: Inserted ${leadData.length} sample leads`, 'success')
          }
        }
      }
      
      return true
    } catch (err) {
      addLog(`Error inserting sample data: ${err.message}`, 'error')
      return false
    }
  }

  const testClaudeAPI = async () => {
    addLog('Testing Claude API...', 'info')
    try {
      const response = await sendMessageToClaude('Hello, this is a test message. Please respond with "API test successful".')
      if (response && response.includes('API test successful')) {
        addLog('Claude API: Working correctly', 'success')
        return true
      } else {
        addLog('Claude API: Connected but unexpected response', 'warning')
        return true
      }
    } catch (error) {
      addLog(`Claude API: ${error.message}`, 'error')
      return false
    }
  }

  const testOpenAI = async () => {
    addLog('Testing OpenAI API...', 'info')
    try {
      const response = await openAIService.extractLeadData('Test company: ABC Construction, Phone: 555-1234')
      addLog('OpenAI API: Working correctly', 'success')
      return true
    } catch (error) {
      addLog(`OpenAI API: ${error.message}`, 'error')
      return false
    }
  }

  const testGoogleMaps = async () => {
    addLog('Testing Google Maps API...', 'info')
    try {
      const results = await googleMapsService.searchBusinesses('construction', 'Denver, CO')
      if (results && results.length > 0) {
        addLog(`Google Maps API: Found ${results.length} results`, 'success')
        return true
      } else {
        addLog('Google Maps API: Connected but no results', 'warning')
        return true
      }
    } catch (error) {
      addLog(`Google Maps API: ${error.message}`, 'error')
      return false
    }
  }

  const testCensusAPI = async () => {
    addLog('Testing Census API...', 'info')
    try {
      const data = await censusService.getPopulationData('06') // California
      if (data && data.length > 0) {
        addLog('Census API: Working correctly', 'success')
        return true
      } else {
        addLog('Census API: Connected but no data', 'warning')
        return true
      }
    } catch (error) {
      addLog(`Census API: ${error.message}`, 'error')
      return false
    }
  }

  const testAllAPIs = async () => {
    setLoading(true)
    setLogs([])
    
    const apiResults = {}
    
    // Test each API
    apiResults.claude = await testClaudeAPI()
    apiResults.openai = await testOpenAI()
    apiResults.googleMaps = await testGoogleMaps()
    apiResults.census = await testCensusAPI()
    
    setStatus(prev => ({ ...prev, apis: apiResults }))
    
    const workingAPIs = Object.values(apiResults).filter(Boolean).length
    const totalAPIs = Object.keys(apiResults).length
    
    addLog(`API Testing Complete: ${workingAPIs}/${totalAPIs} APIs working`, 
           workingAPIs === totalAPIs ? 'success' : 'warning')
    
    setLoading(false)
  }

  const runSetup = async () => {
    setLoading(true)
    setLogs([])
    
    // Test connection
    const connected = await testConnection()
    setStatus(prev => ({ ...prev, connection: connected }))
    
    if (!connected) {
      setLoading(false)
      return
    }
    
    // Check tables
    const tables = await checkTables()
    setStatus(prev => ({ ...prev, tables }))
    
    const allTablesExist = Object.values(tables).every(t => t.exists)
    
    if (allTablesExist) {
      addLog('All tables exist!', 'success')
      
      // Insert sample data
      const sampleSuccess = await insertSampleData()
      setStatus(prev => ({ ...prev, sampleData: sampleSuccess }))
      
      if (sampleSuccess) {
        addLog('Setup complete! You can now use the application.', 'success')
      }
    } else {
      addLog('Some tables are missing. Please create them using the SQL schema.', 'warning')
    }
    
    setLoading(false)
  }

  const getLogIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={16} className="log-icon success" />
      case 'error':
        return <XCircle size={16} className="log-icon error" />
      case 'warning':
        return <AlertCircle size={16} className="log-icon warning" />
      default:
        return <Database size={16} className="log-icon info" />
    }
  }

  return (
    <div className="setup-page">
      <div className="setup-container">
        <div className="setup-header">
          <h1>System Setup & Configuration</h1>
          <p>Test your database connection, API integrations, and configure your environment</p>
        </div>

        <div className="setup-tabs">
          <button 
            className={`tab-button ${activeTab === 'database' ? 'active' : ''}`}
            onClick={() => setActiveTab('database')}
          >
            <Database size={16} />
            Database Setup
          </button>
          <button 
            className={`tab-button ${activeTab === 'apis' ? 'active' : ''}`}
            onClick={() => setActiveTab('apis')}
          >
            <Key size={16} />
            API Testing
          </button>
        </div>

        <div className="setup-content">
          {activeTab === 'database' && (
            <div className="setup-actions">
              <button 
                className="btn btn-primary"
                onClick={runSetup}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader size={16} className="spinning" />
                    Running Setup...
                  </>
                ) : (
                  <>
                    <Database size={16} />
                    Run Database Setup
                  </>
                )}
              </button>
            </div>
          )}

          {activeTab === 'apis' && (
            <div className="setup-actions">
              <button 
                className="btn btn-primary"
                onClick={testAllAPIs}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader size={16} className="spinning" />
                    Testing APIs...
                  </>
                ) : (
                  <>
                    <Key size={16} />
                    Test All APIs
                  </>
                )}
              </button>
            </div>
          )}

          {logs.length > 0 && (
            <div className="setup-logs">
              <h3>Setup Logs</h3>
              <div className="logs-container">
                {logs.map((log, index) => (
                  <div key={index} className={`log-entry ${log.type}`}>
                    {getLogIcon(log.type)}
                    <span className="log-message">{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'database' && Object.keys(status.tables).length > 0 && (
            <div className="setup-status">
              <h3>Table Status</h3>
              <div className="status-grid">
                {Object.entries(status.tables).map(([table, info]) => (
                  <div key={table} className="status-item">
                    <div className="status-header">
                      {info.exists ? (
                        <CheckCircle size={20} className="status-icon success" />
                      ) : (
                        <XCircle size={20} className="status-icon error" />
                      )}
                      <span className="status-name">{table}</span>
                    </div>
                    {info.exists && (
                      <span className="status-count">{info.count || 0} records</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'apis' && Object.keys(status.apis).length > 0 && (
            <div className="setup-status">
              <h3>API Status</h3>
              <div className="status-grid">
                <div className="status-item">
                  <div className="status-header">
                    {status.apis.claude ? (
                      <CheckCircle size={20} className="status-icon success" />
                    ) : (
                      <XCircle size={20} className="status-icon error" />
                    )}
                    <Bot size={16} />
                    <span className="status-name">Claude AI</span>
                  </div>
                  <span className="status-description">
                    {status.apis.claude ? 'Connected' : 'Check API key'}
                  </span>
                </div>
                
                <div className="status-item">
                  <div className="status-header">
                    {status.apis.openai ? (
                      <CheckCircle size={20} className="status-icon success" />
                    ) : (
                      <XCircle size={20} className="status-icon error" />
                    )}
                    <Bot size={16} />
                    <span className="status-name">OpenAI</span>
                  </div>
                  <span className="status-description">
                    {status.apis.openai ? 'Connected' : 'Check API key'}
                  </span>
                </div>

                <div className="status-item">
                  <div className="status-header">
                    {status.apis.googleMaps ? (
                      <CheckCircle size={20} className="status-icon success" />
                    ) : (
                      <XCircle size={20} className="status-icon error" />
                    )}
                    <Map size={16} />
                    <span className="status-name">Google Maps</span>
                  </div>
                  <span className="status-description">
                    {status.apis.googleMaps ? 'Connected' : 'Check API key'}
                  </span>
                </div>

                <div className="status-item">
                  <div className="status-header">
                    {status.apis.census ? (
                      <CheckCircle size={20} className="status-icon success" />
                    ) : (
                      <XCircle size={20} className="status-icon error" />
                    )}
                    <BarChart3 size={16} />
                    <span className="status-name">US Census</span>
                  </div>
                  <span className="status-description">
                    {status.apis.census ? 'Connected' : 'Check API key'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="setup-instructions">
              <h3>If Tables Are Missing</h3>
              <ol>
                <li>Go to your Supabase dashboard</li>
                <li>Navigate to the SQL Editor</li>
                <li>Copy the contents of <code>supabase/schema.sql</code></li>
                <li>Paste and run the SQL to create all tables</li>
                <li>Come back here and run setup again</li>
              </ol>
            </div>
          )}

          {activeTab === 'apis' && (
            <div className="setup-instructions">
              <h3>API Configuration Guide</h3>
              
              <div className="api-config-section">
                <h4>🤖 Claude AI (Anthropic)</h4>
                <ol>
                  <li>Visit <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer">console.anthropic.com</a></li>
                  <li>Create an account and get your API key</li>
                  <li>Add to your <code>.env</code> file: <code>VITE_ANTHROPIC_API_KEY=sk-ant-your-key-here</code></li>
                </ol>
              </div>

              <div className="api-config-section">
                <h4>🧠 OpenAI</h4>
                <ol>
                  <li>Visit <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">platform.openai.com/api-keys</a></li>
                  <li>Create a new API key</li>
                  <li>Add to your <code>.env</code> file: <code>VITE_OPENAI_API_KEY=sk-proj-your-key-here</code></li>
                </ol>
              </div>

              <div className="api-config-section">
                <h4>🗺️ Google Maps API</h4>
                <ol>
                  <li>Visit <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer">Google Cloud Console</a></li>
                  <li>Enable Places API and Maps JavaScript API</li>
                  <li>Create an API key and restrict it to your domain</li>
                  <li>Add to your <code>.env</code> file: <code>VITE_GOOGLE_MAPS_API_KEY=your-key-here</code></li>
                </ol>
              </div>

              <div className="api-config-section">
                <h4>📊 US Census Bureau API</h4>
                <ol>
                  <li>Visit <a href="https://api.census.gov/data/key_signup.html" target="_blank" rel="noopener noreferrer">api.census.gov/data/key_signup.html</a></li>
                  <li>Request a free API key</li>
                  <li>Add to your <code>.env</code> file: <code>VITE_CENSUS_API_KEY=your-key-here</code></li>
                </ol>
              </div>

              <div className="env-example">
                <h4>Complete .env File Example</h4>
                <pre><code>{`# Anthropic Claude API
VITE_ANTHROPIC_API_KEY=sk-ant-your-key-here

# OpenAI API
VITE_OPENAI_API_KEY=sk-proj-your-key-here

# Google Maps API
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-key

# US Census API
VITE_CENSUS_API_KEY=your-census-key

# Supabase (already configured)
VITE_SUPABASE_URL=https://dicscsehiegqsmtwewis.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-key

# Additional APIs (already configured)
VITE_APIFY_API_TOKEN=your-apify-token
VITE_SCRAPINGBEE_API_KEY=your-scrapingbee-key`}</code></pre>
              </div>

              <div className="setup-note">
                <p><strong>Note:</strong> After updating your <code>.env</code> file, restart your development server and test the APIs again.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Setup
