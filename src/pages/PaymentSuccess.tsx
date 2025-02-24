import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, CheckCircle } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'

export function PaymentSuccess() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const sessionId = searchParams.get('session_id')
        if (!sessionId) {
          throw new Error('No session ID found')
        }

        // Get the payment details from Supabase
        const { data: payment, error: paymentError } = await supabase
          .from('payments')
          .select('id, status, amount, currency, entry_id')
          .eq('stripe_session_id', sessionId)
          .single()

        if (paymentError) {
          throw new Error('Payment verification failed')
        }

        if (!payment) {
          throw new Error('Payment not found')
        }

        if (payment.status !== 'completed') {
          throw new Error('Payment not completed')
        }

        // Get the entry details
        const { data: entry, error: entryError } = await supabase
          .from('lottery_entries')
          .select('id, status')
          .eq('id', payment.entry_id)
          .single()

        if (entryError || !entry) {
          throw new Error('Entry not found')
        }

        if (entry.status === 'pending') {
          // Update entry status to paid
          const { error: updateError } = await supabase
            .from('lottery_entries')
            .update({ status: 'paid' })
            .eq('id', entry.id)

          if (updateError) {
            throw new Error('Failed to update entry status')
          }
        }

        setLoading(false)
      } catch (err) {
        console.error('Payment verification error:', err)
        setError(err instanceof Error ? err.message : 'Payment verification failed')
        setLoading(false)
        toast({
          variant: 'destructive',
          title: 'Error',
          description: err instanceof Error ? err.message : 'Payment verification failed',
        })
      }
    }

    verifyPayment()
  }, [searchParams, toast])

  const handleContinue = () => {
    navigate('/entries')
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-red-600 mb-4">Payment Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => navigate('/entries')}>Return to Entries</Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="text-center">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-green-600 mb-4">Payment Successful!</h2>
        <p className="text-gray-600 mb-6">
          Thank you for your payment. Your entry has been confirmed.
        </p>
        <Button onClick={handleContinue}>View Your Entries</Button>
      </div>
    </Card>
  )
} 