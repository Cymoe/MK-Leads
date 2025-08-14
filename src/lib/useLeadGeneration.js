import { useState, useCallback } from 'react';
import { 
  openAIService, 
  googleMapsService, 
  censusService, 
  apifyService, 
  scrapingBeeService, 
  googleSheetsService 
} from './apiServices';
import { supabase } from './supabase';

/**
 * Comprehensive React hook for lead generation platform
 * Integrates all API services and provides unified interface
 */
export function useLeadGeneration() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  // Business Search with Google Maps
  const searchBusinesses = useCallback(async (query, location, options = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const businesses = await googleMapsService.searchBusinesses(query, location, options.radius);
      
      // Enhance with place details if requested
      if (options.includeDetails) {
        const enhancedBusinesses = await Promise.all(
          businesses.slice(0, 10).map(async (business) => {
            try {
              const details = await googleMapsService.getPlaceDetails(business.place_id);
              return { ...business, details };
            } catch (err) {
              console.warn(`Failed to get details for ${business.name}:`, err);
              return business;
            }
          })
        );
        setResults(enhancedBusinesses);
        return enhancedBusinesses;
      }

      setResults(businesses);
      return businesses;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Market Analysis with Census Data
  const analyzeMarket = useCallback(async (state, county = '*') => {
    setIsLoading(true);
    setError(null);

    try {
      const [populationData, businessData] = await Promise.all([
        censusService.getPopulationData(state, county),
        censusService.getBusinessData(state, county)
      ]);

      const analysis = {
        population: populationData,
        businesses: businessData,
        marketScore: calculateMarketScore(populationData, businessData),
        timestamp: new Date().toISOString()
      };

      setResults(analysis);
      return analysis;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Lead Extraction with AI
  const extractLeads = useCallback(async (text, source = 'manual') => {
    setIsLoading(true);
    setError(null);

    try {
      const extractedData = await openAIService.extractLeadData(text, {
        temperature: 0.2,
        max_tokens: 1500
      });

      // Parse the AI response (assuming JSON format)
      let parsedLeads;
      try {
        parsedLeads = JSON.parse(extractedData);
      } catch (parseErr) {
        // If not JSON, create structured data from text
        parsedLeads = {
          raw_text: text,
          extracted_info: extractedData,
          source: source,
          timestamp: new Date().toISOString()
        };
      }

      // Store in Supabase
      const { data: savedLead, error: saveError } = await supabase
        .from('leads')
        .insert([{
          ...parsedLeads,
          source,
          created_at: new Date().toISOString()
        }])
        .select();

      if (saveError) {
        console.warn('Failed to save lead to Supabase:', saveError);
      }

      setResults(parsedLeads);
      return parsedLeads;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Web Scraping with Apify
  const scrapeWebsite = useCallback(async (url, options = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const scrapeRun = await apifyService.scrapeWebsite(url, options);
      
      // Wait for completion and get results
      let attempts = 0;
      const maxAttempts = 30; // 5 minutes max wait
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
        
        try {
          const results = await apifyService.getRunResults(scrapeRun.data.id);
          if (results && results.length > 0) {
            setResults(results);
            return results;
          }
        } catch (resultErr) {
          console.log('Still processing...', attempts + 1);
        }
        
        attempts++;
      }

      throw new Error('Scraping timeout - results not ready');
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Facebook Ads Analysis
  const analyzeFacebookAds = useCallback(async (pageUrl) => {
    setIsLoading(true);
    setError(null);

    try {
      const adsData = await scrapingBeeService.scrapeFacebookAds(pageUrl);
      
      // Process and analyze the ads data
      const analysis = {
        url: pageUrl,
        ads_found: adsData.content?.ads?.length || 0,
        ads_data: adsData.content?.ads || [],
        analysis_date: new Date().toISOString(),
        raw_data: adsData
      };

      // Store analysis in Supabase
      const { data: savedAnalysis, error: saveError } = await supabase
        .from('facebook_ads_analysis')
        .insert([analysis])
        .select();

      if (saveError) {
        console.warn('Failed to save Facebook ads analysis:', saveError);
      }

      setResults(analysis);
      return analysis;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Export to Google Sheets
  const exportToSheets = useCallback(async (data, sheetName = 'Leads') => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await googleSheetsService.appendData({
        sheet: sheetName,
        data: Array.isArray(data) ? data : [data]
      });

      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get leads from Supabase
  const getLeads = useCallback(async (filters = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase.from('leads').select('*');

      // Apply filters
      if (filters.source) {
        query = query.eq('source', filters.source);
      }
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      const { data, error: fetchError } = await query
        .order('created_at', { ascending: false })
        .limit(filters.limit || 100);

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setResults(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Clear results and errors
  const clearResults = useCallback(() => {
    setResults(null);
    setError(null);
  }, []);

  return {
    // Actions
    searchBusinesses,
    analyzeMarket,
    extractLeads,
    scrapeWebsite,
    analyzeFacebookAds,
    exportToSheets,
    getLeads,
    clearResults,
    
    // State
    isLoading,
    error,
    results
  };
}

// Helper function to calculate market score
function calculateMarketScore(populationData, businessData) {
  try {
    // Simple scoring algorithm - can be enhanced
    const population = populationData?.[1]?.[0] || 0;
    const businesses = businessData?.[1]?.[1] || 0;
    
    const populationScore = Math.min(population / 100000, 1) * 40; // Max 40 points
    const businessScore = Math.min(businesses / 100, 1) * 30; // Max 30 points
    const competitionScore = Math.max(0, 30 - (businesses / 10)); // Max 30 points, lower is better
    
    return Math.round(populationScore + businessScore + competitionScore);
  } catch (error) {
    console.warn('Error calculating market score:', error);
    return 0;
  }
}
