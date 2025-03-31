-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enum types
CREATE TYPE creator_status AS ENUM (
    'pending_application',
    'needs_onboarding',
    'active',
    'denied',
    'suspended'
);

CREATE TYPE subscription_status AS ENUM (
    'active',
    'canceled',
    'past_due'
);

CREATE TYPE content_access_level AS ENUM (
    'public',
    'subscribers'
);

-- Create creator_applications table
CREATE TABLE creator_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    address JSONB NOT NULL, -- Encrypted storage for address details
    date_of_birth DATE NOT NULL,
    id_front_storage_path TEXT NOT NULL,
    id_back_storage_path TEXT NOT NULL,
    status creator_status NOT NULL DEFAULT 'pending_application',
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create subscription_tiers table
CREATE TABLE subscription_tiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price_monthly INTEGER NOT NULL, -- Stored in cents
    benefits TEXT[],
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscriber_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    tier_id UUID REFERENCES subscription_tiers(id) ON DELETE CASCADE,
    status subscription_status NOT NULL DEFAULT 'active',
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    payment_provider_subscription_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(subscriber_id, creator_id)
);

-- Modify profiles table
ALTER TABLE profiles
ADD COLUMN is_creator BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN creator_status creator_status,
ADD COLUMN display_name TEXT,
ADD COLUMN banner_image_url TEXT;

-- Modify content tables to add access_level
ALTER TABLE posts
ADD COLUMN access_level content_access_level NOT NULL DEFAULT 'public';

ALTER TABLE media_items
ADD COLUMN access_level content_access_level NOT NULL DEFAULT 'public';

ALTER TABLE videos
ADD COLUMN access_level content_access_level NOT NULL DEFAULT 'public';

-- Create indexes
CREATE INDEX idx_creator_applications_user_id ON creator_applications(user_id);
CREATE INDEX idx_subscription_tiers_creator_id ON subscription_tiers(creator_id);
CREATE INDEX idx_subscriptions_subscriber_id ON subscriptions(subscriber_id);
CREATE INDEX idx_subscriptions_creator_id ON subscriptions(creator_id);
CREATE INDEX idx_profiles_creator_status ON profiles(creator_status);

-- RLS Policies for creator_applications
ALTER TABLE creator_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own applications"
    ON creator_applications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own applications"
    ON creator_applications FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all applications"
    ON creator_applications FOR SELECT
    USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can update applications"
    ON creator_applications FOR UPDATE
    USING (auth.jwt() ->> 'role' = 'admin');

-- RLS Policies for subscription_tiers
ALTER TABLE subscription_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active tiers"
    ON subscription_tiers FOR SELECT
    USING (is_active = true);

CREATE POLICY "Creators can manage their own tiers"
    ON subscription_tiers FOR ALL
    USING (auth.uid() = creator_id);

-- RLS Policies for subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Subscribers can view their own subscriptions"
    ON subscriptions FOR SELECT
    USING (auth.uid() = subscriber_id);

CREATE POLICY "Creators can view their subscribers"
    ON subscriptions FOR SELECT
    USING (auth.uid() = creator_id);

CREATE POLICY "Admins can view all subscriptions"
    ON subscriptions FOR SELECT
    USING (auth.jwt() ->> 'role' = 'admin');

-- RLS Policies for profiles
CREATE POLICY "Users can update their own creator profile fields"
    ON profiles FOR UPDATE
    USING (
        auth.uid() = id AND
        is_creator = true AND
        (
            NEW.display_name IS NOT NULL OR
            NEW.banner_image_url IS NOT NULL
        )
    );

-- RLS Policies for content tables
CREATE POLICY "Users can view public content"
    ON posts FOR SELECT
    USING (access_level = 'public');

CREATE POLICY "Subscribers can view subscriber-only content"
    ON posts FOR SELECT
    USING (
        access_level = 'subscribers' AND
        EXISTS (
            SELECT 1 FROM subscriptions
            WHERE subscriber_id = auth.uid()
            AND creator_id = posts.user_id
            AND status = 'active'
        )
    );

-- Similar policies for media_items and videos tables...

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_creator_applications_updated_at
    BEFORE UPDATE ON creator_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_tiers_updated_at
    BEFORE UPDATE ON subscription_tiers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 