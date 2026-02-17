# Streak System Implementation

## Overview
Implemented a comprehensive streak system that follows the exact principle requested:
- **Activity increases streak**: When user logs workout or nutrition on a new day
- **No activity resets streak**: When a day passes without any activity, streak resets to 0
- **Daily check at 11:59 PM**: System checks for inactivity and resets accordingly

## Core Principle
```
Day 1 (2/1): User logs workout → Streak = 1
Day 2 (2/2): User logs nutrition → Streak = 2  
Day 3 (2/3): No activity → Streak remains 2
Day 4 (2/4 at 11:59 PM): No activity all day → Streak resets to 0
```

## Implementation Details

### 1. Streak Manager API (`/api/progress/streak-manager`)
**Purpose**: Central streak calculation and management

**Actions**:
- `check_activity`: Checks daily activity and calculates correct streak
- `update_activity`: Updates streak when new activity is recorded
- `reset_streak`: Manually resets streak to 0

**Logic**:
- Checks if today has activity (workout OR nutrition)
- Checks yesterday's activity to determine if streak continues
- Resets streak if >1 day gap without activity
- Increments streak if consecutive days with activity

### 2. Enhanced Dashboard API Integration
**File**: `/api/progress/enhanced-dashboard/route.ts`

**Changes**:
- Calls streak manager API for accurate streak calculation
- Fallback to existing logic if streak manager fails
- Updated streak reset logic to check day gaps

### 3. Workout Tracking Integration
**File**: `/api/workout/tracking/route.ts`

**Changes**:
- Calls streak manager when workout is logged
- Updates activity type as 'workout'
- Ensures immediate streak updates

### 4. Nutrition Tracking Integration  
**File**: `/api/nutrition/log-meal/route.ts`

**Changes**:
- Calls streak manager when nutrition is logged
- Updates activity type as 'nutrition'
- Replaces old activity tracking system

### 5. Daily Streak Check API
**File**: `/api/progress/daily-streak-check/route.ts`

**Purpose**: Can be called by cron job for daily maintenance

**Features**:
- POST: Force check and reset streaks if needed
- GET: Get current streak status with detailed info
- Handles edge cases and date calculations

## Database Schema

### progress_streaks Table
```sql
CREATE TABLE progress_streaks (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(user_id),
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    workout_streak INTEGER DEFAULT 0,
    nutrition_streak INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);
```

## Key Features

### 1. Accurate Day Calculation
- Uses proper date arithmetic to calculate day differences
- Handles timezone considerations
- Checks activity within proper date ranges

### 2. Activity Types
- **Workout Activity**: Any exercise logged via workout tracking
- **Nutrition Activity**: Any meal logged via nutrition tracking
- **Combined Activity**: Either workout OR nutrition counts for streak

### 3. Streak Reset Logic
- Resets to 0 if >1 day gap without activity
- Preserves longest streak record
- Updates last activity date appropriately

### 4. Error Handling
- Graceful fallbacks if streak manager fails
- Database error handling
- Logging for debugging

## Usage Examples

### Check Current Streak
```javascript
const response = await fetch('/api/progress/daily-streak-check?detailed=true')
const { streakData } = await response.json()
console.log('Current streak:', streakData.currentStreak)
```

### Force Daily Check
```javascript
const response = await fetch('/api/progress/daily-streak-check', {
  method: 'POST',
  body: JSON.stringify({ forceCheck: true })
})
```

### Manual Activity Update
```javascript
const response = await fetch('/api/progress/streak-manager', {
  method: 'POST',
  body: JSON.stringify({
    action: 'update_activity',
    activityType: 'workout',
    activityData: { exercise_name: 'Bench Press' }
  })
})
```

## Edge Cases Handled

1. **Time Zone Issues**: Uses UTC date comparisons
2. **Multiple Activities**: Same day activities don't increment streak multiple times
3. **Database Errors**: Graceful fallbacks and error logging
4. **Missing Data**: Handles null/undefined streak data
5. **Date Gaps**: Properly calculates day differences

## Testing Scenarios

### Scenario 1: Normal Progression
- Day 1: Log workout → Streak = 1
- Day 2: Log nutrition → Streak = 2
- Day 3: Log workout → Streak = 3

### Scenario 2: Missed Day
- Day 1: Log workout → Streak = 1
- Day 2: No activity → Streak = 1
- Day 3: Check API → Streak = 0 (reset due to gap)

### Scenario 3: Same Day Multiple Activities
- Day 1: Log workout → Streak = 1
- Day 1: Log nutrition → Streak = 1 (no change)
- Day 2: Log workout → Streak = 2

## Integration Points

### Main Page Display
- Uses `useMainPageProgress` hook
- Displays current streak from enhanced dashboard API
- Real-time updates when activity is logged

### Progress Page
- Can call daily streak check API
- Shows detailed streak information
- Displays activity history

### Workout/Nutrition Pages
- Automatically update streak when data is saved
- Immediate feedback to user
- Consistent across all activity types

## Future Enhancements

1. **Cron Job Integration**: Automated daily checks at midnight
2. **Streak Rewards**: Achievement system for streak milestones
3. **Streak History**: Track streak patterns over time
4. **Notifications**: Reminders to maintain streak
5. **Streak Recovery**: Allow recovery of broken streaks

## Troubleshooting

### Common Issues
1. **Streak Not Updating**: Check if streak manager API is being called
2. **Incorrect Reset**: Verify date calculations and timezone handling
3. **Database Errors**: Check progress_streaks table exists and has data
4. **Permission Issues**: Verify RLS policies allow streak updates

### Debug Logging
- All APIs include console logging for debugging
- Check browser network tab for API calls
- Verify database queries are executing correctly

This implementation ensures the streak system works exactly as requested, with proper daily activity tracking and automatic resets when users miss days.
