-- Create payments table
CREATE TABLE payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    entry_id UUID REFERENCES lottery_entries(id) NOT NULL,
    amount INTEGER NOT NULL,
    currency TEXT NOT NULL,
    status TEXT NOT NULL,
    stripe_session_id TEXT,
    stripe_payment_intent_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view payments"
    ON payments FOR SELECT
    USING (true);

CREATE POLICY "Anyone can insert payments"
    ON payments FOR INSERT
    WITH CHECK (true);

-- Create updated_at trigger
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX payments_entry_id_idx ON payments(entry_id);
CREATE INDEX payments_stripe_session_id_idx ON payments(stripe_session_id);

-- Add status column to lottery_entries
ALTER TABLE lottery_entries ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Create policy to only show paid entries by default
CREATE POLICY "Show only paid entries by default"
    ON lottery_entries FOR SELECT
    USING (status = 'paid' OR email = current_setting('request.jwt.claims')::json->>'email');

-- Create policy to allow creating pending entries
CREATE POLICY "Allow creating pending entries"
    ON lottery_entries FOR INSERT
    WITH CHECK (status = 'pending'); 