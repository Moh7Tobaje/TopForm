-- Sample data insertion for testing
-- This will create some test data to verify the progress system works

-- Insert sample workout tracking data
INSERT INTO workout_tracking (
  user_id, 
  workout_date, 
  workout_day_name, 
  exercise_name, 
  completed_sets, 
  completed_reps, 
  completed_weight, 
  perceived_effort,
  notes
) VALUES 
  (1, CURRENT_DATE, 'Monday', 'Bench Press', 4, 10, '80kg', 7, 'Felt strong today'),
  (1, CURRENT_DATE, 'Monday', 'Squats', 4, 12, '100kg', 8, 'Good depth'),
  (1, CURRENT_DATE - INTERVAL '1 day', 'Sunday', 'Deadlifts', 3, 8, '120kg', 9, 'PR attempt'),
  (1, CURRENT_DATE - INTERVAL '2 days', 'Saturday', 'Pull-ups', 3, 15, 'bodyweight', 6, 'Good form'),
  (1, CURRENT_DATE - INTERVAL '3 days', 'Friday', 'Shoulder Press', 3, 8, '50kg', 7, 'Steady progress');

-- Insert sample nutrition tracking data
INSERT INTO nutrition_tracking (
  user_id,
  calories_consumed,
  protein_consumed,
  carbs_consumed,
  fat_consumed,
  calories_required,
  protein_required,
  carbs_required,
  fat_required,
  timestamp
) VALUES 
  (1, 2200, 180, 250, 70, 2000, 150, 250, 65, CURRENT_TIMESTAMP),
  (1, 2000, 160, 200, 65, 2000, 150, 250, 65, CURRENT_TIMESTAMP - INTERVAL '1 day'),
  (1, 2400, 200, 300, 80, 2000, 150, 250, 65, CURRENT_TIMESTAMP - INTERVAL '2 days'),
  (1, 1800, 140, 180, 60, 2000, 150, 250, 65, CURRENT_TIMESTAMP - INTERVAL '3 days');

-- Insert sample personal records
INSERT INTO personal_records (
  user_id,
  exercise_name,
  pr_type,
  pr_value,
  pr_date,
  details
) VALUES 
  (1, 'Bench Press', 'weight', 85, CURRENT_DATE, 'New 1RM achieved'),
  (1, 'Squats', 'weight', 105, CURRENT_DATE - INTERVAL '1 day', 'Personal best'),
  (1, 'Pull-ups', 'reps', 20, CURRENT_DATE - INTERVAL '2 days', 'Max reps without rest'),
  (1, 'Deadlifts', 'weight', 125, CURRENT_DATE - INTERVAL '3 days', 'Form improvement');

-- Insert sample AI insights
INSERT INTO ai_insights (
  user_id,
  insight_type,
  category,
  title,
  message,
  actionable_advice,
  priority_level,
  relevance_score,
  is_read,
  is_bookmarked,
  generated_at,
  based_on_data
) VALUES 
  (1, 'achievement', 'workout', 'New Personal Record!', 'You set a new PR on Bench Press today!', 'Keep pushing your limits gradually and safely.', 4, 0.9, false, false, CURRENT_TIMESTAMP, 'workout_tracking'),
  (1, 'recommendation', 'nutrition', 'Protein Intake Good', 'Your protein consumption has been consistent this week.', 'Maintain this level for optimal muscle recovery.', 3, 0.8, false, false, CURRENT_TIMESTAMP - INTERVAL '1 hour', 'nutrition_tracking'),
  (1, 'motivation', 'consistency', 'Weekly Streak!', 'You have worked out 4 times this week!', 'Great consistency! Keep up the momentum.', 5, 0.95, false, true, CURRENT_TIMESTAMP - INTERVAL '2 hours', 'workout_tracking');

-- Update user streak (if progress_streaks table exists)
INSERT INTO progress_streaks (user_id, current_streak, longest_streak, last_activity_date)
VALUES (1, 4, 7, CURRENT_DATE)
ON CONFLICT (user_id) DO UPDATE SET
  current_streak = 4,
  longest_streak = GREATEST(progress_streaks.longest_streak, 7),
  last_activity_date = CURRENT_DATE;
