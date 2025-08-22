import Navigation from '../components/Navigation'
import MarketIntelligenceContent from '../components/MarketIntelligence'

function MarketIntelligence({ session }) {
  return (
    <>
      <Navigation session={session} />
      <div className="page-container">
        <MarketIntelligenceContent />
      </div>
    </>
  )
}

export default MarketIntelligence