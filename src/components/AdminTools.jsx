import React, { useState, useEffect } from 'react'
import { Settings, RefreshCw, ChevronUp, ChevronDown, Save } from 'lucide-react'
import { MarketIntelligenceService } from '../services/marketIntelligence'
import { supabase } from '../lib/supabase'
import './AdminTools.css'

function AdminTools() {
  const [isOpen, setIsOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateResult, setUpdateResult] = useState(null)
  const [servicePriorities, setServicePriorities] = useState([])
  const [savingPriorities, setSavingPriorities] = useState(false)
  const [priorityMessage, setPriorityMessage] = useState(null)

  // Load service priorities when panel opens
  useEffect(() => {
    if (isOpen) {
      loadServicePriorities()
    }
  }, [isOpen])

  const loadServicePriorities = async () => {
    try {
      // Get all service types with their current priorities
      const { data, error } = await supabase
        .from('service_type_priorities')
        .select('*')
        .order('priority', { ascending: false })
      
      if (error) throw error
      
      if (data && data.length > 0) {
        setServicePriorities(data)
      } else {
        // If no priorities exist, create default ones
        const defaultServices = [
          'Deck Builders', 'Concrete Contractors', 'Window & Door', 'Roofing Contractors',
          'Tree Services', 'Solar Installers', 'Fence Contractors', 'Pool Builders',
          'Turf Installers', 'Kitchen Remodeling', 'Bathroom Remodeling', 'Whole Home Remodel',
          'Home Addition', 'Exterior Contractors', 'Hardscape Contractors', 'Landscaping Design',
          'Outdoor Kitchen', 'Painting Companies', 'Smart Home', 'Epoxy Flooring',
          'Garage Door Services', 'Cabinet Makers', 'Tile & Stone', 'Paving & Asphalt',
          'Custom Home Builders', 'Flooring Contractors'
        ]
        
        const newPriorities = defaultServices.map((service, index) => ({
          service_type: service,
          priority: defaultServices.length - index,
          is_custom: false
        }))
        
        setServicePriorities(newPriorities)
      }
    } catch (error) {
      console.error('Error loading service priorities:', error)
    }
  }

  const moveService = (index, direction) => {
    const newPriorities = [...servicePriorities]
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    
    if (swapIndex >= 0 && swapIndex < newPriorities.length) {
      // Swap the items
      [newPriorities[index], newPriorities[swapIndex]] = [newPriorities[swapIndex], newPriorities[index]]
      
      // Update priority values
      newPriorities.forEach((service, idx) => {
        service.priority = newPriorities.length - idx
      })
      
      setServicePriorities(newPriorities)
    }
  }

  const saveServicePriorities = async () => {
    try {
      setSavingPriorities(true)
      setPriorityMessage(null)
      
      // Delete existing priorities
      const { error: deleteError } = await supabase
        .from('service_type_priorities')
        .delete()
        .gt('id', 0) // Delete all rows
      
      if (deleteError) throw deleteError
      
      // Insert new priorities
      const { error: insertError } = await supabase
        .from('service_type_priorities')
        .insert(servicePriorities.map(sp => ({
          service_type: sp.service_type,
          priority: sp.priority,
          is_custom: true
        })))
      
      if (insertError) throw insertError
      
      setPriorityMessage({
        type: 'success',
        message: 'Service priorities saved successfully!'
      })
      
      // Clear message after 3 seconds
      setTimeout(() => setPriorityMessage(null), 3000)
      
    } catch (error) {
      console.error('Error saving priorities:', error)
      setPriorityMessage({
        type: 'error',
        message: `Error saving priorities: ${error.message}`
      })
    } finally {
      setSavingPriorities(false)
    }
  }

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

          <div className="admin-section">
            <h4>Service Type Priorities</h4>
            <p>Drag services up or down to adjust their priority in market analysis.</p>
            
            <div className="service-priority-list">
              {servicePriorities.map((service, index) => (
                <div key={service.service_type} className="priority-item">
                  <span className="priority-number">{index + 1}</span>
                  <span className="service-name">{service.service_type}</span>
                  <div className="priority-controls">
                    <button
                      className="priority-btn"
                      onClick={() => moveService(index, 'up')}
                      disabled={index === 0}
                      title="Move up"
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      className="priority-btn"
                      onClick={() => moveService(index, 'down')}
                      disabled={index === servicePriorities.length - 1}
                      title="Move down"
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <button
              className="btn btn-primary save-priorities"
              onClick={saveServicePriorities}
              disabled={savingPriorities}
            >
              <Save size={16} />
              {savingPriorities ? 'Saving...' : 'Save Priorities'}
            </button>
            
            {priorityMessage && (
              <div className={`update-result ${priorityMessage.type}`}>
                {priorityMessage.message}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default AdminTools