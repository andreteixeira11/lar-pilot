import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MULTIBANCO_API_URL = 'https://api.ifthenpay.com/multibanco/reference/init';
const MBWAY_API_URL = 'https://api.ifthenpay.com/spg/payment/mbway';
const MBWAY_STATUS_URL = 'https://api.ifthenpay.com/spg/payment/mbway/status';

interface MultibancoRequest {
  amount: string;
  orderId: string;
  description?: string;
  clientEmail?: string;
  clientName?: string;
  clientPhone?: string;
  expiryDays?: number;
}

interface MBWayRequest {
  amount: string;
  orderId: string;
  mobileNumber: string;
  description?: string;
  email?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();
    
    console.log(`IfthenPay payment action: ${action}`, params);

    const mbKey = Deno.env.get('IFTHENPAY_MB_KEY');
    const mbWayKey = Deno.env.get('IFTHENPAY_MBWAY_KEY');

    if (!mbKey || !mbWayKey) {
      console.error('Missing IfthenPay keys');
      throw new Error('Payment configuration missing');
    }

    let result;

    switch (action) {
      case 'create-multibanco': {
        const { amount, orderId, description, clientEmail, clientName, clientPhone, expiryDays } = params as MultibancoRequest;
        
        console.log('Creating Multibanco reference:', { amount, orderId, description });

        const response = await fetch(MULTIBANCO_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mbKey,
            orderId: orderId.substring(0, 25), // Max 25 chars
            amount,
            description: description?.substring(0, 200) || '',
            clientEmail: clientEmail?.substring(0, 200) || '',
            clientName: clientName?.substring(0, 200) || '',
            clientPhone: clientPhone?.substring(0, 200) || '',
            ...(expiryDays !== undefined && { expiryDays: String(expiryDays) }),
          }),
        });

        const data = await response.json();
        console.log('Multibanco API response:', data);

        if (data.Status !== '0' && data.Status !== 0) {
          throw new Error(data.Message || 'Failed to create Multibanco reference');
        }

        result = {
          success: true,
          entity: data.Entity,
          reference: data.Reference,
          amount: data.Amount,
          expiryDate: data.ExpiryDate,
          requestId: data.RequestId,
          orderId: data.OrderId,
        };
        break;
      }

      case 'create-mbway': {
        const { amount, orderId, mobileNumber, description, email } = params as MBWayRequest;
        
        // Format phone number: 351#912345678
        let formattedPhone = mobileNumber.replace(/\D/g, '');
        if (!formattedPhone.startsWith('351')) {
          formattedPhone = `351#${formattedPhone}`;
        } else {
          formattedPhone = `351#${formattedPhone.substring(3)}`;
        }

        console.log('Creating MB Way payment:', { amount, orderId, mobileNumber: formattedPhone });

        const response = await fetch(MBWAY_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mbWayKey,
            orderId: orderId.substring(0, 15), // Max 15 chars for MB Way
            amount,
            mobileNumber: formattedPhone,
            description: description?.substring(0, 100) || '',
            email: email?.substring(0, 100) || '',
          }),
        });

        const data = await response.json();
        console.log('MB Way API response:', data);

        if (data.Status !== '000') {
          throw new Error(data.Message || 'Failed to create MB Way payment');
        }

        result = {
          success: true,
          requestId: data.RequestId,
          orderId: data.orderId,
          amount: data.Amount,
          status: data.Message,
        };
        break;
      }

      case 'check-mbway-status': {
        const { requestId } = params;
        
        console.log('Checking MB Way status:', { requestId });

        const response = await fetch(
          `${MBWAY_STATUS_URL}?mbWayKey=${mbWayKey}&requestId=${requestId}`
        );

        const data = await response.json();
        console.log('MB Way status response:', data);

        // Status "000" = Success/Paid
        result = {
          success: true,
          status: data.Status,
          message: data.Message,
          isPaid: data.Status === '000' && data.Message === 'Success',
          createdAt: data.CreatedAt,
          updatedAt: data.UpdateAt,
        };
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('IfthenPay payment error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred processing the payment';
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
