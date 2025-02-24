import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1'
import { Stripe } from 'https://esm.sh/stripe@12.18.0'
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Parse the request body
    const { entryId, amount, currency = 'usd', email, name } = await req.json()

    if (!entryId || !amount || !email || !name) {
      throw new Error('Missing required fields')
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
    })

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      client_reference_id: entryId,
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: 'Entry Ticket',
              description: `Entry ticket for ${name}`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${Deno.env.get('SITE_URL')}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${Deno.env.get('SITE_URL')}/payment/cancel`,
      metadata: {
        entryId,
        email,
        name,
      },
    })

    // Create a pending payment record
    const { error: paymentError } = await supabaseClient
      .from('payments')
      .insert({
        entry_id: entryId,
        amount,
        currency,
        status: 'pending',
        stripe_session_id: session.id,
      })

    if (paymentError) {
      throw new Error(`Failed to create payment record: ${paymentError.message}`)
    }

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
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