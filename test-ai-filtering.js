import { classifyBusinessBatch, estimateFilteringCost, getClassificationStats } from './src/services/aiLeadFilter.js'

// Test data from Amarillo pool builders import
const testBusinesses = [
  // Should be EXCLUDED (not service providers)
  { name: "7th Court of Appeals", category: "Government office" },
  { name: "Dollar Tree", category: "Dollar store" },
  { name: "Amarillo Police Department", category: "Police station" },
  { name: "Potter County Sheriff's Office", category: "Sheriff's office" },
  { name: "Family Dollar", category: "Dollar store" },
  { name: "Amarillo Town Club", category: "Fitness center" },
  { name: "Casa Del Sol", category: "Apartment complex", address: "4215 S Western St, Amarillo, TX" },
  { name: "Four Points by Sheraton Amarillo Central", category: "Hotel" },
  { name: "City of Amarillo Parks and Recreation", category: "Government office" },
  { name: "Bones Hooks Park Splash Pad", category: "Park", address: "2104 N Washington St, Amarillo, TX" },
  { name: "The Westerner - Extended Stay", category: "Hotel" },
  { name: "Old Dominion Freight Line", category: "Freight service" },
  
  // Should be INCLUDED (legitimate service providers)
  { name: "Lone Star Luxury Pools", category: "Pool cleaning service", address: "2400 SW 7th Ave A #750, Amarillo, TX" },
  { name: "Hot Springs Spas of Amarillo", category: "Hot tub store" },
  { name: "Backyard Specialties Pools & Spas", category: "Pool supply store" },
  { name: "JJ Pools and Services", category: "" }, // No category
  { name: "Hot Tub Doctor", category: "Hot tub repair service" },
  { name: "Pool Cleaning Amarillo, Texas", category: "Pool cleaning service" },
  { name: "Tomahawk Custom Pools", category: "Swimming pool contractor" },
  { name: "1st Team Pool Services", category: "Pool cleaning service" },
  
  // Edge cases (could go either way)
  { name: "Scuba Training Center Of Amarillo", category: "Scuba diving center" },
  { name: "West Texas Swim Coaching, LLC", category: "Swimming instructor" },
  { name: "The Amarillo Fence Company", category: "Fence contractor" }, // Not pool related
  { name: "Sprouse Electric", category: "Electrician" }, // Not pool related
]

// Expected results for validation
const expectedResults = {
  excluded: [
    "7th Court of Appeals",
    "Dollar Tree", 
    "Amarillo Police Department",
    "Potter County Sheriff's Office",
    "Family Dollar",
    "Amarillo Town Club",
    "Casa Del Sol",
    "Four Points by Sheraton Amarillo Central",
    "City of Amarillo Parks and Recreation",
    "Bones Hooks Park Splash Pad",
    "The Westerner - Extended Stay",
    "Old Dominion Freight Line",
    "Scuba Training Center Of Amarillo", // Teaches scuba, doesn't build pools
    "West Texas Swim Coaching, LLC", // Teaches swimming, doesn't build pools
    "The Amarillo Fence Company", // Builds fences, not pools
    "Sprouse Electric" // Electrician, not pool builder
  ],
  included: [
    "Lone Star Luxury Pools",
    "Hot Springs Spas of Amarillo",
    "Backyard Specialties Pools & Spas",
    "JJ Pools and Services",
    "Hot Tub Doctor",
    "Pool Cleaning Amarillo, Texas",
    "Tomahawk Custom Pools",
    "1st Team Pool Services"
  ]
}

async function runTest() {
  console.log('🧪 AI Lead Filtering Test\n')
  console.log(`Testing ${testBusinesses.length} businesses for "Pool Builders" classification\n`)
  
  // Show cost estimate
  const costEstimate = estimateFilteringCost(testBusinesses.length)
  console.log('💰 Cost Estimate:')
  console.log(`  - Businesses: ${costEstimate.businessCount}`)
  console.log(`  - Est. Input Tokens: ${costEstimate.estimatedTokens.input}`)
  console.log(`  - Est. Output Tokens: ${costEstimate.estimatedTokens.output}`)
  console.log(`  - Est. Total Cost: $${costEstimate.estimatedCost.total}`)
  console.log(`  - Cost per business: $${costEstimate.costPerBusiness}\n`)
  
  console.log('🤖 Starting AI classification...\n')
  
  const startTime = Date.now()
  
  // Run classification
  const results = await classifyBusinessBatch(
    testBusinesses, 
    'Pool Builders',
    (progress) => {
      console.log(`Progress: ${progress.processed}/${progress.total} (${progress.percentage}%)`)
    }
  )
  
  const endTime = Date.now()
  const duration = (endTime - startTime) / 1000
  
  console.log(`\n✅ Classification complete in ${duration.toFixed(1)} seconds\n`)
  
  // Show statistics
  const stats = getClassificationStats(results)
  console.log('📊 Statistics:')
  console.log(`  - Total businesses: ${stats.total}`)
  console.log(`  - Included (service providers): ${stats.included}`)
  console.log(`  - Excluded (non-service): ${stats.excluded}`)
  console.log(`  - Inclusion rate: ${stats.inclusionRate}`)
  console.log(`  - Average confidence: ${stats.avgConfidence}`)
  console.log(`  - Low confidence (<0.7): ${stats.lowConfidence}`)
  console.log(`  - Errors: ${stats.errors}\n`)
  
  // Validate results
  console.log('🎯 Validation Results:\n')
  
  let correctClassifications = 0
  let incorrectClassifications = 0
  
  results.forEach(result => {
    const expected = expectedResults.excluded.includes(result.businessName) ? false : true
    const correct = result.isServiceProvider === expected
    
    if (correct) correctClassifications++
    else incorrectClassifications++
    
    const icon = correct ? '✅' : '❌'
    const expectedLabel = expected ? 'INCLUDE' : 'EXCLUDE'
    const actualLabel = result.isServiceProvider ? 'INCLUDE' : 'EXCLUDE'
    
    console.log(`${icon} ${result.businessName}`)
    console.log(`   Category: ${result.category || 'N/A'}`)
    console.log(`   Expected: ${expectedLabel}, Got: ${actualLabel}`)
    console.log(`   Confidence: ${result.confidence}`)
    console.log(`   Reason: ${result.reason}`)
    if (!correct) {
      console.log(`   ⚠️  MISMATCH`)
    }
    console.log('')
  })
  
  // Final accuracy
  const accuracy = (correctClassifications / results.length * 100).toFixed(1)
  console.log('🏁 Final Results:')
  console.log(`  - Correct: ${correctClassifications}/${results.length}`)
  console.log(`  - Accuracy: ${accuracy}%`)
  console.log(`  - Time: ${duration.toFixed(1)}s`)
  console.log(`  - Speed: ${(results.length / duration).toFixed(1)} businesses/second`)
  
  // Show specific errors
  if (incorrectClassifications > 0) {
    console.log('\n❌ Misclassified businesses:')
    results.forEach(result => {
      const expected = expectedResults.excluded.includes(result.businessName) ? false : true
      if (result.isServiceProvider !== expected) {
        console.log(`  - ${result.businessName}: Expected ${expected ? 'INCLUDE' : 'EXCLUDE'}, got ${result.isServiceProvider ? 'INCLUDE' : 'EXCLUDE'}`)
      }
    })
  }
}

// Check if API key is available
if (!import.meta.env.VITE_ANTHROPIC_API_KEY) {
  console.error('❌ Error: VITE_ANTHROPIC_API_KEY not found in environment variables')
  console.log('Please add your Anthropic API key to .env file')
  process.exit(1)
}

// Run the test
runTest().catch(error => {
  console.error('❌ Test failed:', error)
  process.exit(1)
})