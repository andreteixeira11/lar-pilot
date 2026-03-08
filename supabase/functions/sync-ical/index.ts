import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ICalEvent {
  uid: string;
  summary: string;
  startDate: string;
  endDate: string;
}

const ALLOWED_DOMAINS = [
  'airbnb.com',
  'airbnb.co.uk',
  'airbnb.pt',
  'booking.com',
  'icalendar.booking.com',
];

function isAllowedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    // Block private/internal IPs
    const hostname = parsed.hostname;
    if (
      hostname === 'localhost' ||
      hostname.startsWith('127.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('169.254.') ||
      hostname.startsWith('172.') ||
      hostname === '0.0.0.0' ||
      hostname === '[::]' ||
      hostname === '[::1]'
    ) {
      return false;
    }
    // Check against allowed domains
    return ALLOWED_DOMAINS.some(domain => hostname === domain || hostname.endsWith('.' + domain));
  } catch {
    return false;
  }
}

function parseICalDate(dateStr: string): string {
  if (dateStr.length === 8) {
    return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
  }
  const datePart = dateStr.split('T')[0];
  return `${datePart.substring(0, 4)}-${datePart.substring(4, 6)}-${datePart.substring(6, 8)}`;
}

function parseICalFeed(icalData: string): ICalEvent[] {
  const events: ICalEvent[] = [];
  const lines = icalData.split(/\r?\n/);
  
  let currentEvent: Partial<ICalEvent> | null = null;
  
  for (const line of lines) {
    if (line.startsWith(' ') || line.startsWith('\t')) {
      continue;
    }
    
    if (line.startsWith('BEGIN:VEVENT')) {
      currentEvent = {};
    } else if (line.startsWith('END:VEVENT') && currentEvent) {
      if (currentEvent.uid && currentEvent.startDate && currentEvent.endDate) {
        events.push({
          uid: currentEvent.uid,
          summary: currentEvent.summary || 'Reservado',
          startDate: currentEvent.startDate,
          endDate: currentEvent.endDate,
        });
      }
      currentEvent = null;
    } else if (currentEvent) {
      if (line.startsWith('UID:')) {
        currentEvent.uid = line.substring(4).trim();
      } else if (line.startsWith('SUMMARY:')) {
        currentEvent.summary = line.substring(8).trim();
      } else if (line.startsWith('DTSTART')) {
        const value = line.split(':')[1]?.trim();
        if (value) {
          currentEvent.startDate = parseICalDate(value);
        }
      } else if (line.startsWith('DTEND')) {
        const value = line.split(':')[1]?.trim();
        if (value) {
          currentEvent.endDate = parseICalDate(value);
        }
      }
    }
  }
  
  return events;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnon = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Authenticate the user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userClient = createClient(supabaseUrl, supabaseAnon, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.claims.sub;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { pageId, airbnbUrl, bookingUrl } = await req.json();

    if (!pageId) {
      return new Response(
        JSON.stringify({ error: 'pageId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user owns this page
    const { data: pageData } = await supabase
      .from('direct_booking_pages')
      .select('id, property_id, properties!inner(user_id)')
      .eq('id', pageId)
      .single();

    if (!pageData || (pageData as any).properties?.user_id !== userId) {
      return new Response(
        JSON.stringify({ error: 'Forbidden' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate URLs against allowed domains
    if (airbnbUrl && !isAllowedUrl(airbnbUrl)) {
      return new Response(
        JSON.stringify({ error: 'Invalid Airbnb URL. Only airbnb.com domains are allowed.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (bookingUrl && !isAllowedUrl(bookingUrl)) {
      return new Response(
        JSON.stringify({ error: 'Invalid Booking URL. Only booking.com domains are allowed.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Starting iCal sync for page ${pageId}`);
    
    const results = {
      airbnb: { success: false, count: 0, error: null as string | null },
      booking: { success: false, count: 0, error: null as string | null },
    };

    const { error: deleteError } = await supabase
      .from('external_calendar_events')
      .delete()
      .eq('page_id', pageId);

    if (deleteError) {
      console.error('Error deleting existing events:', deleteError);
    }

    // Sync Airbnb iCal
    if (airbnbUrl) {
      try {
        console.log('Fetching Airbnb iCal...');
        const response = await fetch(airbnbUrl);
        if (response.ok) {
          const icalData = await response.text();
          const events = parseICalFeed(icalData);
          console.log(`Parsed ${events.length} events from Airbnb`);

          for (const event of events) {
            const { error } = await supabase
              .from('external_calendar_events')
              .upsert({
                page_id: pageId,
                source: 'airbnb',
                external_id: event.uid,
                summary: event.summary,
                start_date: event.startDate,
                end_date: event.endDate,
              }, {
                onConflict: 'page_id,external_id,source'
              });

            if (error) {
              console.error('Error inserting Airbnb event:', error);
            }
          }

          results.airbnb = { success: true, count: events.length, error: null };
        } else {
          results.airbnb.error = `HTTP ${response.status}`;
        }
      } catch (e: unknown) {
        console.error('Airbnb sync error:', e);
        results.airbnb.error = e instanceof Error ? e.message : 'Unknown error';
      }
    }

    // Sync Booking.com iCal
    if (bookingUrl) {
      try {
        console.log('Fetching Booking.com iCal...');
        const response = await fetch(bookingUrl);
        if (response.ok) {
          const icalData = await response.text();
          const events = parseICalFeed(icalData);
          console.log(`Parsed ${events.length} events from Booking.com`);

          for (const event of events) {
            const { error } = await supabase
              .from('external_calendar_events')
              .upsert({
                page_id: pageId,
                source: 'booking',
                external_id: event.uid,
                summary: event.summary,
                start_date: event.startDate,
                end_date: event.endDate,
              }, {
                onConflict: 'page_id,external_id,source'
              });

            if (error) {
              console.error('Error inserting Booking event:', error);
            }
          }

          results.booking = { success: true, count: events.length, error: null };
        } else {
          results.booking.error = `HTTP ${response.status}`;
        }
      } catch (e: unknown) {
        console.error('Booking sync error:', e);
        results.booking.error = e instanceof Error ? e.message : 'Unknown error';
      }
    }

    await supabase
      .from('direct_booking_pages')
      .update({ ical_last_sync: new Date().toISOString() })
      .eq('id', pageId);

    console.log('iCal sync completed:', results);

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Sync error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
