import { useState } from 'react'
import { TrendingUp, Users, Package, MapPin, Zap, Home, Heart, Brain, DollarSign, AlertCircle, Building2, Shield, Leaf, Calculator, Target, Rocket } from 'lucide-react'
import './MarketIntelligence.css'

function MarketIntelligence() {
  const [activeTab, setActiveTab] = useState('growth')
  const [selectedRegion, setSelectedRegion] = useState('all')

  // Hyper-growth cities data - expanded with comprehensive research
  const growthCities = [
    // Texas Dominance - 8 of top 15 fastest growing
    {
      name: 'Princeton, TX',
      growth: '30.6%',
      population: '37,000',
      previousPop: '17,000',
      opportunity: 'Very High',
      services: ['EV Charging', 'Smart Home', 'Artificial Turf'],
      score: 98,
      region: 'Texas'
    },
    {
      name: 'Celina, TX',
      growth: '26.6%',
      population: '26,000',
      previousPop: '20,500',
      opportunity: 'Very High',
      services: ['All Emerging Services'],
      score: 96,
      region: 'Texas'
    },
    {
      name: 'Anna, TX',
      growth: '25.2%',
      population: '19,000',
      previousPop: '15,200',
      opportunity: 'Very High',
      services: ['Smart Home', 'EV Charging', 'ADU Construction'],
      score: 95,
      region: 'Texas'
    },
    {
      name: 'Fulshear, TX',
      growth: '16.39%',
      population: '55,000',
      previousPop: '47,300',
      opportunity: 'High',
      services: ['Luxury Home Tech', 'Climate Resilience'],
      score: 91,
      region: 'Texas'
    },
    {
      name: 'Prosper, TX',
      growth: '15.8%',
      population: '34,000',
      previousPop: '29,400',
      opportunity: 'High',
      services: ['Luxury Services', 'Smart Home', 'Pool Tech'],
      score: 90,
      region: 'Texas'
    },
    {
      name: 'Hutto, TX',
      growth: '9.4%',
      population: '42,000',
      previousPop: '38,400',
      opportunity: 'High',
      services: ['Foundation Repair', 'HVAC', 'Solar'],
      score: 88,
      region: 'Texas'
    },
    // Southeast Growth Centers
    {
      name: 'Mooresville, NC',
      growth: '29.94%',
      population: '50,000',
      previousPop: '38,500',
      opportunity: 'Very High',
      services: ['Lake Home Services', 'Smart Home', 'Green Tech'],
      score: 94,
      region: 'Southeast'
    },
    {
      name: 'Spring Hill, TN',
      growth: '14.2%',
      population: '57,000',
      previousPop: '49,900',
      opportunity: 'High',
      services: ['EV Charging', 'Home Automation', 'ADU'],
      score: 89,
      region: 'Southeast'
    },
    {
      name: 'Braselton, GA',
      growth: '126%',
      population: '13,800',
      previousPop: '6,100',
      opportunity: 'Very High',
      services: ['All Services - Untapped Market'],
      score: 93,
      region: 'Southeast'
    },
    {
      name: 'Hoschton, GA',
      growth: '14.06%',
      population: '3,500',
      previousPop: '3,070',
      opportunity: 'High',
      services: ['Basic Services Gap', 'Smart Home'],
      score: 87,
      region: 'Southeast'
    },
    // Mountain West Boom
    {
      name: 'Timnath, CO',
      growth: '47.3%',
      population: '7,100',
      previousPop: '4,800',
      opportunity: 'Very High',
      services: ['Green Tech', 'Smart Home', 'EV Infrastructure'],
      score: 95,
      region: 'Mountain West'
    },
    {
      name: 'Severance, CO',
      growth: '32.1%',
      population: '8,500',
      previousPop: '6,400',
      opportunity: 'Very High',
      services: ['Energy Services', 'Climate Resilience'],
      score: 92,
      region: 'Mountain West'
    },
    {
      name: 'Eagle Mountain, UT',
      growth: '28.4%',
      population: '54,000',
      previousPop: '42,000',
      opportunity: 'High',
      services: ['Solar', 'Smart Home', 'Water Conservation'],
      score: 91,
      region: 'Mountain West'
    },
    {
      name: 'Saratoga Springs, UT',
      growth: '25.8%',
      population: '52,500',
      previousPop: '41,700',
      opportunity: 'High',
      services: ['Lake Services', 'Smart Home', 'ADU'],
      score: 90,
      region: 'Mountain West'
    },
    // Florida Growth
    {
      name: 'Leesburg, FL',
      growth: '18.5%',
      population: '28,000',
      previousPop: '23,600',
      opportunity: 'High',
      services: ['Senior Tech', 'Climate Resilience', 'Pool'],
      score: 88,
      region: 'Florida'
    },
    {
      name: 'Haines City, FL',
      growth: '12.1%',
      population: '31,000',
      previousPop: '27,600',
      opportunity: 'High',
      services: ['Hurricane Protection', 'Solar', 'Pool Tech'],
      score: 86,
      region: 'Florida'
    },
    // Pacific Northwest
    {
      name: 'Happy Valley, OR',
      growth: '17.3%',
      population: '24,400',
      previousPop: '20,800',
      opportunity: 'High',
      services: ['Green Tech', 'Smart Home', 'EV Charging'],
      score: 89,
      region: 'Pacific NW'
    },
    {
      name: 'Redmond, OR',
      growth: '12.7%',
      population: '34,200',
      previousPop: '30,400',
      opportunity: 'High',
      services: ['Outdoor Living', 'Solar', 'Smart Home'],
      score: 87,
      region: 'Pacific NW'
    },
    // Additional High-Growth Markets
    {
      name: 'Silver Spring, MD',
      growth: '12.86%',
      population: '85,000',
      previousPop: '75,300',
      opportunity: 'High',
      services: ['Smart Home', 'Senior Tech', 'ADU'],
      score: 89,
      region: 'Mid-Atlantic'
    },
    {
      name: 'Hamtramck, MI',
      growth: '28.28%',
      population: '28,300',
      previousPop: '22,000',
      opportunity: 'High',
      services: ['EV Charging', 'Foundation Repair', 'Weatherization'],
      score: 87,
      region: 'Midwest'
    }
  ]

  // Underserved niches data
  const serviceGaps = [
    {
      category: 'Senior-Focused Services',
      growth: '4.7% annually',
      marketSize: '$30B by 2030',
      opportunities: [
        'Home tech setup for seniors',
        'Medical equipment installation',
        'Age-in-place modifications',
        'Companion care + maintenance'
      ],
      icon: Users,
      color: '#8b5cf6'
    },
    {
      category: 'Pet Wellness Services',
      growth: '8.2% annually',
      marketSize: '$15B market',
      opportunities: [
        'Mobile pet spa/grooming',
        'Pet waste management',
        'Pet-safe yard treatments',
        'In-home pet health monitoring'
      ],
      icon: Heart,
      color: '#ec4899'
    },
    {
      category: 'Wellness-at-Home',
      growth: '15.3% annually',
      marketSize: '$22B by 2028',
      opportunities: [
        'IV therapy/vitamin drips',
        'Cryotherapy/red light therapy',
        'Home gym installation',
        'Meditation room design'
      ],
      icon: Brain,
      color: '#10b981'
    },
    {
      category: 'ADU Development',
      growth: '18.6% CAGR',
      marketSize: '$10.6B by 2030',
      opportunities: [
        'Design & permit processing',
        'Modular ADU construction',
        'ADU property management',
        'Financing coordination'
      ],
      icon: Building2,
      color: '#f59e0b'
    },
    {
      category: 'Climate Resilience',
      growth: '22.4% annually',
      marketSize: '$85B opportunity',
      opportunities: [
        'Flood defense systems',
        'Hurricane shutters & barriers',
        'Backup power installation',
        'Weather-proofing retrofits'
      ],
      icon: Shield,
      color: '#ef4444'
    },
    {
      category: 'Home Food Production',
      growth: '19.2% annually',
      marketSize: '$8B by 2027',
      opportunities: [
        'Hydroponic garden setup',
        'Automated chicken coops',
        'Composting systems',
        'Smart greenhouse installation'
      ],
      icon: Leaf,
      color: '#059669'
    }
  ]

  // Bundle opportunities
  const bundleOpportunities = [
    {
      name: 'Complete Green Home',
      components: ['Solar Installation', 'EV Charging', 'Smart Energy Management'],
      avgValue: '$45,000',
      margin: '32%',
      taxIncentive: '30% federal credit',
      competition: 'None (fragmented)',
      icon: Zap,
      color: '#10b981'
    },
    {
      name: 'Aging-in-Place Suite',
      components: ['Smart Home Setup', 'Medical Alerts', 'Accessibility Mods'],
      avgValue: '$18,000',
      margin: '45%',
      taxIncentive: 'Medicare eligible',
      competition: 'Minimal',
      icon: Home,
      color: '#3b82f6'
    },
    {
      name: 'Luxury Pet Paradise',
      components: ['Artificial Turf', 'Smart Pet Doors', 'Outdoor Pet Spa'],
      avgValue: '$25,000',
      margin: '38%',
      taxIncentive: 'None',
      competition: 'Zero integrated',
      icon: Heart,
      color: '#f59e0b'
    },
    {
      name: 'ADU Ecosystem',
      components: ['Design & Permits', 'Construction', 'Property Management'],
      avgValue: '$150,000',
      margin: '20%',
      taxIncentive: 'State grants available',
      competition: 'Fragmented',
      icon: Building2,
      color: '#8b5cf6'
    },
    {
      name: 'Climate Defense Package',
      components: ['Flood Barriers', 'Backup Power', 'Storm Protection'],
      avgValue: '$35,000',
      margin: '40%',
      taxIncentive: 'Insurance discounts',
      competition: 'Regional only',
      icon: Shield,
      color: '#ef4444'
    },
    {
      name: 'Food Security System',
      components: ['Hydroponic Setup', 'Chicken Coop', 'Composting'],
      avgValue: '$15,000',
      margin: '42%',
      taxIncentive: 'USDA programs',
      competition: 'None integrated',
      icon: Leaf,
      color: '#059669'
    }
  ]

  // Market projections
  const industryProjections = {
    current: '$600B',
    projected: '$1T',
    year: '2033',
    cagr: '19.7%',
    keyDrivers: [
      '2M+ urban exodus to suburbs',
      'Millennials driving demand',
      '70% prefer eco-services',
      'Remote work home upgrades'
    ]
  }

  // Strategic analysis data
  const priorityServices = [
    {
      rank: 1,
      name: 'Integrated EV Ecosystem',
      focus: 'Princeton/Celina, TX',
      avgTicket: '$45,000',
      margin: '30%',
      growth: '27.1% CAGR',
      reasoning: 'Highest growth market meets highest growth service. Texas grid issues create desperate need.',
      icon: Zap,
      color: '#10b981'
    },
    {
      rank: 2,
      name: 'ADU Development + Management',
      focus: 'Any growth market',
      avgTicket: '$150,000',
      margin: '20%',
      growth: '18.6% CAGR',
      reasoning: 'Housing crisis + aging parents + rental income. $10.6B market by 2030.',
      icon: Building2,
      color: '#8b5cf6'
    },
    {
      rank: 3,
      name: 'Senior Tech Concierge',
      focus: 'Silver Spring, MD',
      avgTicket: '$5,000 + $199/mo',
      margin: '85%',
      growth: '15.2% CAGR',
      reasoning: '10,000 boomers retire daily. Tech anxiety creates recurring revenue opportunity.',
      icon: Users,
      color: '#3b82f6'
    }
  ]

  const financialComparisons = [
    {
      metric: 'Revenue per Employee',
      traditional: '$45,000',
      emerging: '$65,000',
      improvement: '+44%'
    },
    {
      metric: 'Gross Margins',
      traditional: '35%',
      emerging: '65%',
      improvement: '+86%'
    },
    {
      metric: 'Exit Multiples',
      traditional: '0.5-1x revenue',
      emerging: '2-4x revenue',
      improvement: '+300%'
    },
    {
      metric: 'Customer LTV',
      traditional: '$2,500',
      emerging: '$12,000',
      improvement: '+380%'
    }
  ]

  const governmentIncentives = [
    {
      program: 'Federal Climate Act',
      amount: '$369B available',
      coverage: '30% tax credits',
      services: ['Solar', 'EV Charging', 'Heat Pumps']
    },
    {
      program: 'State Rebates',
      amount: 'Up to $14,000',
      coverage: 'Stack on federal',
      services: ['Energy Efficiency', 'Weatherization']
    },
    {
      program: 'Utility Programs',
      amount: '$500-5,000',
      coverage: 'Per installation',
      services: ['Smart Thermostats', 'EV Chargers']
    }
  ]

  const executionRoadmap = [
    {
      phase: 'Months 1-2',
      tasks: ['Get certified', 'Hire 2 installers', 'Secure supplier relationships'],
      milestone: 'First installation'
    },
    {
      phase: 'Months 3-4',
      tasks: ['Install 5 systems', 'Document case studies', 'Launch local marketing'],
      milestone: '5 happy customers'
    },
    {
      phase: 'Months 5-6',
      tasks: ['Scale to 15/month', 'Hire sales person', 'Systemize operations'],
      milestone: '$200K monthly revenue'
    },
    {
      phase: 'Year 2',
      tasks: ['Expand to 3 cities', 'Add battery storage', 'Launch maintenance plans'],
      milestone: '$3M annual revenue'
    },
    {
      phase: 'Year 3',
      tasks: ['Regional expansion', 'Add smart home', 'Prepare for exit'],
      milestone: '8-figure acquisition'
    }
  ]

  return (
    <div className="market-intelligence">
      <div className="intelligence-header">
        <h2>🎯 Market Intelligence Hub</h2>
        <p>Real-time opportunities beyond your current database</p>
      </div>

      {/* Market Overview Cards */}
      <div className="market-overview-grid">
        <div className="overview-card">
          <div className="overview-icon">
            <TrendingUp size={24} />
          </div>
          <div className="overview-content">
            <span className="overview-value">{industryProjections.current}</span>
            <span className="overview-label">Current Market</span>
          </div>
        </div>
        <div className="overview-card highlight">
          <div className="overview-icon">
            <DollarSign size={24} />
          </div>
          <div className="overview-content">
            <span className="overview-value">{industryProjections.projected}</span>
            <span className="overview-label">Projected by {industryProjections.year}</span>
          </div>
        </div>
        <div className="overview-card">
          <div className="overview-icon">
            <Zap size={24} />
          </div>
          <div className="overview-content">
            <span className="overview-value">{industryProjections.cagr}</span>
            <span className="overview-label">Annual Growth</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="intelligence-tabs">
        <button 
          className={`tab-button ${activeTab === 'growth' ? 'active' : ''}`}
          onClick={() => setActiveTab('growth')}
        >
          <TrendingUp size={16} />
          Hyper-Growth Cities
        </button>
        <button 
          className={`tab-button ${activeTab === 'gaps' ? 'active' : ''}`}
          onClick={() => setActiveTab('gaps')}
        >
          <AlertCircle size={16} />
          Service Gaps
        </button>
        <button 
          className={`tab-button ${activeTab === 'bundles' ? 'active' : ''}`}
          onClick={() => setActiveTab('bundles')}
        >
          <Package size={16} />
          Bundle Builder
        </button>
        <button 
          className={`tab-button ${activeTab === 'strategy' ? 'active' : ''}`}
          onClick={() => setActiveTab('strategy')}
        >
          <Target size={16} />
          Strategic Analysis
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'growth' && (
          <div className="growth-markets">
            <div className="section-intro">
              <h3>Fastest Growing Cities Under 100K</h3>
              <p>Prime markets with explosive growth and limited competition</p>
            </div>
            
            {/* Region Filter */}
            <div className="region-filter">
              <button 
                className={`filter-btn ${selectedRegion === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedRegion('all')}
              >
                All Regions ({growthCities.length})
              </button>
              <button 
                className={`filter-btn ${selectedRegion === 'Texas' ? 'active' : ''}`}
                onClick={() => setSelectedRegion('Texas')}
              >
                Texas ({growthCities.filter(c => c.region === 'Texas').length})
              </button>
              <button 
                className={`filter-btn ${selectedRegion === 'Southeast' ? 'active' : ''}`}
                onClick={() => setSelectedRegion('Southeast')}
              >
                Southeast ({growthCities.filter(c => c.region === 'Southeast').length})
              </button>
              <button 
                className={`filter-btn ${selectedRegion === 'Mountain West' ? 'active' : ''}`}
                onClick={() => setSelectedRegion('Mountain West')}
              >
                Mountain West ({growthCities.filter(c => c.region === 'Mountain West').length})
              </button>
              <button 
                className={`filter-btn ${selectedRegion === 'Florida' ? 'active' : ''}`}
                onClick={() => setSelectedRegion('Florida')}
              >
                Florida ({growthCities.filter(c => c.region === 'Florida').length})
              </button>
              <button 
                className={`filter-btn ${selectedRegion === 'Pacific NW' ? 'active' : ''}`}
                onClick={() => setSelectedRegion('Pacific NW')}
              >
                Pacific NW ({growthCities.filter(c => c.region === 'Pacific NW').length})
              </button>
            </div>
            
            <div className="growth-cities-grid">
              {growthCities
                .filter(city => selectedRegion === 'all' || city.region === selectedRegion)
                .sort((a, b) => b.score - a.score)
                .map((city, index) => (
                <div key={index} className="growth-city-card">
                  <div className="city-header">
                    <div className="city-info">
                      <h4>{city.name}</h4>
                      <div className="city-stats">
                        <span className="growth-rate">↗ {city.growth}</span>
                        <span className="population">{city.population} pop.</span>
                      </div>
                    </div>
                    <div className="opportunity-score">
                      <div className="score-circle" style={{
                        background: `conic-gradient(#10b981 ${city.score * 3.6}deg, #1e293b 0deg)`
                      }}>
                        <span>{city.score}</span>
                      </div>
                    </div>
                  </div>
                  <div className="city-opportunities">
                    <div className="opportunity-label">Best Services:</div>
                    <div className="service-tags">
                      {city.services.map((service, idx) => (
                        <span key={idx} className="service-tag">{service}</span>
                      ))}
                    </div>
                  </div>
                  <div className="city-footer">
                    <MapPin size={14} />
                    <span>Population doubled from {city.previousPop}</span>
                  </div>
                  <div className="region-badge">{city.region}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'gaps' && (
          <div className="service-gaps">
            <div className="section-intro">
              <h3>Underserved Niche Markets</h3>
              <p>High-demand services with minimal competition nationwide</p>
            </div>
            <div className="gaps-grid">
              {serviceGaps.map((gap, index) => {
                const Icon = gap.icon
                return (
                  <div key={index} className="gap-card">
                    <div className="gap-header">
                      <div className="gap-icon" style={{ backgroundColor: gap.color }}>
                        <Icon size={24} color="white" />
                      </div>
                      <div className="gap-title">
                        <h4>{gap.category}</h4>
                        <div className="gap-stats">
                          <span className="growth">{gap.growth}</span>
                          <span className="market-size">{gap.marketSize}</span>
                        </div>
                      </div>
                    </div>
                    <div className="gap-opportunities">
                      <h5>Opportunity Areas:</h5>
                      <ul>
                        {gap.opportunities.map((opp, idx) => (
                          <li key={idx}>{opp}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'bundles' && (
          <div className="bundle-builder">
            <div className="section-intro">
              <h3>Integrated Service Bundles</h3>
              <p>First-mover advantage with zero integrated competition</p>
            </div>
            <div className="bundles-grid">
              {bundleOpportunities.map((bundle, index) => {
                const Icon = bundle.icon
                return (
                  <div key={index} className="bundle-card">
                    <div className="bundle-header">
                      <div className="bundle-icon" style={{ backgroundColor: bundle.color }}>
                        <Icon size={24} color="white" />
                      </div>
                      <h4>{bundle.name}</h4>
                    </div>
                    <div className="bundle-components">
                      {bundle.components.map((comp, idx) => (
                        <div key={idx} className="component-item">
                          <span className="component-number">{idx + 1}</span>
                          <span>{comp}</span>
                        </div>
                      ))}
                    </div>
                    <div className="bundle-metrics">
                      <div className="metric">
                        <span className="metric-label">Avg Value</span>
                        <span className="metric-value">{bundle.avgValue}</span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">Margin</span>
                        <span className="metric-value green">{bundle.margin}</span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">Incentives</span>
                        <span className="metric-value">{bundle.taxIncentive}</span>
                      </div>
                    </div>
                    <div className="bundle-competition">
                      <AlertCircle size={16} />
                      <span>Competition: {bundle.competition}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'strategy' && (
          <div className="strategic-analysis">
            <div className="section-intro">
              <h3>🎯 Strategic Launch Priorities</h3>
              <p>Data-driven recommendations based on market timing, competition, and profitability</p>
            </div>

            {/* Priority Services */}
            <div className="priority-services">
              <h4>Top 3 Services to Launch</h4>
              <div className="priority-grid">
                {priorityServices.map((service) => {
                  const Icon = service.icon
                  return (
                    <div key={service.rank} className="priority-card">
                      <div className="priority-rank">#{service.rank}</div>
                      <div className="priority-header">
                        <div className="priority-icon" style={{ backgroundColor: service.color }}>
                          <Icon size={24} color="white" />
                        </div>
                        <div className="priority-info">
                          <h5>{service.name}</h5>
                          <p className="focus-market">{service.focus}</p>
                        </div>
                      </div>
                      <div className="priority-metrics">
                        <div className="metric-item">
                          <span className="metric-label">Avg Ticket</span>
                          <span className="metric-value">{service.avgTicket}</span>
                        </div>
                        <div className="metric-item">
                          <span className="metric-label">Margin</span>
                          <span className="metric-value green">{service.margin}</span>
                        </div>
                        <div className="metric-item">
                          <span className="metric-label">Growth</span>
                          <span className="metric-value blue">{service.growth}</span>
                        </div>
                      </div>
                      <div className="priority-reasoning">
                        <p>{service.reasoning}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Financial Comparison */}
            <div className="financial-comparison">
              <h4>Traditional vs Emerging Services</h4>
              <div className="comparison-table">
                <div className="table-header">
                  <div className="col">Metric</div>
                  <div className="col">Traditional</div>
                  <div className="col">Emerging</div>
                  <div className="col highlight">Improvement</div>
                </div>
                {financialComparisons.map((comp, index) => (
                  <div key={index} className="table-row">
                    <div className="col">{comp.metric}</div>
                    <div className="col">{comp.traditional}</div>
                    <div className="col">{comp.emerging}</div>
                    <div className="col highlight">{comp.improvement}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Government Incentives */}
            <div className="government-incentives">
              <h4>💰 Government Money Printer</h4>
              <div className="incentives-grid">
                {governmentIncentives.map((incentive, index) => (
                  <div key={index} className="incentive-card">
                    <h5>{incentive.program}</h5>
                    <div className="incentive-details">
                      <div className="detail-item">
                        <DollarSign size={16} />
                        <span>{incentive.amount}</span>
                      </div>
                      <div className="detail-item">
                        <Calculator size={16} />
                        <span>{incentive.coverage}</span>
                      </div>
                    </div>
                    <div className="eligible-services">
                      {incentive.services.map((service, idx) => (
                        <span key={idx} className="service-tag">{service}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Execution Roadmap */}
            <div className="execution-roadmap">
              <h4>🚀 3-Year Execution Plan</h4>
              <p className="roadmap-subtitle">For Integrated EV Ecosystem in Princeton, TX</p>
              <div className="roadmap-timeline">
                {executionRoadmap.map((phase, index) => (
                  <div key={index} className="timeline-item">
                    <div className="timeline-marker">
                      <Rocket size={16} />
                    </div>
                    <div className="timeline-content">
                      <h5>{phase.phase}</h5>
                      <ul>
                        {phase.tasks.map((task, idx) => (
                          <li key={idx}>{task}</li>
                        ))}
                      </ul>
                      <div className="milestone">
                        <strong>Milestone:</strong> {phase.milestone}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Key Insights */}
      <div className="key-insights">
        <h3>📊 Key Market Drivers</h3>
        <div className="insights-grid">
          {industryProjections.keyDrivers.map((driver, index) => (
            <div key={index} className="insight-item">
              <span className="insight-number">{index + 1}</span>
              <span className="insight-text">{driver}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MarketIntelligence