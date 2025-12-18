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

function parseICalDate(dateStr: string): string {
  // Handle formats like: 20241225 or 20241225T150000Z
  if (dateStr.length === 8) {
    return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
  }
  // Handle datetime format
  const datePart = dateStr.split('T')[0];
  return `${datePart.substring(0, 4)}-${datePart.substring(4, 6)}-${datePart.substring(6, 8)}`;
}

function parseICalFeed(icalData: string): ICalEvent[] {
  const events: ICalEvent[] = [];
  const lines = icalData.split(/\r?\n/);
  
  let currentEvent: Partial<ICalEvent> | null = null;
  let currentKey = '';
  
  for (const line of lines) {
    // Handle line continuations (lines starting with space or tab)
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
        // Handle DTSTART;VALUE=DATE:20241225 or DTSTART:20241225T150000Z
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
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { pageId, airbnbUrl, bookingUrl } = await req.json();

    if (!pageId) {
      return new Response(
        JSON.stringify({ error: 'pageId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Starting iCal sync for page ${pageId}`);
    
    const results = {
      airbnb: { success: false, count: 0, error: null as string | null },
      booking: { success: false, count: 0, error: null as string | null },
    };

    // Delete existing external events for this page
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

    // Update last sync timestamp
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
