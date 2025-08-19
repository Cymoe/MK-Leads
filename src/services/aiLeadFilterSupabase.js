/**
 * AI-powered lead filtering using Supabase Edge Function
 * This avoids CORS issues by running on Supabase's servers
 */

import { supabase } from '../lib/supabase';

/**
 * Get Supabase Edge Function URL
 */
function getEdgeFunctionUrl() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  return `${supabaseUrl}/functions/v1/classify-business`;
}

/**
 * Classify businesses using Supabase Edge Function
 * @param {Array} businesses - Array of business objects
 * @param {string} serviceType - The service type we're filtering for
 * @param {Function} onProgress - Optional progress callback
 * @returns {Promise<Array>} - Array of classification results
 */
export async function classifyBusinessBatch(businesses, serviceType, onProgress) {
  const results = [];
  const batchSize = 10; // Process in batches to avoid timeouts
  const functionUrl = getEdgeFunctionUrl();
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  for (let i = 0; i < businesses.length; i += batchSize) {
    const batch = businesses.slice(i, i + batchSize);
    
    try {
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anonKey}`,
        },
        body: JSON.stringify({
          businesses: batch,
          serviceType
        })
      });

      if (!response.ok) {
        throw new Error(`Edge function error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      results.push(...(data.results || []));
      
    } catch (error) {
      console.error('Edge function batch error:', error);
      
      // Fallback to rule-based filtering for this batch
      const { isExcludedBusiness } = await import('../utils/leadFiltering');
      
      for (const business of batch) {
        const businessName = business.name || business.company_name || '';
        const exclusionResult = isExcludedBusiness(businessName, serviceType);
        
        results.push({
          isServiceProvider: !exclusionResult.excluded,
          confidence: 0.5,
          reason: exclusionResult.excluded ? 
            `Edge function failed, rule-based exclusion: ${exclusionResult.reason}` : 
            'Edge function failed, rule-based filtering passed - including',
          businessName,
          category: business.category || business.categoryName || '',
          error: error.message,
          fallbackUsed: true
        });
      }
    }
    
    if (onProgress) {
      onProgress({
        processed: Math.min(i + batchSize, businesses.length),
        total: businesses.length,
        percentage: Math.round((Math.min(i + batchSize, businesses.length) / businesses.length) * 100)
      });
    }
    
    // Small delay between batches
    if (i + batchSize < businesses.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  return results;
}

/**
 * Classify a single business using the Edge Function
 * @param {Object} business - Business object
 * @param {string} serviceType - The service type we're filtering for
 * @returns {Promise<Object>} - Classification result
 */
export async function classifyBusiness(business, serviceType) {
  const results = await classifyBusinessBatch([business], serviceType);
  return results[0];
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