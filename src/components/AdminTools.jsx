import React, { useState } from 'react'
import { Settings, RefreshCw } from 'lucide-react'
import { MarketIntelligenceService } from '../services/marketIntelligence'
import './AdminTools.css'

function AdminTools() {
  const [isOpen, setIsOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateResult, setUpdateResult] = useState(null)



  const updateAllMarketsWithOptions = async (includeExternal) => {
    try {
      setIsUpdating(true)
      setUpdateResult(null)
      
      const result = await MarketIntelligenceService.updateAllMarkets(includeExternal)
      
      if (result.success) {
        setUpdateResult({
          type: 'success',
          message: `Successfully updated ${result.marketsUpdated} markets${includeExternal ? ' with all data sources' : ' with lead data only'}`
        })
      } else {
        setUpdateResult({
          type: 'error',
          message: `Error: ${result.error}`
        })
      }
    } catch (error) {
      setUpdateResult({
        type: 'error',
        message: `Error: ${error.message}`
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <>
      <button 
        className="admin-tools-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="Admin Tools"
      >
        <Settings size={20} />
      </button>

      {isOpen && (
        <div className="admin-tools-panel">
          <div className="admin-header">
            <h3>Admin Tools</h3>
            <button 
              className="close-btn"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
          </div>

          <div className="admin-section">
            <h4>Market Intelligence</h4>
            <p>Update demand scores for all markets based on current lead data.</p>
            
            <div className="update-options">
              <button 
                className="btn btn-primary"
                onClick={() => updateAllMarketsWithOptions(false)}
                disabled={isUpdating}
              >
                <RefreshCw size={16} className={isUpdating ? 'spinning' : ''} />
                {isUpdating ? 'Updating...' : 'Quick Update (Lead Data)'}
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => updateAllMarketsWithOptions(true)}
                disabled={isUpdating}
              >
                <RefreshCw size={16} className={isUpdating ? 'spinning' : ''} />
                {isUpdating ? 'Updating...' : 'Full Update (All Sources)'}
              </button>
            </div>

            {updateResult && (
              <div className={`update-result ${updateResult.type}`}>
                {updateResult.message}
              </div>
            )}
          </div>

          <div className="admin-section">
            <h4>Data Sources</h4>
            <ul className="data-sources">
              <li>
                <span className="source-name">Lead Performance</span>
                <span className="source-status active">Active</span>
              </li>
              <li>
                <span className="source-name">Google Trends (Simulated)</span>
                <span className="source-status active">Active</span>
              </li>
              <li>
                <span className="source-name">Competitor Analysis</span>
                <span className="source-status active">Active</span>
              </li>
              <li>
                <span className="source-name">Economic Indicators</span>
                <span className="source-status active">Active</span>
              </li>
              <li>
                <span className="source-name">Climate Data</span>
                <span className="source-status active">Active</span>
              </li>
            </ul>
          </div>


        </div>
      )}
    </>
  )
}

export default AdminTools