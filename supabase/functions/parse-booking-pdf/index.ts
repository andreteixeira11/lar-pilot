import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pdfBase64, platform } = await req.json();

    if (!pdfBase64) {
      return new Response(
        JSON.stringify({ error: 'PDF content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const platformName = platform || 'Booking';
    
    // Create a prompt to extract reservation data from the PDF
    const systemPrompt = `You are an expert at extracting reservation data from ${platformName}.com PDF confirmations. 
Extract the following information from the PDF content and return it as valid JSON:

{
  "guestName": "string - Full name of the main guest",
  "email": "string - Guest email if available, otherwise empty string",
  "guestCountry": "string - Country of the guest (look for 'Guest information' section, nationality, or country field). Return the country name in Portuguese (e.g., 'Portugal', 'Espanha', 'França', 'Reino Unido', 'Alemanha', 'Brasil', 'Estados Unidos')",
  "checkIn": "string - Check-in date in YYYY-MM-DD format",
  "checkOut": "string - Check-out date in YYYY-MM-DD format",
  "numGuests": "number - Total number of guests",
  "totalPrice": "number - Total price in EUR (just the number, no currency symbol)",
  "cleaningFee": "number - Cleaning fee if listed separately, otherwise 0",
  "touristTax": "number - Tourist tax if listed separately, otherwise 0",
  "accommodationPrice": "number - Accommodation price without fees/taxes",
  "platform": "${platformName}",
  "confirmationNumber": "string - Booking confirmation number if available",
  "propertyName": "string - Name of the property/accommodation"
}

Important:
- Dates must be in YYYY-MM-DD format
- All prices should be numbers only (no currency symbols)
- If a value is not found, use reasonable defaults (0 for numbers, empty string for text)
- Parse dates carefully - convert from DD/MM/YYYY or other formats to YYYY-MM-DD
- For guestCountry, look in the "Guest information" section which usually shows country with a flag icon
- Translate the country name to Portuguese (e.g., "Spain" -> "Espanha", "Germany" -> "Alemanha", "United Kingdom" -> "Reino Unido", "France" -> "França", "Italy" -> "Itália", "Netherlands" -> "Países Baixos", "Belgium" -> "Bélgica", "United States" -> "Estados Unidos", "Brazil" -> "Brasil")
- Return ONLY valid JSON, no additional text`;

    console.log(`Parsing ${platformName} PDF with AI...`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: [
              {
                type: 'text',
                text: `Please extract the reservation data from this ${platformName}.com confirmation PDF:`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:application/pdf;base64,${pdfBase64}`
                }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    console.log('AI Response:', aiResponse);

    // Try to parse the JSON from the AI response
    let extractedData;
    try {
      // Clean up the response - remove markdown code blocks if present
      let cleanedResponse = aiResponse.trim();
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```\n?/, '').replace(/\n?```$/, '');
      }
      
      extractedData = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to parse reservation data',
          rawResponse: aiResponse 
        }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Extracted data:', extractedData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: extractedData 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in parse-booking-pdf function:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
