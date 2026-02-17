-- Enhanced Workout Tracking Database Schema
-- This script creates comprehensive tables for intelligent workout tracking

-- Drop existing workout_tracking table if it exists to recreate with better schema
DROP TABLE IF EXISTS workout_tracking CASCADE;

-- Create enhanced workout_tracking table
CREATE TABLE IF NOT EXISTS workout_tracking (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Workout identification
    workout_day_name VARCHAR(100) NOT NULL,
    exercise_name VARCHAR(100) NOT NULL,
    
    -- Planned workout data
    required_sets INTEGER DEFAULT 0,
    required_reps INTEGER DEFAULT 0,
    required_weight VARCHAR(20), -- e.g., "50kg", "120lb", "bodyweight"
    suggested_rest_time INTEGER DEFAULT 0, -- seconds
    
    -- Actual performance data
    completed_sets INTEGER DEFAULT 0,
    completed_reps INTEGER DEFAULT 0,
    completed_weight VARCHAR(20), -- actual weight used
    actual_rest_time INTEGER DEFAULT 0, -- actual rest taken
    
    -- Performance metrics
    perceived_effort INTEGER CHECK (perceived_effort >= 1 AND perceived_effort <= 10), -- 1-10 scale
    form_quality INTEGER CHECK (form_quality >= 1 AND form_quality <= 5), -- 1-5 scale
    notes TEXT,
    
    -- Metadata
    workout_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint to prevent duplicate entries
    UNIQUE(user_id, workout_day_name, exercise_name, workout_date)
);

-- Create workout_plans table for weekly schedules
CREATE TABLE IF NOT EXISTS workout_plans (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Plan identification
    week_start_date DATE NOT NULL,
    plan_name VARCHAR(100),
    
    -- Weekly schedule data (JSON for flexibility)
    weekly_schedule JSONB NOT NULL DEFAULT '[]', -- Array of workout days
    
    -- Plan metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint for active plans per user per week
    UNIQUE(user_id, week_start_date)
);

-- Create workout_sessions table for daily workout sessions
CREATE TABLE IF NOT EXISTS workout_sessions (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Session identification
    session_date DATE NOT NULL DEFAULT CURRENT_DATE,
    workout_day_name VARCHAR(100) NOT NULL,
    
    -- Session summary
    total_exercises INTEGER DEFAULT 0,
    total_sets_planned INTEGER DEFAULT 0,
    total_sets_completed INTEGER DEFAULT 0,
    total_reps_planned INTEGER DEFAULT 0,
    total_reps_completed INTEGER DEFAULT 0,
    
    -- Session metrics
    session_duration INTEGER, -- minutes
    average_rest_time INTEGER, -- seconds
    perceived_difficulty INTEGER CHECK (perceived_difficulty >= 1 AND perceived_difficulty <= 10),
    
    -- Session status
    status VARCHAR(20) DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'skipped')),
    
    -- Notes and feedback
    session_notes TEXT,
    ai_feedback TEXT,
    
    -- Metadata
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint
    UNIQUE(user_id, session_date, workout_day_name)
);

-- Create exercise_performance table for tracking progress over time
CREATE TABLE IF NOT EXISTS exercise_performance (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Exercise identification
    exercise_name VARCHAR(100) NOT NULL,
    
    -- Performance records
    weight_used VARCHAR(20), -- e.g., "50kg", "120lb"
    reps_completed INTEGER,
    sets_completed INTEGER,
    
    -- Performance metrics
    one_rep_max_estimated DECIMAL(8,2), -- estimated 1RM
    volume_total INTEGER, -- total weight × reps × sets
    
    -- Relative performance
    personal_record BOOLEAN DEFAULT false,
    progression_type VARCHAR(20) CHECK (progression_type IN ('strength', 'hypertrophy', 'endurance', 'deload')),
    
    -- Metadata
    performance_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Index for performance tracking
    UNIQUE(user_id, exercise_name, performance_date, weight_used, reps_completed)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workout_tracking_user_id ON workout_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_tracking_workout_date ON workout_tracking(workout_date);
CREATE INDEX IF NOT EXISTS idx_workout_tracking_exercise_name ON workout_tracking(exercise_name);
CREATE INDEX IF NOT EXISTS idx_workout_tracking_user_date ON workout_tracking(user_id, workout_date);

CREATE INDEX IF NOT EXISTS idx_workout_plans_user_id ON workout_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_plans_week_start ON workout_plans(week_start_date);
CREATE INDEX IF NOT EXISTS idx_workout_plans_active ON workout_plans(is_active);

CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_id ON workout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_date ON workout_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_status ON workout_sessions(status);

CREATE INDEX IF NOT EXISTS idx_exercise_performance_user_id ON exercise_performance(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_performance_exercise ON exercise_performance(exercise_name);
CREATE INDEX IF NOT EXISTS idx_exercise_performance_date ON exercise_performance(performance_date);
CREATE INDEX IF NOT EXISTS idx_exercise_performance_pr ON exercise_performance(personal_record);

-- Enable Row Level Security (RLS)
ALTER TABLE workout_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_performance ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for workout_tracking
CREATE POLICY "Users can view own workout tracking" ON workout_tracking
    FOR SELECT USING (
        user_id IN (
            SELECT user_id FROM users WHERE clerk_user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can insert own workout tracking" ON workout_tracking
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT user_id FROM users WHERE clerk_user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can update own workout tracking" ON workout_tracking
    FOR UPDATE USING (
        user_id IN (
            SELECT user_id FROM users WHERE clerk_user_id = auth.uid()::text
        )
    );

-- Create RLS policies for workout_plans
CREATE POLICY "Users can view own workout plans" ON workout_plans
    FOR SELECT USING (
        user_id IN (
            SELECT user_id FROM users WHERE clerk_user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can insert own workout plans" ON workout_plans
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT user_id FROM users WHERE clerk_user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can update own workout plans" ON workout_plans
    FOR UPDATE USING (
        user_id IN (
            SELECT user_id FROM users WHERE clerk_user_id = auth.uid()::text
        )
    );

-- Create RLS policies for workout_sessions
CREATE POLICY "Users can view own workout sessions" ON workout_sessions
    FOR SELECT USING (
        user_id IN (
            SELECT user_id FROM users WHERE clerk_user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can insert own workout sessions" ON workout_sessions
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT user_id FROM users WHERE clerk_user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can update own workout sessions" ON workout_sessions
    FOR UPDATE USING (
        user_id IN (
            SELECT user_id FROM users WHERE clerk_user_id = auth.uid()::text
        )
    );

-- Create RLS policies for exercise_performance
CREATE POLICY "Users can view own exercise performance" ON exercise_performance
    FOR SELECT USING (
        user_id IN (
            SELECT user_id FROM users WHERE clerk_user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can insert own exercise performance" ON exercise_performance
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT user_id FROM users WHERE clerk_user_id = auth.uid()::text
        )
    );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_workout_tracking_updated_at BEFORE UPDATE ON workout_tracking
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_plans_updated_at BEFORE UPDATE ON workout_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_sessions_updated_at BEFORE UPDATE ON workout_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to calculate 1RM estimate
CREATE OR REPLACE FUNCTION calculate_estimated_1rm(
    weight_decimal DECIMAL,
    reps INTEGER
) RETURNS DECIMAL AS $$
BEGIN
    -- Using Epley formula: 1RM = weight × (1 + reps/30)
    -- Only calculate if we have valid data
    IF weight_decimal IS NULL OR reps IS NULL OR reps <= 0 THEN
        RETURN NULL;
    END IF;
    
    RETURN weight_decimal * (1 + (reps::DECIMAL / 30));
END;
$$ LANGUAGE plpgsql;

-- Create helper function to extract numeric weight from string
CREATE OR REPLACE FUNCTION extract_numeric_weight(weight_string VARCHAR) RETURNS DECIMAL AS $$
BEGIN
    -- Extract numeric value from weight strings like "50kg", "120lb", "52.5kg"
    IF weight_string IS NULL OR weight_string = '' THEN
        RETURN NULL;
    END IF;
    
    -- Use regex to extract numeric part
    RETURN (regexp_match(weight_string, '[0-9]+(\.[0-9]+)?'))[1]::DECIMAL;
END;
$$ LANGUAGE plpgsql;

-- Create view for workout summary
CREATE OR REPLACE VIEW workout_summary AS
SELECT 
    u.user_id,
    u.username,
    wt.workout_date,
    wt.workout_day_name,
    COUNT(DISTINCT wt.exercise_name) as exercise_count,
    SUM(wt.required_sets) as planned_sets,
    SUM(wt.completed_sets) as completed_sets,
    SUM(wt.required_reps) as planned_reps,
    SUM(wt.completed_reps) as completed_reps,
    ROUND((SUM(wt.completed_sets)::DECIMAL / NULLIF(SUM(wt.required_sets), 0)) * 100, 2) as completion_percentage,
    AVG(wt.perceived_effort) as avg_effort,
    ws.status as session_status,
    ws.session_duration
FROM users u
LEFT JOIN workout_tracking wt ON u.user_id = wt.user_id
LEFT JOIN workout_sessions ws ON u.user_id = ws.user_id AND wt.workout_date = ws.session_date AND wt.workout_day_name = ws.workout_day_name
GROUP BY u.user_id, u.username, wt.workout_date, wt.workout_day_name, ws.status, ws.session_duration
ORDER BY wt.workout_date DESC;

-- Create view for exercise progress
CREATE OR REPLACE VIEW exercise_progress AS
SELECT 
    ep.user_id,
    ep.exercise_name,
    ep.performance_date,
    ep.weight_used,
    ep.reps_completed,
    ep.sets_completed,
    ep.one_rep_max_estimated,
    ep.volume_total,
    ep.personal_record,
    LAG(ep.one_rep_max_estimated) OVER (PARTITION BY ep.user_id, ep.exercise_name ORDER BY ep.performance_date) as previous_1rm,
    ROUND(((ep.one_rep_max_estimated - LAG(ep.one_rep_max_estimated) OVER (PARTITION BY ep.user_id, ep.exercise_name ORDER BY ep.performance_date)) / NULLIF(LAG(ep.one_rep_max_estimated) OVER (PARTITION BY ep.user_id, ep.exercise_name ORDER BY ep.performance_date), 0)) * 100, 2) as strength_progress_percentage
FROM exercise_performance ep
ORDER BY ep.exercise_name, ep.performance_date DESC;

COMMENT ON TABLE workout_tracking IS 'Detailed tracking of individual exercises and sets';
COMMENT ON TABLE workout_plans IS 'Weekly workout plans and schedules';
COMMENT ON TABLE workout_sessions IS 'Daily workout session summaries';
COMMENT ON TABLE exercise_performance IS 'Historical performance data for progress tracking';
COMMENT ON VIEW workout_summary IS 'Summary view for workout completion and performance';
COMMENT ON VIEW exercise_progress IS 'Progress tracking view with strength gains';
