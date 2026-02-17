-- Integration Views for Progress System
-- These views connect the new progress tables with existing workout and nutrition data

-- View to aggregate workout data for progress tracking
CREATE OR REPLACE VIEW workout_progress_integration AS
SELECT 
    u.user_id,
    wt.workout_date,
    COUNT(DISTINCT wt.exercise_name) as exercises_completed,
    SUM(wt.completed_sets) as total_sets_completed,
    SUM(wt.completed_reps) as total_reps_completed,
    -- Estimate calories burned (rough calculation: 8 calories per set)
    SUM(wt.completed_sets) * 8 as estimated_calories_burned,
    -- Check if workout was completed
    CASE 
        WHEN COUNT(DISTINCT wt.exercise_name) > 0 THEN true 
        ELSE false 
    END as workout_completed,
    -- Get workout session data
    ws.session_duration,
    ws.perceived_difficulty
FROM users u
LEFT JOIN workout_tracking wt ON u.user_id = wt.user_id
LEFT JOIN workout_sessions ws ON u.user_id = ws.user_id 
    AND wt.workout_date = ws.session_date
GROUP BY u.user_id, wt.workout_date, ws.session_duration, ws.perceived_difficulty;

-- View to aggregate nutrition data for progress tracking
CREATE OR REPLACE VIEW nutrition_progress_integration AS
SELECT 
    u.user_id,
    DATE(nt.timestamp) as nutrition_date,
    SUM(nt.calories_consumed) as daily_calories,
    SUM(nt.protein_consumed) as daily_protein,
    SUM(nt.carbs_consumed) as daily_carbs,
    SUM(nt.fat_consumed) as daily_fat,
    -- Check if nutrition was tracked
    CASE 
        WHEN COUNT(*) > 0 THEN true 
        ELSE false 
    END as nutrition_tracked,
    -- Calculate compliance with goals
    CASE 
        WHEN SUM(nt.calories_consumed) >= 0.9 * AVG(nt.calories_required) 
        AND SUM(nt.calories_consumed) <= 1.1 * AVG(nt.calories_required) 
        THEN true 
        ELSE false 
    END as calorie_goal_met,
    CASE 
        WHEN SUM(nt.protein_consumed) >= 0.9 * AVG(nt.protein_required) 
        THEN true 
        ELSE false 
    END as protein_goal_met
FROM users u
LEFT JOIN nutrition_tracking nt ON u.user_id = nt.user_id
GROUP BY u.user_id, DATE(nt.timestamp);

-- Enhanced progress dashboard that includes real workout and nutrition data
CREATE OR REPLACE VIEW enhanced_progress_dashboard AS
SELECT 
    u.user_id,
    u.username,
    
    -- Streak data
    COALESCE(ps.current_streak, 0) as current_streak,
    COALESCE(ps.longest_streak, 0) as longest_streak,
    ps.last_activity_date,
    
    -- Today's actual workout data
    COALESCE(wpi.exercises_completed, 0) as today_exercises,
    COALESCE(wpi.total_sets_completed, 0) as today_sets,
    COALESCE(wpi.total_reps_completed, 0) as today_reps,
    COALESCE(wpi.estimated_calories_burned, 0) as today_calories_burned,
    COALESCE(wpi.workout_completed, false) as today_workout_completed,
    
    -- Today's actual nutrition data
    COALESCE(npi.daily_calories, 0) as today_calories_consumed,
    COALESCE(npi.daily_protein, 0) as today_protein_consumed,
    COALESCE(npi.daily_carbs, 0) as today_carbs_consumed,
    COALESCE(npi.daily_fat, 0) as today_fat_consumed,
    COALESCE(npi.nutrition_tracked, false) as today_nutrition_tracked,
    
    -- Daily summary (fallback if no real data)
    COALESCE(dps.workouts_completed, 0) as workouts_completed,
    COALESCE(dps.day_score, 0) as day_score,
    
    -- Weekly averages from nutrition data
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
     WHERE pm.user_id = u.user_id AND pm.is_achieved = true) as achieved_milestones_count,

    -- Activity flags for today
    CASE 
        WHEN wpi.workout_completed OR npi.nutrition_tracked THEN true 
        ELSE false 
    END as active_today

FROM users u
LEFT JOIN progress_streaks ps ON u.user_id = ps.user_id
LEFT JOIN workout_progress_integration wpi ON u.user_id = wpi.user_id 
    AND wpi.workout_date = CURRENT_DATE
LEFT JOIN nutrition_progress_integration npi ON u.user_id = npi.user_id 
    AND npi.nutrition_date = CURRENT_DATE
LEFT JOIN daily_progress_summary dps ON u.user_id = dps.user_id 
    AND dps.summary_date = CURRENT_DATE
LEFT JOIN weekly_macros_summary wms ON u.user_id = wms.user_id 
    AND wms.week_start_date = date_trunc('week', CURRENT_DATE)::DATE;

-- Function to automatically update daily progress from real data
CREATE OR REPLACE FUNCTION sync_daily_progress()
RETURNS TRIGGER AS $$
BEGIN
    -- Update or insert daily progress summary based on actual workout and nutrition data
    INSERT INTO daily_progress_summary (
        user_id, 
        summary_date,
        workouts_completed,
        exercises_completed,
        total_sets_completed,
        total_reps_completed,
        estimated_calories_burned,
        total_calories_consumed,
        total_protein_consumed,
        total_carbs_consumed,
        total_fat_consumed,
        workout_goal_completed,
        nutrition_goal_completed,
        day_score
    )
    SELECT 
        NEW.user_id,
        CURRENT_DATE,
        CASE WHEN wpi.workout_completed THEN 1 ELSE 0 END,
        COALESCE(wpi.exercises_completed, 0),
        COALESCE(wpi.total_sets_completed, 0),
        COALESCE(wpi.total_reps_completed, 0),
        COALESCE(wpi.estimated_calories_burned, 0),
        COALESCE(npi.daily_calories, 0),
        COALESCE(npi.daily_protein, 0),
        COALESCE(npi.daily_carbs, 0),
        COALESCE(npi.daily_fat, 0),
        wpi.workout_completed,
        npi.calorie_goal_met AND npi.protein_goal_met,
        -- Calculate day score
        LEAST(100, 
            (CASE WHEN wpi.workout_completed THEN 40 ELSE 0 END) +
            (CASE WHEN npi.nutrition_tracked THEN 30 ELSE 0 END) +
            (CASE WHEN npi.calorie_goal_met THEN 15 ELSE 0 END) +
            (CASE WHEN npi.protein_goal_met THEN 15 ELSE 0 END)
        )
    FROM workout_progress_integration wpi
    FULL OUTER JOIN nutrition_progress_integration npi ON wpi.user_id = npi.user_id
        AND wpi.workout_date = npi.nutrition_date
    WHERE (wpi.user_id = NEW.user_id OR npi.user_id = NEW.user_id)
        AND (wpi.workout_date = CURRENT_DATE OR npi.nutrition_date = CURRENT_DATE)
    
    ON CONFLICT (user_id, summary_date) 
    DO UPDATE SET
        workouts_completed = EXCLUDED.workouts_completed,
        exercises_completed = EXCLUDED.exercises_completed,
        total_sets_completed = EXCLUDED.total_sets_completed,
        total_reps_completed = EXCLUDED.total_reps_completed,
        estimated_calories_burned = EXCLUDED.estimated_calories_burned,
        total_calories_consumed = EXCLUDED.total_calories_consumed,
        total_protein_consumed = EXCLUDED.total_protein_consumed,
        total_carbs_consumed = EXCLUDED.total_carbs_consumed,
        total_fat_consumed = EXCLUDED.total_fat_consumed,
        workout_goal_completed = EXCLUDED.workout_goal_completed,
        nutrition_goal_completed = EXCLUDED.nutrition_goal_completed,
        day_score = EXCLUDED.day_score,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically sync data when workout or nutrition data changes
CREATE TRIGGER sync_progress_on_workout_change
    AFTER INSERT OR UPDATE ON workout_tracking
    FOR EACH ROW EXECUTE FUNCTION sync_daily_progress();

CREATE TRIGGER sync_progress_on_nutrition_change
    AFTER INSERT OR UPDATE ON nutrition_tracking
    FOR EACH ROW EXECUTE FUNCTION sync_daily_progress();

-- Comments for documentation
COMMENT ON VIEW workout_progress_integration IS 'Aggregates workout data for progress tracking';
COMMENT ON VIEW nutrition_progress_integration IS 'Aggregates nutrition data for progress tracking';
COMMENT ON VIEW enhanced_progress_dashboard IS 'Complete progress dashboard with real data integration';
COMMENT ON FUNCTION sync_daily_progress IS 'Automatically syncs progress data when workout or nutrition data changes';
