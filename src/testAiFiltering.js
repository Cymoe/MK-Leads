// Import AI providers
import * as ClaudeFilter from './services/aiLeadFilter.js'
import * as OpenAIFilter from './services/aiLeadFilterOpenAI.js'
import * as SupabaseAIFilter from './services/aiLeadFilterSupabase.js'

// Test data from Amarillo pool builders import
const testBusinesses = [
  // Should be EXCLUDED (not service providers)
  { name: "7th Court of Appeals", category: "Government office" },
  { name: "Dollar Tree", category: "Dollar store" },
  { name: "Amarillo Police Department", category: "Police station" },
  { name: "Amarillo Town Club", category: "Fitness center" },
  { name: "Casa Del Sol", category: "Apartment complex", address: "4215 S Western St, Amarillo, TX" },
  
  // Should be INCLUDED (legitimate service providers)
  { name: "Lone Star Luxury Pools", category: "Pool cleaning service", address: "2400 SW 7th Ave A #750, Amarillo, TX" },
  { name: "Hot Springs Spas of Amarillo", category: "Hot tub store" },
  { name: "JJ Pools and Services", category: "" }, // No category
  { name: "Tomahawk Custom Pools", category: "Swimming pool contractor" },
  
  // Edge cases
  { name: "Scuba Training Center Of Amarillo", category: "Scuba diving center" },
]

export async function runAiFilteringTest(provider = 'supabase') {
  // Select the AI provider
  const aiFilter = provider === 'openai' ? OpenAIFilter : 
                   provider === 'claude' ? ClaudeFilter : 
                   SupabaseAIFilter;
  const providerName = provider === 'openai' ? 'OpenAI GPT-3.5 (Direct)' : 
                      provider === 'claude' ? 'Claude 3 Haiku' :
                      'OpenAI GPT-3.5 (Supabase Edge)';
  
  console.log(`🧪 AI Lead Filtering Test (${providerName})\n`)
  console.log(`Testing ${testBusinesses.length} businesses for "Pool Builders" classification\n`)
  
  // Show cost estimate (if available)
  if (aiFilter.estimateFilteringCost) {
    const costEstimate = aiFilter.estimateFilteringCost(testBusinesses.length)
    console.log('💰 Cost Estimate:')
    console.log(`  - Est. Total Cost: $${costEstimate.estimatedCost.total}`)
    console.log(`  - Cost per business: $${costEstimate.costPerBusiness}\n`)
  }
  
  console.log(`🤖 Starting AI classification with ${providerName}...\n`)
  
  const startTime = Date.now()
  
  try {
    // Run classification
    const results = await aiFilter.classifyBusinessBatch(
      testBusinesses, 
      'Pool Builders',
      (progress) => {
        console.log(`Progress: ${progress.processed}/${progress.total} (${progress.percentage}%)`)
      }
    )
    
    const endTime = Date.now()
    const duration = (endTime - startTime) / 1000
    
    console.log(`\n✅ Classification complete in ${duration.toFixed(1)} seconds\n`)
    
    // Show results
    console.log('📊 Results:\n')
    results.forEach(result => {
      const icon = result.isServiceProvider ? '✅' : '❌'
      console.log(`${icon} ${result.businessName}`)
      console.log(`   Category: ${result.category || 'N/A'}`)
      console.log(`   Decision: ${result.isServiceProvider ? 'INCLUDE' : 'EXCLUDE'}`)
      console.log(`   Confidence: ${result.confidence}`)
      console.log(`   Reason: ${result.reason}`)
      console.log('')
    })
    
    // Show statistics
    const stats = aiFilter.getClassificationStats(results)
    console.log('📈 Summary:')
    console.log(`  - Included (service providers): ${stats.included}/${stats.total}`)
    console.log(`  - Excluded (non-service): ${stats.excluded}/${stats.total}`)
    console.log(`  - Average confidence: ${stats.avgConfidence}`)
    console.log(`  - Processing speed: ${(results.length / duration).toFixed(1)} businesses/second`)
    
    return results
  } catch (error) {
    console.error('❌ Test failed:', error)
    throw error
  }
}

// Export for use in other components
export { testBusinesses }