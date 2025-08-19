import { sendMessageToClaude, CLAUDE_MODELS } from '../lib/claude.js'

/**
 * AI-powered lead filtering service using Claude
 * Classifies businesses as legitimate service providers or non-service businesses
 */

/**
 * Classify a single business using AI
 * @param {Object} business - Business object with name and optionally category, website, etc.
 * @param {string} serviceType - The service type we're filtering for (e.g., "Pool Builders")
 * @returns {Promise<Object>} - Classification result
 */
export async function classifyBusiness(business, serviceType) {
  const businessName = business.name || business.company_name || ''
  const category = business.category || business.categoryName || ''
  const address = business.address || ''
  
  const prompt = `Analyze if this business is a legitimate service provider for ${serviceType}:

Business Name: "${businessName}"
Category: "${category}"
Address: "${address}"

Context:
- A service provider actively performs the service (e.g., builds pools, paints houses, installs turf)
- A non-service business only sells products, has the feature but doesn't provide the service, or is unrelated
- Hotels, apartments, stores, restaurants, government buildings are NOT service providers
- Fitness centers with pools are NOT pool builders
- Stores that sell supplies are NOT service providers unless they also install

Respond with ONLY a JSON object in this exact format:
{
  "isServiceProvider": true/false,
  "confidence": 0.0-1.0,
  "reason": "brief explanation"
}`

  try {
    const response = await sendMessageToClaude(prompt, [], {
      model: CLAUDE_MODELS.HAIKU, // Fastest and cheapest
      maxTokens: 150,
      temperature: 0.3, // Lower temperature for more consistent classification
      systemPrompt: 'You are a business classification expert. Respond only with valid JSON.'
    })

    // Parse the JSON response
    const cleanedResponse = response.trim()
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from AI')
    }
    
    const result = JSON.parse(jsonMatch[0])
    
    // Validate the response structure
    if (typeof result.isServiceProvider !== 'boolean' || 
        typeof result.confidence !== 'number' ||
        typeof result.reason !== 'string') {
      throw new Error('Invalid response structure from AI')
    }
    
    return {
      ...result,
      businessName,
      category,
      aiModel: 'claude-3-haiku'
    }
  } catch (error) {
    console.error('AI classification error:', error)
    return {
      isServiceProvider: true, // Default to include on error
      confidence: 0,
      reason: 'AI classification failed - including by default',
      businessName,
      category,
      error: error.message
    }
  }
}

/**
 * Classify multiple businesses in a batch
 * @param {Array} businesses - Array of business objects
 * @param {string} serviceType - The service type we're filtering for
 * @param {Function} onProgress - Optional progress callback
 * @returns {Promise<Array>} - Array of classification results
 */
export async function classifyBusinessBatch(businesses, serviceType, onProgress) {
  const results = []
  const batchSize = 5 // Process 5 at a time to balance speed and rate limits
  
  for (let i = 0; i < businesses.length; i += batchSize) {
    const batch = businesses.slice(i, i + batchSize)
    
    // Process batch in parallel
    const batchPromises = batch.map(business => classifyBusiness(business, serviceType))
    const batchResults = await Promise.all(batchPromises)
    
    results.push(...batchResults)
    
    if (onProgress) {
      onProgress({
        processed: Math.min(i + batchSize, businesses.length),
        total: businesses.length,
        percentage: Math.round((Math.min(i + batchSize, businesses.length) / businesses.length) * 100)
      })
    }
    
    // Small delay between batches to avoid rate limits
    if (i + batchSize < businesses.length) {
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }
  
  return results
}

/**
 * Calculate cost estimate for AI filtering
 * @param {number} businessCount - Number of businesses to process
 * @returns {Object} - Cost breakdown
 */
export function estimateFilteringCost(businessCount) {
  // Claude Haiku pricing: $0.25 per million input tokens, $1.25 per million output tokens
  const avgInputTokens = 200 // Average tokens per classification prompt
  const avgOutputTokens = 50 // Average tokens per response
  
  const inputCost = (businessCount * avgInputTokens / 1000000) * 0.25
  const outputCost = (businessCount * avgOutputTokens / 1000000) * 1.25
  const totalCost = inputCost + outputCost
  
  return {
    businessCount,
    estimatedTokens: {
      input: businessCount * avgInputTokens,
      output: businessCount * avgOutputTokens
    },
    estimatedCost: {
      input: inputCost.toFixed(4),
      output: outputCost.toFixed(4),
      total: totalCost.toFixed(4)
    },
    costPerBusiness: (totalCost / businessCount).toFixed(5)
  }
}

/**
 * Get summary statistics from classification results
 * @param {Array} results - Array of classification results
 * @returns {Object} - Summary statistics
 */
export function getClassificationStats(results) {
  const included = results.filter(r => r.isServiceProvider)
  const excluded = results.filter(r => !r.isServiceProvider)
  const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length
  
  return {
    total: results.length,
    included: included.length,
    excluded: excluded.length,
    inclusionRate: (included.length / results.length * 100).toFixed(1) + '%',
    avgConfidence: avgConfidence.toFixed(3),
    lowConfidence: results.filter(r => r.confidence < 0.7).length,
    errors: results.filter(r => r.error).length
  }
}