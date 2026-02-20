-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    user_id UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    clerk_user_id TEXT UNIQUE NOT NULL,
    username TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    conversation TEXT NOT NULL,
    important_info TEXT,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create nutrition_tracking table
CREATE TABLE IF NOT EXISTS nutrition_tracking (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    protein_consumed DECIMAL(10,2) DEFAULT 0,
    protein_required DECIMAL(10,2) DEFAULT 0,
    carbs_consumed DECIMAL(10,2) DEFAULT 0,
    carbs_required DECIMAL(10,2) DEFAULT 0,
    fat_consumed DECIMAL(10,2) DEFAULT 0,
    fat_required DECIMAL(10,2) DEFAULT 0,
    calories_consumed DECIMAL(10,2) DEFAULT 0,
    calories_required DECIMAL(10,2) DEFAULT 0,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analysis_results table for GLM flash results
CREATE TABLE IF NOT EXISTS analysis_results (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    analysis_result JSONB NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_date ON conversations(date);
CREATE INDEX IF NOT EXISTS idx_users_clerk_user_id ON users(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_tracking_user_id ON nutrition_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_tracking_timestamp ON nutrition_tracking(timestamp);
CREATE INDEX IF NOT EXISTS idx_analysis_results_user_id ON analysis_results(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_results_timestamp ON analysis_results(timestamp);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only access their own data
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid()::text = clerk_user_id);

CREATE POLICY "Users can insert own data" ON users
    FOR INSERT WITH CHECK (auth.uid()::text = clerk_user_id);

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid()::text = clerk_user_id);

-- Messages policies
CREATE POLICY "Users can view own messages" ON messages
    FOR SELECT USING (
        user_id IN (
            SELECT user_id FROM users WHERE clerk_user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can insert own messages" ON messages
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT user_id FROM users WHERE clerk_user_id = auth.uid()::text
        )
    );

-- Conversations policies
CREATE POLICY "Users can view own conversations" ON conversations
    FOR SELECT USING (
        user_id IN (
            SELECT user_id FROM users WHERE clerk_user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can insert own conversations" ON conversations
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT user_id FROM users WHERE clerk_user_id = auth.uid()::text
        )
    );

-- Nutrition tracking policies
CREATE POLICY "Users can view own nutrition tracking" ON nutrition_tracking
    FOR SELECT USING (
        user_id IN (
            SELECT user_id FROM users WHERE clerk_user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can insert own nutrition tracking" ON nutrition_tracking
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT user_id FROM users WHERE clerk_user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can update own nutrition tracking" ON nutrition_tracking
    FOR UPDATE USING (
        user_id IN (
            SELECT user_id FROM users WHERE clerk_user_id = auth.uid()::text
        )
    );

-- Analysis results policies
CREATE POLICY "Users can view own analysis results" ON analysis_results
    FOR SELECT USING (
        user_id IN (
            SELECT user_id FROM users WHERE clerk_user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can insert own analysis results" ON analysis_results
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT user_id FROM users WHERE clerk_user_id = auth.uid()::text
        )
    );
