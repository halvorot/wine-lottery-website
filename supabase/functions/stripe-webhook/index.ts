import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1'
import { Stripe } from 'https://esm.sh/stripe@12.18.0'

serve(async (req) => {
  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
    })

    // Get the signature from the headers
    const signature = req.headers.get('stripe-signature')
    if (!signature) {
      throw new Error('No stripe signature found')
    }

    // Get the raw body
    const body = await req.text()

    // Verify the webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''
    )

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      // Update the payment record
      const { error: updateError } = await supabaseClient
        .from('payments')
        .update({
          status: 'completed',
          stripe_payment_intent_id: session.payment_intent as string,
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_session_id', session.id)

      if (updateError) {
        throw new Error(`Failed to update payment: ${updateError.message}`)
      }

      // Get the entry_id from the payment record
      const { data: payment, error: paymentError } = await supabaseClient
        .from('payments')
        .select('entry_id')
        .eq('stripe_session_id', session.id)
        .single()

      if (paymentError || !payment) {
        throw new Error(`Failed to get payment details: ${paymentError?.message}`)
      }

      // Update the entry to mark it as paid
      const { error: entryError } = await supabaseClient
        .from('lottery_entries')
        .update({
          status: 'paid',
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment.entry_id)

      if (entryError) {
        throw new Error(`Failed to update entry: ${entryError.message}`)
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
}) 