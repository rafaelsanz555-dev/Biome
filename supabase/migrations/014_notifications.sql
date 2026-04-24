-- Create notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL, -- Who receives the notification
    actor_id UUID REFERENCES auth.users(id) NOT NULL, -- Who sent the gift/subscribed
    type VARCHAR(50) NOT NULL, -- 'gift', 'subscription', 'ppv'
    reference_id UUID, -- ID to the gift or transaction
    message TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
    ON notifications FOR UPDATE
    USING (auth.uid() = user_id);

-- Wait, the service_role rule is needed for the webhook?
-- Usually webhooks use service_role which bypasses RLS anyway.
