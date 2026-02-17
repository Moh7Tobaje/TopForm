-- Progress Tracking Database Schema
-- Enhanced tables for intelligent progress tracking with streaks, PRs, and AI insights

-- Create progress_streaks table for tracking user activity streaks
CREATE TABLE IF NOT EXISTS progress_streaks (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Streak tracking
    current_streak INTEGER DEFAULT 0, -- Current consecutive days
    longest_streak INTEGER DEFAULT 0, -- Longest streak ever achieved
    last_activity_date DATE, -- Last date user was active
    
    -- Streak type tracking
    workout_streak INTEGER DEFAULT 0, -- Consecutive workout days
    nutrition_streak INTEGER DEFAULT 0, -- Consecutive nutrition tracking days
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint
    UNIQUE(user_id)
);

-- Create personal_records table for tracking PRs
CREATE TABLE IF NOT EXISTS personal_records (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Exercise identification
    exercise_name VARCHAR(100) NOT NULL,
    
    -- PR types
    weight_pr DECIMAL(10,2), -- Heaviest weight lifted
    reps_pr INTEGER, -- Most reps at given weight
    volume_pr INTEGER, -- Highest volume (weight × reps × sets)
    time_pr INTEGER, -- Best time for timed exercises (seconds)
    
    -- PR details
    pr_date DATE NOT NULL DEFAULT CURRENT_DATE,
    pr_details JSONB, -- Additional details like sets, rest time, etc.
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Simple unique constraint - one PR per exercise per day
    UNIQUE(user_id, exercise_name, pr_date)
);

-- Create daily_progress_summary table for daily dashboard data
CREATE TABLE IF NOT EXISTS daily_progress_summary (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Date tracking
    summary_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Workout summary
    workouts_completed INTEGER DEFAULT 0,
    exercises_completed INTEGER DEFAULT 0,
    total_sets_completed INTEGER DEFAULT 0,
    total_reps_completed INTEGER DEFAULT 0,
    estimated_calories_burned INTEGER DEFAULT 0,
    
    -- Nutrition summary (aggregated from nutrition_tracking)
    total_calories_consumed DECIMAL(10,2) DEFAULT 0,
    total_protein_consumed DECIMAL(10,2) DEFAULT 0,
    total_carbs_consumed DECIMAL(10,2) DEFAULT 0,
    total_fat_consumed DECIMAL(10,2) DEFAULT 0,
    
    -- Daily goals and achievements
    daily_calorie_goal INTEGER DEFAULT 2000,
    daily_protein_goal DECIMAL(10,2) DEFAULT 150,
    workout_goal_completed BOOLEAN DEFAULT false,
    nutrition_goal_completed BOOLEAN DEFAULT false,
    
    -- Performance metrics
    day_score INTEGER CHECK (day_score >= 0 AND day_score <= 100), -- 0-100 score
    effort_level INTEGER CHECK (effort_level >= 1 AND effort_level <= 10),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint
    UNIQUE(user_id, summary_date)
);

-- Create weekly_macros_summary table for weekly nutrition trends
CREATE TABLE IF NOT EXISTS weekly_macros_summary (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Week tracking
    week_start_date DATE NOT NULL, -- Monday of the week
    week_end_date DATE NOT NULL, -- Sunday of the week
    
    -- Weekly averages
    avg_daily_calories DECIMAL(10,2) DEFAULT 0,
    avg_daily_protein DECIMAL(10,2) DEFAULT 0,
    avg_daily_carbs DECIMAL(10,2) DEFAULT 0,
    avg_daily_fat DECIMAL(10,2) DEFAULT 0,
    
    -- Weekly totals
    total_calories DECIMAL(10,2) DEFAULT 0,
    total_protein DECIMAL(10,2) DEFAULT 0,
    total_carbs DECIMAL(10,2) DEFAULT 0,
    total_fat DECIMAL(10,2) DEFAULT 0,
    
    -- Weekly goals compliance
    calorie_compliance_percentage DECIMAL(5,2) DEFAULT 0, -- % of days meeting calorie goal
    protein_compliance_percentage DECIMAL(5,2) DEFAULT 0, -- % of days meeting protein goal
    
    -- Trend analysis
    calories_trend VARCHAR(10) CHECK (calories_trend IN ('increasing', 'decreasing', 'stable')),
    protein_trend VARCHAR(10) CHECK (protein_trend IN ('increasing', 'decreasing', 'stable')),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint
    UNIQUE(user_id, week_start_date)
);

-- Create ai_insights table for storing AI-generated insights
CREATE TABLE IF NOT EXISTS ai_insights (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Insight categorization
    insight_type VARCHAR(20) CHECK (insight_type IN ('motivation', 'warning', 'achievement', 'recommendation', 'pattern')),
    insight_category VARCHAR(20) CHECK (insight_category IN ('workout', 'nutrition', 'recovery', 'consistency')),
    
    -- Insight content
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    actionable_advice TEXT,
    
    -- Insight relevance
    priority_level INTEGER CHECK (priority_level >= 1 AND priority_level <= 5), -- 1=low, 5=high
    relevance_score DECIMAL(3,2) CHECK (relevance_score >= 0 AND relevance_score <= 1), -- AI confidence
    
    -- Data context
    based_on_data JSONB, -- What data triggered this insight
    time_period VARCHAR(20), -- 'last_7_days', 'last_month', etc.
    
    -- User interaction
    is_read BOOLEAN DEFAULT false,
    is_bookmarked BOOLEAN DEFAULT false,
    user_feedback INTEGER CHECK (user_feedback >= 1 AND user_feedback <= 5), -- User rating
    
    -- Metadata
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE, -- When insight becomes less relevant
    
    -- Indexes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create progress_milestones table for tracking achievements
CREATE TABLE IF NOT EXISTS progress_milestones (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Milestone details
    milestone_type VARCHAR(20) CHECK (milestone_type IN ('streak', 'weight', 'volume', 'consistency', 'goal')),
    milestone_name VARCHAR(100) NOT NULL,
    milestone_description TEXT,
    
    -- Milestone criteria
    target_value INTEGER NOT NULL,
    current_value INTEGER DEFAULT 0,
    is_achieved BOOLEAN DEFAULT false,
    
    -- Achievement tracking
    achieved_at TIMESTAMP WITH TIME ZONE,
    celebration_sent BOOLEAN DEFAULT false,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint
    UNIQUE(user_id, milestone_type, milestone_name)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_progress_streaks_user_id ON progress_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_streaks_last_activity ON progress_streaks(last_activity_date);

CREATE INDEX IF NOT EXISTS idx_personal_records_user_id ON personal_records(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_records_exercise ON personal_records(exercise_name);
CREATE INDEX IF NOT EXISTS idx_personal_records_date ON personal_records(pr_date);
CREATE INDEX IF NOT EXISTS idx_personal_records_type ON personal_records(exercise_name);

CREATE INDEX IF NOT EXISTS idx_daily_progress_user_id ON daily_progress_summary(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_progress_date ON daily_progress_summary(summary_date);
CREATE INDEX IF NOT EXISTS idx_daily_progress_score ON daily_progress_summary(day_score);

CREATE INDEX IF NOT EXISTS idx_weekly_macros_user_id ON weekly_macros_summary(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_macros_week_start ON weekly_macros_summary(week_start_date);

CREATE INDEX IF NOT EXISTS idx_ai_insights_user_id ON ai_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_type ON ai_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_ai_insights_priority ON ai_insights(priority_level);
CREATE INDEX IF NOT EXISTS idx_ai_insights_read ON ai_insights(is_read);
CREATE INDEX IF NOT EXISTS idx_ai_insights_generated ON ai_insights(generated_at);

CREATE INDEX IF NOT EXISTS idx_progress_milestones_user_id ON progress_milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_milestones_type ON progress_milestones(milestone_type);
CREATE INDEX IF NOT EXISTS idx_progress_milestones_achieved ON progress_milestones(is_achieved);

-- Enable Row Level Security (RLS)
ALTER TABLE progress_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_progress_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_macros_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_milestones ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for progress_streaks
CREATE POLICY "Users can view own progress streaks" ON progress_streaks
    FOR SELECT USING (
        user_id IN (
            SELECT user_id FROM users WHERE clerk_user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can insert own progress streaks" ON progress_streaks
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT user_id FROM users WHERE clerk_user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can update own progress streaks" ON progress_streaks
    FOR UPDATE USING (
        user_id IN (
            SELECT user_id FROM users WHERE clerk_user_id = auth.uid()::text
        )
    );

-- Create RLS policies for personal_records
CREATE POLICY "Users can view own personal records" ON personal_records
    FOR SELECT USING (
        user_id IN (
            SELECT user_id FROM users WHERE clerk_user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can insert own personal records" ON personal_records
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT user_id FROM users WHERE clerk_user_id = auth.uid()::text
        )
    );

-- Create RLS policies for daily_progress_summary
CREATE POLICY "Users can view own daily progress" ON daily_progress_summary
    FOR SELECT USING (
        user_id IN (
            SELECT user_id FROM users WHERE clerk_user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can insert own daily progress" ON daily_progress_summary
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT user_id FROM users WHERE clerk_user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can update own daily progress" ON daily_progress_summary
    FOR UPDATE USING (
        user_id IN (
            SELECT user_id FROM users WHERE clerk_user_id = auth.uid()::text
        )
    );

-- Create RLS policies for weekly_macros_summary
CREATE POLICY "Users can view own weekly macros" ON weekly_macros_summary
    FOR SELECT USING (
        user_id IN (
            SELECT user_id FROM users WHERE clerk_user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can insert own weekly macros" ON weekly_macros_summary
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT user_id FROM users WHERE clerk_user_id = auth.uid()::text
        )
    );

-- Create RLS policies for ai_insights
CREATE POLICY "Users can view own AI insights" ON ai_insights
    FOR SELECT USING (
        user_id IN (
            SELECT user_id FROM users WHERE clerk_user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can insert own AI insights" ON ai_insights
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT user_id FROM users WHERE clerk_user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can update own AI insights" ON ai_insights
    FOR UPDATE USING (
        user_id IN (
            SELECT user_id FROM users WHERE clerk_user_id = auth.uid()::text
        )
    );

-- Create RLS policies for progress_milestones
CREATE POLICY "Users can view own progress milestones" ON progress_milestones
    FOR SELECT USING (
        user_id IN (
            SELECT user_id FROM users WHERE clerk_user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can insert own progress milestones" ON progress_milestones
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT user_id FROM users WHERE clerk_user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can update own progress milestones" ON progress_milestones
    FOR UPDATE USING (
        user_id IN (
            SELECT user_id FROM users WHERE clerk_user_id = auth.uid()::text
        )
    );

-- Create triggers for updated_at
CREATE TRIGGER update_progress_streaks_updated_at BEFORE UPDATE ON progress_streaks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_progress_updated_at BEFORE UPDATE ON daily_progress_summary
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weekly_macros_updated_at BEFORE UPDATE ON weekly_macros_summary
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_progress_milestones_updated_at BEFORE UPDATE ON progress_milestones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to update streaks automatically
CREATE OR REPLACE FUNCTION update_activity_streak(
    p_user_id UUID,
    activity_date DATE DEFAULT CURRENT_DATE
) RETURNS VOID AS $$
DECLARE
    current_streak_val INTEGER;
    last_activity_val DATE;
BEGIN
    -- Get current streak info
    SELECT current_streak, last_activity_date INTO current_streak_val, last_activity_val
    FROM progress_streaks 
    WHERE user_id = p_user_id;
    
    -- Insert or update streak
    INSERT INTO progress_streaks (user_id, current_streak, last_activity_date)
    VALUES (p_user_id, 1, activity_date)
    ON CONFLICT (user_id) DO UPDATE SET
        current_streak = CASE 
            WHEN activity_date = progress_streaks.last_activity_date + INTERVAL '1 day' 
            THEN progress_streaks.current_streak + 1
            WHEN activity_date = progress_streaks.last_activity_date 
            THEN progress_streaks.current_streak
            ELSE 1
        END,
        last_activity_date = activity_date,
        longest_streak = GREATEST(
            progress_streaks.longest_streak,
            CASE 
                WHEN activity_date = progress_streaks.last_activity_date + INTERVAL '1 day' 
                THEN progress_streaks.current_streak + 1
                WHEN activity_date = progress_streaks.last_activity_date 
                THEN progress_streaks.current_streak
                ELSE 1
            END
        );
END;
$$ LANGUAGE plpgsql;

-- Create view for comprehensive progress dashboard
CREATE OR REPLACE VIEW progress_dashboard AS
SELECT 
    u.user_id,
    u.username,
    
    -- Streak data
    ps.current_streak,
    ps.longest_streak,
    ps.last_activity_date,
    
    -- Today's summary
    dps.workouts_completed as today_workouts,
    dps.exercises_completed as today_exercises,
    dps.total_sets_completed as today_sets,
    dps.total_calories_consumed as today_calories,
    dps.total_protein_consumed as today_protein,
    dps.day_score as today_score,
    
    -- Weekly averages
    wms.avg_daily_calories as weekly_avg_calories,
    wms.avg_daily_protein as weekly_avg_protein,
    wms.calorie_compliance_percentage,
    wms.protein_compliance_percentage,
    
    -- Recent PRs count
    (SELECT COUNT(*) FROM personal_records pr 
     WHERE pr.user_id = u.user_id AND pr.pr_date >= CURRENT_DATE - INTERVAL '7 days') as recent_prs_count,
    
    -- Unread insights
    (SELECT COUNT(*) FROM ai_insights ai 
     WHERE ai.user_id = u.user_id AND ai.is_read = false) as unread_insights_count,
     
    -- Achieved milestones
    (SELECT COUNT(*) FROM progress_milestones pm 
     WHERE pm.user_id = u.user_id AND pm.is_achieved = true) as achieved_milestones_count

FROM users u
LEFT JOIN progress_streaks ps ON u.user_id = ps.user_id
LEFT JOIN daily_progress_summary dps ON u.user_id = dps.user_id AND dps.summary_date = CURRENT_DATE
LEFT JOIN weekly_macros_summary wms ON u.user_id = wms.user_id 
    AND wms.week_start_date = date_trunc('week', CURRENT_DATE)::DATE;

-- Create view for personal records leaderboard
CREATE OR REPLACE VIEW personal_records_leaderboard AS
SELECT 
    pr.exercise_name,
    pr.weight_pr,
    pr.reps_pr,
    pr.volume_pr,
    pr.pr_date,
    u.username,
    ROW_NUMBER() OVER (PARTITION BY pr.exercise_name ORDER BY pr.weight_pr DESC NULLS LAST) as weight_rank,
    ROW_NUMBER() OVER (PARTITION BY pr.exercise_name ORDER BY pr.reps_pr DESC NULLS LAST) as reps_rank,
    ROW_NUMBER() OVER (PARTITION BY pr.exercise_name ORDER BY pr.volume_pr DESC NULLS LAST) as volume_rank
FROM personal_records pr
JOIN users u ON pr.user_id = u.user_id
WHERE pr.weight_pr IS NOT NULL OR pr.reps_pr IS NOT NULL OR pr.volume_pr IS NOT NULL;

-- Table comments
COMMENT ON TABLE progress_streaks IS 'Tracks user activity streaks for gamification';
COMMENT ON TABLE personal_records IS 'Stores personal records for different exercises and metrics';
COMMENT ON TABLE daily_progress_summary IS 'Daily summary of workout and nutrition progress';
COMMENT ON TABLE weekly_macros_summary IS 'Weekly nutrition trends and compliance tracking';
COMMENT ON TABLE ai_insights IS 'AI-generated insights and recommendations';
COMMENT ON TABLE progress_milestones IS 'Tracks user achievements and milestones';
COMMENT ON VIEW progress_dashboard IS 'Comprehensive view for progress dashboard data';
COMMENT ON VIEW personal_records_leaderboard IS 'Leaderboard view for personal records';
