import { useState } from 'react'
import Navigation from '../components/Navigation'
import AIFilteringMetrics from '../components/AIFilteringMetrics'
import { Bot } from 'lucide-react'

function AIMetrics({ session }) {
  const [isHeaderCondensed, setIsHeaderCondensed] = useState(false)

  return (
    <div className="dashboard-container">
      <Navigation 
        session={session} 
        isHeaderCondensed={isHeaderCondensed}
        setIsHeaderCondensed={setIsHeaderCondensed}
      />
      
      <div className={`main-content ${isHeaderCondensed ? 'header-condensed' : ''}`}>
        <div className="page-header">
          <div className="page-title">
            <Bot size={28} />
            <h1>AI Filtering Analytics</h1>
          </div>
          <p className="page-description">
            Track the performance and accuracy of AI-powered lead filtering
          </p>
        </div>

        <AIFilteringMetrics session={session} />
      </div>
    </div>
  )
}

export default AIMetrics