// Supabase Edge Function for OpenAI business classification
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { OpenAI } from 'https://deno.land/x/openai@v4.24.0/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { businesses, serviceType } = await req.json()
    
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    })

    const results = []
    
    for (const business of businesses) {
      const prompt = `Analyze if this business is a legitimate service provider for ${serviceType}:

Business Name: "${business.name || business.company_name}"
Category: "${business.category || business.categoryName || ''}"

Respond with ONLY a JSON object:
{
  "isServiceProvider": true/false,
  "confidence": 0.0-1.0,
  "reason": "brief explanation"
}`

      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
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
          temperature: 0.3,
          max_tokens: 150,
          response_format: { type: "json_object" }
        })

        const result = JSON.parse(response.choices[0].message.content)
        results.push({
          ...result,
          businessName: business.name || business.company_name,
          category: business.category || business.categoryName
        })
      } catch (error) {
        results.push({
          isServiceProvider: true,
          confidence: 0.5,
          reason: `Classification failed: ${error.message}`,
          businessName: business.name || business.company_name,
          category: business.category || business.categoryName,
          error: true
        })
      }
    }

    return new Response(
      JSON.stringify({ results }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})