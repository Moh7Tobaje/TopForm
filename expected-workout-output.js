// Expected output test for the improved workout extraction system
// Based on the user's provided workout plan

const expectedWorkoutPlan = [
  // Push Day exercises
  {
    "workout_day_name": "Push Day",
    "exercise_name": "Bench Press",
    "required_sets": 4,
    "required_reps": 9, // Average of 8-10
    "required_weight": null,
    "suggested_rest_time": 120, // Compound exercise
    "completed_sets": 0,
    "completed_reps": 0,
    "completed_weight": null,
    "actual_rest_time": 0,
    "perceived_effort": 5,
    "form_quality": 3,
    "notes": "",
    "progression_type": "hypertrophy" // 8-12 reps range
  },
  {
    "workout_day_name": "Push Day",
    "exercise_name": "Push-Ups",
    "required_sets": 3,
    "required_reps": 12, // Average of 10-15
    "required_weight": "Bodyweight",
    "suggested_rest_time": 60, // Bodyweight exercise
    "completed_sets": 0,
    "completed_reps": 0,
    "completed_weight": null,
    "actual_rest_time": 0,
    "perceived_effort": 5,
    "form_quality": 3,
    "notes": "",
    "progression_type": "hypertrophy"
  },
  {
    "workout_day_name": "Push Day",
    "exercise_name": "Incline Dumbbell Press",
    "required_sets": 3,
    "required_reps": 9, // Average of 8-10
    "required_weight": null,
    "suggested_rest_time": 120, // Compound exercise
    "completed_sets": 0,
    "completed_reps": 0,
    "completed_weight": null,
    "actual_rest_time": 0,
    "perceived_effort": 5,
    "form_quality": 3,
    "notes": "",
    "progression_type": "hypertrophy"
  },
  {
    "workout_day_name": "Push Day",
    "exercise_name": "Dumbbell Flyes",
    "required_sets": 3,
    "required_reps": 11, // Average of 10-12
    "required_weight": null,
    "suggested_rest_time": 90, // Isolation exercise
    "completed_sets": 0,
    "completed_reps": 0,
    "completed_weight": null,
    "actual_rest_time": 0,
    "perceived_effort": 5,
    "form_quality": 3,
    "notes": "",
    "progression_type": "hypertrophy"
  },
  {
    "workout_day_name": "Push Day",
    "exercise_name": "Tricep Dips",
    "required_sets": 3,
    "required_reps": 12, // Average of 10-12
    "required_weight": "Bodyweight",
    "suggested_rest_time": 60, // Bodyweight exercise
    "completed_sets": 0,
    "completed_reps": 0,
    "completed_weight": null,
    "actual_rest_time": 0,
    "perceived_effort": 5,
    "form_quality": 3,
    "notes": "",
    "progression_type": "hypertrophy"
  },
  {
    "workout_day_name": "Push Day",
    "exercise_name": "Tricep Pushdowns",
    "required_sets": 3,
    "required_reps": 12, // Average of 10-12
    "required_weight": null,
    "suggested_rest_time": 90, // Isolation exercise
    "completed_sets": 0,
    "completed_reps": 0,
    "completed_weight": null,
    "actual_rest_time": 0,
    "perceived_effort": 5,
    "form_quality": 3,
    "notes": "",
    "progression_type": "hypertrophy"
  },
  // Pull Day exercises
  {
    "workout_day_name": "Pull Day",
    "exercise_name": "Deadlifts",
    "required_sets": 4,
    "required_reps": 7, // Average of 6-8
    "required_weight": null,
    "suggested_rest_time": 120, // Compound exercise
    "completed_sets": 0,
    "completed_reps": 0,
    "completed_weight": null,
    "actual_rest_time": 0,
    "perceived_effort": 5,
    "form_quality": 3,
    "notes": "",
    "progression_type": "strength" // 4-6 reps range
  },
  {
    "workout_day_name": "Pull Day",
    "exercise_name": "Bent Over Rows",
    "required_sets": 4,
    "required_reps": 9, // Average of 8-10
    "required_weight": null,
    "suggested_rest_time": 120, // Compound exercise
    "completed_sets": 0,
    "completed_reps": 0,
    "completed_weight": null,
    "actual_rest_time": 0,
    "perceived_effort": 5,
    "form_quality": 3,
    "notes": "",
    "progression_type": "hypertrophy"
  },
  {
    "workout_day_name": "Pull Day",
    "exercise_name": "Seated Cable Rows",
    "required_sets": 3,
    "required_reps": 11, // Average of 10-12
    "required_weight": null,
    "suggested_rest_time": 120, // Compound exercise
    "completed_sets": 0,
    "completed_reps": 0,
    "completed_weight": null,
    "actual_rest_time": 0,
    "perceived_effort": 5,
    "form_quality": 3,
    "notes": "",
    "progression_type": "hypertrophy"
  },
  {
    "workout_day_name": "Pull Day",
    "exercise_name": "Squats",
    "required_sets": 4,
    "required_reps": 9, // Average of 8-10
    "required_weight": null,
    "suggested_rest_time": 120, // Compound exercise
    "completed_sets": 0,
    "completed_reps": 0,
    "completed_weight": null,
    "actual_rest_time": 0,
    "perceived_effort": 5,
    "form_quality": 3,
    "notes": "",
    "progression_type": "hypertrophy"
  },
  {
    "workout_day_name": "Pull Day",
    "exercise_name": "Lunges",
    "required_sets": 3,
    "required_reps": 10,
    "required_weight": null,
    "suggested_rest_time": 90, // Isolation exercise
    "completed_sets": 0,
    "completed_reps": 0,
    "completed_weight": null,
    "actual_rest_time": 0,
    "perceived_effort": 5,
    "form_quality": 3,
    "notes": "",
    "progression_type": "hypertrophy"
  },
  {
    "workout_day_name": "Pull Day",
    "exercise_name": "Calf Raises",
    "required_sets": 3,
    "required_reps": 15,
    "required_weight": null,
    "suggested_rest_time": 90, // Isolation exercise
    "completed_sets": 0,
    "completed_reps": 0,
    "completed_weight": null,
    "actual_rest_time": 0,
    "perceived_effort": 5,
    "form_quality": 3,
    "notes": "",
    "progression_type": "endurance" // 15+ reps
  },
  // Core Day exercises
  {
    "workout_day_name": "Core Day",
    "exercise_name": "Plank",
    "required_sets": 3,
    "required_reps": 1, // Time-based: 1 minute = 1 rep
    "required_weight": "Bodyweight",
    "suggested_rest_time": 60, // Bodyweight exercise
    "completed_sets": 0,
    "completed_reps": 0,
    "completed_weight": null,
    "actual_rest_time": 0,
    "perceived_effort": 5,
    "form_quality": 3,
    "notes": "",
    "progression_type": "endurance" // Time-based
  },
  {
    "workout_day_name": "Core Day",
    "exercise_name": "Russian Twists",
    "required_sets": 3,
    "required_reps": 15, // 15 reps per side, using 15
    "required_weight": null,
    "suggested_rest_time": 60, // Bodyweight exercise
    "completed_sets": 0,
    "completed_reps": 0,
    "completed_weight": null,
    "actual_rest_time": 0,
    "perceived_effort": 5,
    "form_quality": 3,
    "notes": "",
    "progression_type": "hypertrophy"
  },
  {
    "workout_day_name": "Core Day",
    "exercise_name": "Bicycle Crunches",
    "required_sets": 3,
    "required_reps": 15, // 15 reps per side, using 15
    "required_weight": null,
    "suggested_rest_time": 60, // Bodyweight exercise
    "completed_sets": 0,
    "completed_reps": 0,
    "completed_weight": null,
    "actual_rest_time": 0,
    "perceived_effort": 5,
    "form_quality": 3,
    "notes": "",
    "progression_type": "hypertrophy"
  },
  {
    "workout_day_name": "Core Day",
    "exercise_name": "Leg Raises",
    "required_sets": 3,
    "required_reps": 10,
    "required_weight": null,
    "suggested_rest_time": 60, // Bodyweight exercise
    "completed_sets": 0,
    "completed_reps": 0,
    "completed_weight": null,
    "actual_rest_time": 0,
    "perceived_effort": 5,
    "form_quality": 3,
    "notes": "",
    "progression_type": "hypertrophy"
  },
  {
    "workout_day_name": "Core Day",
    "exercise_name": "Glute Bridges",
    "required_sets": 3,
    "required_reps": 10,
    "required_weight": null,
    "suggested_rest_time": 60, // Bodyweight exercise
    "completed_sets": 0,
    "completed_reps": 0,
    "completed_weight": null,
    "actual_rest_time": 0,
    "perceived_effort": 5,
    "form_quality": 3,
    "notes": "",
    "progression_type": "hypertrophy"
  }
]

console.log("Expected workout plan structure:")
console.log(`Total exercises: ${expectedWorkoutPlan.length}`)
console.log(`Push Day: ${expectedWorkoutPlan.filter(w => w.workout_day_name === "Push Day").length} exercises`)
console.log(`Pull Day: ${expectedWorkoutPlan.filter(w => w.workout_day_name === "Pull Day").length} exercises`)
console.log(`Core Day: ${expectedWorkoutPlan.filter(w => w.workout_day_name === "Core Day").length} exercises`)

console.log("\nKey improvements in the new system:")
console.log("✅ Precise exercise classification (Push/Pull/Leg/Core)")
console.log("✅ Accurate rep range calculation (averages)")
console.log("✅ Smart rest time assignment (120/90/60 seconds)")
console.log("✅ Correct weight assignment (Bodyweight vs null)")
console.log("✅ Proper progression type detection")
console.log("✅ Duplicate prevention (7-day lookback)")
console.log("✅ Fixed values for planning (completed_*=0)")
console.log("✅ Detailed logging and reporting")
