import { useState } from 'react'
import { Search, ChevronRight, ChevronDown, LogOut } from 'lucide-react'
import './MarketsSidebar.css'

function MarketsSidebar({ markets, selectedMarket, onSelectMarket, expandedStates, onToggleState, getTotalLeads, getTotalCities, onLogout, user }) {
  const [searchTerm, setSearchTerm] = useState('')

  const handleCityClick = (city, state) => {
    onSelectMarket({
      ...city,
      state: state,
      location: 'Mountain' // This should come from data
    })
  }

  const filteredMarkets = markets.map(stateGroup => ({
    ...stateGroup,
    cities: stateGroup.cities.filter(city => 
      city.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(stateGroup => stateGroup.cities.length > 0)

  return (
    <div className="markets-sidebar">
      <div className="sidebar-header">
        <h2>Markets</h2>
        <div className="search-container">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search markets..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="markets-list">
        {filteredMarkets.map((stateGroup) => (
          <div key={stateGroup.state} className="state-group">
            <div 
              className="state-header"
              onClick={() => onToggleState(stateGroup.state)}
            >
              <div className="state-info">
                <span className="state-name">{stateGroup.state}</span>
                <span className="state-stats">
                  {getTotalCities(stateGroup.state)} cities · {getTotalLeads(stateGroup.state)} leads
                </span>
              </div>
              {expandedStates[stateGroup.state] ? 
                <ChevronDown size={16} /> : 
                <ChevronRight size={16} />
              }
            </div>

            {expandedStates[stateGroup.state] && (
              <div className="cities-list">
                {stateGroup.cities.map((city) => (
                  <div
                    key={city.name}
                    className={`city-item ${selectedMarket?.name === city.name && selectedMarket?.state === stateGroup.state ? 'selected' : ''}`}
                    onClick={() => handleCityClick(city, stateGroup.state)}
                  >
                    <div className="city-main">
                      <div className="city-info">
                        <span className="city-name">{city.name}</span>
                        <span className={`badge badge-${city.type.toLowerCase()}`}>
                          {city.type}
                        </span>
                      </div>
                      <span className="city-leads">{city.leads} leads</span>
                    </div>
                    {city.serviceTypes && (
                      <div className="city-services">{city.serviceTypes}</div>
                    )}
                    <div className="city-coverage">
                      <div className="coverage-bar">
                        <div 
                          className="coverage-fill" 
                          style={{ width: `${city.coverage}%` }}
                        />
                      </div>
                      <span className="coverage-percent">{city.coverage}%</span>
                      <ChevronRight size={14} className="city-arrow" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Mobile Logout Button */}
      {onLogout && user && (
        <div className="sidebar-footer">
          <button className="logout-button" onClick={onLogout}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
          <div className="user-info">
            <span className="user-email">{user.email}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default MarketsSidebar
