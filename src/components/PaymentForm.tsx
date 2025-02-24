import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

interface PaymentFormProps {
  entryId: string
  amount: number
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export function PaymentForm({ entryId, amount, onSuccess, onError }: PaymentFormProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()

  const handlePayment = async () => {
    try {
      setLoading(true)

      // Get the current session
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('You must be logged in to make a payment')
      }

      // Create checkout session
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            entryId,
            amount: amount * 100, // Convert to cents
            currency: 'usd',
          }),
        }
      )

      const { url, error } = await response.json()

      if (error) {
        throw new Error(error)
      }

      if (!url) {
        throw new Error('No checkout URL received')
      }

      // Redirect to Stripe Checkout
      window.location.href = url

      onSuccess?.()
    } catch (error) {
      console.error('Payment error:', error)
      toast({
        variant: 'destructive',
        title: 'Payment Error',
        description: error instanceof Error ? error.message : 'Failed to process payment',
      })
      onError?.(error instanceof Error ? error : new Error('Payment failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handlePayment}
      disabled={loading}
      className="w-full"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        `Pay $${amount.toFixed(2)}`
      )}
    </Button>
  )
} 