// Test the improved workout extraction system
// This simulates the conversation that was causing issues

const testConversation = {
  userMessage: "أريد خطة تدريبية 3 أيام لبناء العضلات",
  botReply: `بالطبع، سأقوم بإعداد خطة تدريبية مخصصة لك لمدة 3 أيام في الأسبوع، بناءً على بياناتك وهدفك بناء العضلات. سأقسم التدريب إلى ثلاثة أيام رئيسية، مع يوم استرخاء بينها لمنع الإصابات وتحسين الشفاء.

خطة التدريب للأسبوع:
#### يوم 1: الصدر وذراعين
**تمارين المقترحة:**
- Bench Press: 4 sets × 8-10 reps
- Push-Ups: 3 sets × 10-15 reps
- Incline Dumbbell Press: 3 sets × 8-10 reps
- Dumbbell Flyes: 3 sets × 10-12 reps
- Tricep Dips: 3 sets × 10-12 reps
- Tricep Pushdowns: 3 sets × 10-12 reps

#### يوم 2: الظهر والساقين
**تمارين المقترحة:**
- Deadlifts: 4 sets × 6-8 reps
- Bent Over Rows: 4 sets × 8-10 reps
- Seated Cable Rows: 3 sets × 10-12 reps
- Squats: 4 sets × 8-10 reps
- Lunges: 3 sets × 10 reps per leg
- Calf Raises: 3 sets × 15 reps

#### يوم 3: البطن والعضلات الثقيلة
**تمارين المقترحة:**
- Plank: 3 sets × 1 minute
- Russian Twists: 3 sets × 15 reps per side
- Bicycle Crunches: 3 sets × 15 reps per side
- Leg Raises: 3 sets × 10 reps
- Glute Bridges: 3 sets × 10 reps`
}

// Expected output after improvements:
const expectedOutput = [
  // Push Day exercises
  {
    workout_day_name: "Push Day",
    exercise_name: "Bench Press",
    required_sets: 4,
    required_reps: 9, // Average of 8-10
    required_weight: "",
    completed_sets: 0,
    completed_reps: 0,
    completed_weight: "",
    suggested_rest_time: 90,
    actual_rest_time: 0,
    perceived_effort: 5,
    form_quality: 3,
    notes: "",
    progression_type: "hypertrophy"
  },
  {
    workout_day_name: "Push Day",
    exercise_name: "Push-Ups",
    required_sets: 3,
    required_reps: 12, // Average of 10-15
    required_weight: "bodyweight",
    completed_sets: 0,
    completed_reps: 0,
    completed_weight: "",
    suggested_rest_time: 60,
    actual_rest_time: 0,
    perceived_effort: 5,
    form_quality: 3,
    notes: "",
    progression_type: "hypertrophy"
  },
  // ... more Push Day exercises
  
  // Pull Day exercises
  {
    workout_day_name: "Pull Day",
    exercise_name: "Deadlifts",
    required_sets: 4,
    required_reps: 7, // Average of 6-8
    required_weight: "",
    completed_sets: 0,
    completed_reps: 0,
    completed_weight: "",
    suggested_rest_time: 120,
    actual_rest_time: 0,
    perceived_effort: 5,
    form_quality: 3,
    notes: "",
    progression_type: "strength"
  },
  // ... more Pull Day exercises
  
  // Leg Day exercises
  {
    workout_day_name: "Leg Day",
    exercise_name: "Squats",
    required_sets: 4,
    required_reps: 9, // Average of 8-10
    required_weight: "",
    completed_sets: 0,
    completed_reps: 0,
    completed_weight: "",
    suggested_rest_time: 90,
    actual_rest_time: 0,
    perceived_effort: 5,
    form_quality: 3,
    notes: "",
    progression_type: "hypertrophy"
  },
  // ... more Leg Day exercises
  
  // Core Day exercises
  {
    workout_day_name: "Core Day",
    exercise_name: "Plank",
    required_sets: 3,
    required_reps: 1, // 1 minute = 1 rep for time-based
    required_weight: "bodyweight",
    completed_sets: 0,
    completed_reps: 0,
    completed_weight: "",
    suggested_rest_time: 60,
    actual_rest_time: 0,
    perceived_effort: 5,
    form_quality: 3,
    notes: "",
    progression_type: "endurance"
  }
  // ... more Core Day exercises
]

console.log("Test setup complete. The improved system should:")
console.log("1. Group exercises by workout type (Push/Pull/Leg/Core Day)")
console.log("2. Avoid duplicates by checking existing workouts")
console.log("3. Use standard exercise names")
console.log("4. Set completed_sets/completed_reps to 0 for plans")
console.log("5. Auto-detect progression_type based on rep ranges")
