import OpenAI from 'openai';

/**
 * AI-powered lead filtering service using OpenAI
 * More cost-effective than Claude for simple classification tasks
 */

// Initialize OpenAI client
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

if (!apiKey) {
  console.error('OpenAI API key not found. Please add VITE_OPENAI_API_KEY to your .env file');
}

// Note: OpenAI has started blocking browser requests. You'll need to use a proxy in production.
const openai = new OpenAI({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true,
  baseURL: 'https://api.openai.com/v1',
  defaultHeaders: {
    'User-Agent': 'ReactLeads/1.0'
  }
});

/**
 * Get few-shot examples for specific service types
 * @param {string} serviceType - The service type
 * @returns {string} - Formatted examples
 */
function getServiceExamples(serviceType) {
  const examples = {
    'Pool Builders': `
✓ INCLUDE: "ABC Pool Construction" - Builds and installs pools
✓ INCLUDE: "Premier Pool & Spa" - Pool contractor with installation services
✗ EXCLUDE: "LA Fitness" - Gym with pools, not a pool builder
✗ EXCLUDE: "Pool Supply Store" - Sells supplies but doesn't install`,
    
    'Artificial Turf Installation': `
✓ INCLUDE: "Green Turf Pros" - Installs artificial turf
✓ INCLUDE: "Desert Landscaping & Turf" - Landscaper that offers turf installation
✗ EXCLUDE: "Phoenix Sports Centre" - Sports facility with turf fields
✗ EXCLUDE: "Turf Warehouse" - Supplier/retailer only`,
    
    'Smart Home Installation': `
✓ INCLUDE: "Smart Home Integrators LLC" - Installs home automation systems
✓ INCLUDE: "Control4 Certified Dealer" - Installs smart home technology
✗ EXCLUDE: "ADT Security" - Security only, no home automation
✗ EXCLUDE: "Best Buy" - Retail store, even if they sell smart home products`,
    
    'Roofing Contractors': `
✓ INCLUDE: "ABC Roofing Company" - Installs and repairs roofs
✓ INCLUDE: "Storm Damage Roof Repair" - Roofing service provider
✗ EXCLUDE: "Home Depot" - Sells roofing materials but doesn't install
✗ EXCLUDE: "Apartment Complex" - Has roofs but doesn't provide roofing services`,
    
    'Painting Companies': `
✓ INCLUDE: "Professional Painters Inc" - Provides painting services
✓ INCLUDE: "Joe's House Painting" - Residential painting contractor
✓ INCLUDE: "Art Smart Painting" - House painting company with "art" in name
✗ EXCLUDE: "Sherwin Williams" - Paint store, not a painting service
✗ EXCLUDE: "Art Gallery" - Displays paintings, doesn't paint houses
✗ EXCLUDE: "McKinney Art House" - Art studio/gallery, not house painting
✗ EXCLUDE: "Van Go Go Paint Party" - Paint party entertainment, not house painting
✗ EXCLUDE: "Kelly's Art Shack & Events" - Art studio/events, not house painting
✗ EXCLUDE: "Maaco Auto Body" - Auto painting, not house painting`
  };
  
  // Return specific examples if available, otherwise generic examples
  return examples[serviceType] || `
✓ INCLUDE: Businesses that actively provide ${serviceType} services
✓ INCLUDE: Contractors specializing in ${serviceType}
✗ EXCLUDE: Stores that only sell related products
✗ EXCLUDE: Properties that have the feature but don't provide the service`;
}

/**
 * Classify a single business using OpenAI
 * @param {Object} business - Business object with name and optionally category, website, etc.
 * @param {string} serviceType - The service type we're filtering for (e.g., "Pool Builders")
 * @returns {Promise<Object>} - Classification result
 */
export async function classifyBusiness(business, serviceType) {
  const businessName = business.name || business.company_name || '';
  const category = business.category || business.categoryName || '';
  const address = business.address || '';
  
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
- For Smart Home Installation: Look for home automation installers, smart home integrators, Control4/Savant dealers, home theater installers
- For Smart Home Installation: Security-only companies (ADT, alarm companies) are NOT smart home installers unless they also do automation

Businesses to EXCLUDE:
- Retail stores and showrooms (even if they sell the product)
- Equipment suppliers and wholesalers
- Manufacturers (unless they also install)
- Sports facilities and recreation centers
- Property management companies
- Real estate agencies
- Equipment rental companies
- Online-only businesses without installation services
- Art studios, art galleries, art centers (for painting companies)
- Paint party venues, wine & paint studios, art entertainment
- Auto body shops and automotive painting
- Art supply stores and craft stores

Examples for ${serviceType}:
${getServiceExamples(serviceType)}

Respond with ONLY a JSON object in this exact format:
{
  "isServiceProvider": true/false,
  "confidence": 0.0-1.0,
  "reason": "brief explanation"
}`;

  try {
    // Check if API key is available
    if (!apiKey) {
      console.error('OpenAI API key is missing - falling back to rule-based filtering');
      throw new Error('OpenAI API key not configured');
    }
    
    // Log for debugging
    console.log('Attempting OpenAI API call for:', businessName);
    console.log('API key status:', apiKey ? 'present' : 'missing');
    
    // Check if GPT-4 should be used (via environment variable)
    const useGPT4 = import.meta.env.VITE_USE_GPT4_FILTERING === 'true';
    const model = useGPT4 ? 'gpt-4' : 'gpt-3.5-turbo';
    
    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: 'system',
          content: 'You are a business classification expert. Respond only with valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3, // Lower temperature for more consistent classification
      max_tokens: 150,
      response_format: { type: "json_object" } // Ensures JSON response
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    // Validate the response structure
    if (typeof result.isServiceProvider !== 'boolean' || 
        typeof result.confidence !== 'number' ||
        typeof result.reason !== 'string') {
      throw new Error('Invalid response structure from AI');
    }
    
    return {
      ...result,
      businessName,
      category,
      aiModel: model
    };
  } catch (error) {
    console.error('AI classification error:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      type: error.type,
      code: error.code
    });
    
    // Check for CORS error specifically
    if (error.message?.includes('CORS') || error.message?.includes('Failed to fetch')) {
      console.error('CORS error detected - OpenAI API cannot be called directly from browser in production');
      console.error('Consider using a backend proxy or serverless function');
    }
    
    // Use fallback rule-based filtering when AI fails
    const { isExcludedBusiness } = await import('../utils/leadFiltering');
    const exclusionResult = isExcludedBusiness(businessName, serviceType);
    
    return {
      isServiceProvider: !exclusionResult.excluded, // Use rule-based filtering as fallback
      confidence: 0.5, // Medium confidence for rule-based fallback
      reason: exclusionResult.excluded ? 
        `AI failed (${error.message}), rule-based exclusion: ${exclusionResult.reason}` : 
        `AI failed (${error.message}), rule-based filtering passed - including`,
      businessName,
      category,
      error: error.message,
      fallbackUsed: true
    };
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
  const results = [];
  const batchSize = 10; // OpenAI has higher rate limits than Claude
  
  for (let i = 0; i < businesses.length; i += batchSize) {
    const batch = businesses.slice(i, i + batchSize);
    
    // Process batch in parallel
    const batchPromises = batch.map(business => classifyBusiness(business, serviceType));
    const batchResults = await Promise.all(batchPromises);
    
    results.push(...batchResults);
    
    if (onProgress) {
      onProgress({
        processed: Math.min(i + batchSize, businesses.length),
        total: businesses.length,
        percentage: Math.round((Math.min(i + batchSize, businesses.length) / businesses.length) * 100)
      });
    }
    
    // Smaller delay for OpenAI
    if (i + batchSize < businesses.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  return results;
}

/**
 * Calculate cost estimate for AI filtering
 * @param {number} businessCount - Number of businesses to process
 * @param {boolean} useGPT4 - Whether to calculate for GPT-4 pricing
 * @returns {Object} - Cost breakdown
 */
export function estimateFilteringCost(businessCount, useGPT4 = false) {
  // Pricing per million tokens
  const pricing = useGPT4 ? {
    input: 30.00,  // GPT-4: $30 per million input tokens
    output: 60.00, // GPT-4: $60 per million output tokens
    model: 'gpt-4'
  } : {
    input: 0.50,   // GPT-3.5: $0.50 per million input tokens
    output: 1.50,  // GPT-3.5: $1.50 per million output tokens
    model: 'gpt-3.5-turbo'
  };
  
  const avgInputTokens = 250; // Average tokens per classification prompt (increased for examples)
  const avgOutputTokens = 50; // Average tokens per response
  
  const inputCost = (businessCount * avgInputTokens / 1000000) * pricing.input;
  const outputCost = (businessCount * avgOutputTokens / 1000000) * pricing.output;
  const totalCost = inputCost + outputCost;
  
  return {
    businessCount,
    model: pricing.model,
    estimatedTokens: {
      input: businessCount * avgInputTokens,
      output: businessCount * avgOutputTokens
    },
    estimatedCost: {
      input: inputCost.toFixed(4),
      output: outputCost.toFixed(4),
      total: totalCost.toFixed(4)
    },
    costPerBusiness: (totalCost / businessCount).toFixed(5),
    costPer1000: (totalCost / businessCount * 1000).toFixed(2)
  };
}

/**
 * Get summary statistics from classification results
 * @param {Array} results - Array of classification results
 * @returns {Object} - Summary statistics
 */
export function getClassificationStats(results) {
  const included = results.filter(r => r.isServiceProvider);
  const excluded = results.filter(r => !r.isServiceProvider);
  const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
  
  return {
    total: results.length,
    included: included.length,
    excluded: excluded.length,
    inclusionRate: (included.length / results.length * 100).toFixed(1) + '%',
    avgConfidence: avgConfidence.toFixed(3),
    lowConfidence: results.filter(r => r.confidence < 0.7).length,
    errors: results.filter(r => r.error).length
  };
}