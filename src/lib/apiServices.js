// API Services for Lead Generation Platform
import axios from 'axios';

// OpenAI Service
export class OpenAIService {
  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    this.baseURL = 'https://api.openai.com/v1';
  }

  async extractLeadData(text, options = {}) {
    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a lead extraction specialist. Extract business contact information, company details, and potential lead data from the provided text. Return structured JSON data.'
            },
            {
              role: 'user',
              content: text
            }
          ],
          max_tokens: 1000,
          temperature: 0.3,
          ...options
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error(`OpenAI extraction failed: ${error.message}`);
    }
  }
}

// Google Maps Service
export class GoogleMapsService {
  constructor() {
    this.apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    this.baseURL = 'https://maps.googleapis.com/maps/api';
  }

  async searchBusinesses(query, location, radius = 5000) {
    try {
      const response = await axios.get(`${this.baseURL}/place/textsearch/json`, {
        params: {
          query: `${query} in ${location}`,
          radius,
          key: this.apiKey
        }
      });

      return response.data.results;
    } catch (error) {
      console.error('Google Maps API Error:', error);
      throw new Error(`Business search failed: ${error.message}`);
    }
  }

  async getPlaceDetails(placeId) {
    try {
      const response = await axios.get(`${this.baseURL}/place/details/json`, {
        params: {
          place_id: placeId,
          fields: 'name,formatted_address,formatted_phone_number,website,rating,reviews',
          key: this.apiKey
        }
      });

      return response.data.result;
    } catch (error) {
      console.error('Google Places API Error:', error);
      throw new Error(`Place details failed: ${error.message}`);
    }
  }
}

// Census Bureau Service
export class CensusService {
  constructor() {
    this.apiKey = import.meta.env.VITE_CENSUS_API_KEY;
    this.baseURL = 'https://api.census.gov/data';
  }

  async getPopulationData(state, county = '*') {
    try {
      const response = await axios.get(
        `${this.baseURL}/2021/acs/acs5/profile`,
        {
          params: {
            get: 'DP05_0001E,NAME',
            for: `county:${county}`,
            in: `state:${state}`,
            key: this.apiKey
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Census API Error:', error);
      throw new Error(`Census data failed: ${error.message}`);
    }
  }

  async getBusinessData(state, county = '*') {
    try {
      const response = await axios.get(
        `${this.baseURL}/2020/cbp`,
        {
          params: {
            get: 'EMP,ESTAB,NAICS2017_LABEL',
            for: `county:${county}`,
            in: `state:${state}`,
            NAICS2017: '23', // Construction sector
            key: this.apiKey
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Census Business API Error:', error);
      throw new Error(`Business data failed: ${error.message}`);
    }
  }
}

// Apify Service
export class ApifyService {
  constructor() {
    this.apiToken = import.meta.env.VITE_APIFY_API_TOKEN;
    this.baseURL = 'https://api.apify.com/v2';
  }

  async scrapeWebsite(url, options = {}) {
    try {
      const response = await axios.post(
        `${this.baseURL}/acts/apify~web-scraper/runs`,
        {
          startUrls: [{ url }],
          linkSelector: 'a[href]',
          pageFunction: `
            async function pageFunction(context) {
              const { page, request } = context;
              const title = await page.title();
              const content = await page.evaluate(() => document.body.innerText);
              
              return {
                url: request.url,
                title,
                content: content.substring(0, 5000), // Limit content length
                timestamp: new Date().toISOString()
              };
            }
          `,
          ...options
        },
        {
          params: { token: this.apiToken },
          headers: { 'Content-Type': 'application/json' }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Apify API Error:', error);
      throw new Error(`Web scraping failed: ${error.message}`);
    }
  }

  async getRunResults(runId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/acts/apify~web-scraper/runs/${runId}/dataset/items`,
        {
          params: { token: this.apiToken }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Apify Results API Error:', error);
      throw new Error(`Getting scraping results failed: ${error.message}`);
    }
  }
}

// ScrapingBee Service
export class ScrapingBeeService {
  constructor() {
    this.apiKey = import.meta.env.VITE_SCRAPINGBEE_API_KEY;
    this.baseURL = 'https://app.scrapingbee.com/api/v1';
  }

  async scrapeUrl(url, options = {}) {
    try {
      const response = await axios.get(this.baseURL, {
        params: {
          api_key: this.apiKey,
          url: url,
          render_js: true,
          premium_proxy: true,
          country_code: 'US',
          ...options
        }
      });

      return {
        content: response.data,
        status: response.status,
        headers: response.headers
      };
    } catch (error) {
      console.error('ScrapingBee API Error:', error);
      throw new Error(`ScrapingBee failed: ${error.message}`);
    }
  }

  async scrapeFacebookAds(pageUrl, options = {}) {
    try {
      const response = await this.scrapeUrl(pageUrl, {
        wait: 3000,
        wait_for: '.ads-container, [data-testid="ad"]',
        extract_rules: {
          ads: {
            selector: '[data-testid="ad"], .ad-container',
            output: {
              text: 'text',
              image: 'img@src',
              link: 'a@href'
            }
          }
        },
        ...options
      });

      return response;
    } catch (error) {
      console.error('Facebook Ads Scraping Error:', error);
      throw new Error(`Facebook ads scraping failed: ${error.message}`);
    }
  }
}

// Google Sheets Service
export class GoogleSheetsService {
  constructor() {
    this.scriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL;
  }

  async appendData(data) {
    try {
      const response = await axios.post(this.scriptUrl, {
        action: 'append',
        data: data
      });

      return response.data;
    } catch (error) {
      console.error('Google Sheets API Error:', error);
      throw new Error(`Google Sheets append failed: ${error.message}`);
    }
  }

  async readData(range = 'A:Z') {
    try {
      const response = await axios.post(this.scriptUrl, {
        action: 'read',
        range: range
      });

      return response.data;
    } catch (error) {
      console.error('Google Sheets Read Error:', error);
      throw new Error(`Google Sheets read failed: ${error.message}`);
    }
  }
}

// Export service instances
export const openAIService = new OpenAIService();
export const googleMapsService = new GoogleMapsService();
export const censusService = new CensusService();
export const apifyService = new ApifyService();
export const scrapingBeeService = new ScrapingBeeService();
export const googleSheetsService = new GoogleSheetsService();
