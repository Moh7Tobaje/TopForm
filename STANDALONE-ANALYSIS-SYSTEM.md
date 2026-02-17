# Standalone Conversation Analysis System

A comprehensive, standalone system for analyzing fitness and nutrition conversations and automatically updating tracking tables. This system is completely separate from the main TopCoach project and can be used independently.

## 🏗️ System Architecture

The system consists of 5 main components:

1. **Message Analyzer** (`standalone-message-analyzer.ts`) - Fetches messages from database
2. **GLM Classifier** (`standalone-glm-classifier.ts`) - Classifies conversations as workout/nutrition/neutral
3. **Workout Analyzer** (`standalone-workout-analyzer.ts`) - Extracts workout plan changes
4. **Nutrition Analyzer** (`standalone-nutrition-analyzer.ts`) - Extracts nutrition data
5. **Orchestrator** (`conversation-analyzer-orchestrator.ts`) - Coordinates all components

## 🚀 Features

- **Multi-language Support**: Handles both English and Arabic conversations
- **Intelligent Classification**: Uses GLM Flash AI to classify conversation content
- **Structured Data Extraction**: Automatically extracts workout and nutrition data
- **Database Integration**: Saves extracted data to appropriate tracking tables
- **Batch Processing**: Can analyze multiple users simultaneously
- **Flexible Analysis Modes**: Quick, standard, and detailed analysis options
- **Error Handling**: Robust error handling with detailed logging

## 📋 Requirements

### Environment Variables
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# GLM API Configuration
GLM_API_KEY=your_glm_api_key
GLM_API_URL=https://open.bigmodel.cn/api/paas/v4/chat/completions
```

### Database Tables
The system requires these existing tables:
- `users` (with clerk_user_id mapping)
- `messages` (chat history)
- `workout_tracking` (for workout data)
- `nutrition_tracking` (for nutrition data)

## 🔧 Installation & Setup

1. **Install Dependencies**
```bash
npm install @supabase/supabase-js
```

2. **Configure Environment**
```bash
# Copy your existing .env.local variables or create new ones
cp .env.local .env.local.standalone
```

3. **Verify Database Schema**
Ensure your database has the required tables with the correct structure. See `database-schema.sql` and `workout-database-schema.sql`.

## 📖 Usage Examples

### Basic Usage
```typescript
import { analyzeLatestConversation } from './conversation-analyzer-orchestrator';

// Analyze the latest conversation for a user
const result = await analyzeLatestConversation('user_clerk_id');
console.log(`Classification: ${result.classification}`);
```

### Advanced Usage
```typescript
import { 
  analyzeRecentConversationHistory,
  batchAnalyzeUsers,
  generateAnalysisReport 
} from './conversation-analyzer-orchestrator';

// Analyze recent conversation history
const detailedResult = await analyzeRecentConversationHistory('user_clerk_id', 10);

// Batch analyze multiple users
const results = await batchAnalyzeUsers(['user1', 'user2', 'user3']);

// Generate analysis report
const report = generateAnalysisReport(results);
console.log(report);
```

## 🎯 Analysis Modes

### 1. Standard Analysis (`analyzeLatestConversation`)
- Fetches the last user and assistant messages
- Uses GLM Flash for accurate classification
- Routes to specialized analyzers
- **Processing Time**: ~2-3 seconds

### 2. Detailed Analysis (`analyzeRecentConversationHistory`)
- Analyzes up to 10 recent messages for better context
- More accurate for complex conversations
- **Processing Time**: ~3-5 seconds

### 3. Quick Analysis (`quickAnalyzeLastMessage`)
- Uses keyword-based classification
- Fastest option for real-time processing
- **Processing Time**: ~500ms

## 🏋️ Workout Analysis

The workout analyzer extracts:
- **Workout Day Names**: Monday, Upper Body, Leg Day, etc.
- **Exercise Names**: Squats, Bench Press, Deadlifts, etc.
- **Training Parameters**: Sets, reps, weight, rest time
- **Special Instructions**: Form cues, modifications

### Example Input
```
User: I want to add deadlifts to my Monday workout, 3 sets of 5 reps at 100kg
Assistant: Great choice! Deadlifts are excellent for building overall strength...
```

### Example Output
```json
[
  {
    "workout_day_name": "Monday",
    "exercise_name": "Deadlifts",
    "required_sets": 3,
    "required_reps": 5,
    "required_weight": "100kg",
    "suggested_rest_time": 180
  }
]
```

## 🥗 Nutrition Analysis

The nutrition analyzer extracts:
- **Calorie Data**: Consumed and required calories
- **Macronutrients**: Protein, carbohydrates, fat
- **Goals**: Target values for each macro
- **Food Items**: Specific foods and their nutritional values

### Example Input
```
User: I ate 2 chicken breasts and rice for lunch, about 600 calories total
Assistant: That's a great post-workout meal with approximately 62g protein...
```

### Example Output
```json
{
  "calories_consumed": 600,
  "protein_consumed": 62,
  "carbs_consumed": 90,
  "fat_consumed": 7
}
```

## 🌍 Language Support

The system supports both English and Arabic:

### English Keywords
- Workout: "workout", "exercise", "training", "gym", "fitness"
- Nutrition: "food", "eat", "calories", "protein", "carbs", "fat"

### Arabic Keywords
- Workout: "تمرين", "تدريب", "رياضة", "صالة", "عضلات"
- Nutrition: "طعام", "أكل", "سعرات", "بروتين", "كربوهيدرات", "دهون"

## 📊 Database Integration

### Workout Tracking Table
```sql
CREATE TABLE workout_tracking (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(user_id),
    workout_day_name VARCHAR(100) NOT NULL,
    exercise_name VARCHAR(100) NOT NULL,
    required_sets INTEGER DEFAULT 0,
    required_reps INTEGER DEFAULT 0,
    required_weight VARCHAR(20),
    suggested_rest_time INTEGER DEFAULT 0,
    workout_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Nutrition Tracking Table
```sql
CREATE TABLE nutrition_tracking (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(user_id),
    calories_consumed DECIMAL(10,2) DEFAULT 0,
    calories_required DECIMAL(10,2) DEFAULT 0,
    protein_consumed DECIMAL(10,2) DEFAULT 0,
    protein_required DECIMAL(10,2) DEFAULT 0,
    carbs_consumed DECIMAL(10,2) DEFAULT 0,
    carbs_required DECIMAL(10,2) DEFAULT 0,
    fat_consumed DECIMAL(10,2) DEFAULT 0,
    fat_required DECIMAL(10,2) DEFAULT 0,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔍 Error Handling

The system includes comprehensive error handling:

- **API Errors**: Graceful handling of GLM API failures
- **Database Errors**: Robust database connection and query handling
- **Validation**: Input validation and sanitization
- **Fallbacks**: Keyword-based classification as fallback
- **Logging**: Detailed logging for debugging and monitoring

## 📈 Performance

### Processing Times
- Quick Analysis: ~500ms
- Standard Analysis: ~2-3 seconds
- Detailed Analysis: ~3-5 seconds
- Batch Processing: ~100ms per user

### Optimization Tips
- Use quick analysis for real-time processing
- Cache user data to reduce database queries
- Implement rate limiting for GLM API calls
- Use batch processing for multiple users

## 🛠️ Integration Examples

### Chat Integration
```typescript
// In your chat API route
async function handleChatMessage(req, res) {
  // Process chat message...
  
  // Run analysis in background
  analyzeLatestConversation(clerkUserId)
    .then(result => {
      console.log('Analysis completed:', result.classification);
    })
    .catch(console.error);
  
  // Return chat response immediately
  res.json({ response: chatResponse });
}
```

### Scheduled Analysis
```typescript
// Run daily analysis for all users
setInterval(async () => {
  const allUsers = await getAllActiveUsers();
  const results = await batchAnalyzeUsers(allUsers);
  
  // Generate and store report
  const report = generateAnalysisReport(results);
  await storeDailyReport(report);
}, 24 * 60 * 60 * 1000); // Every 24 hours
```

## 🧪 Testing

Run the usage examples to test the system:

```bash
# Run all examples
npx ts-node usage-example.ts

# Test specific components
npx ts-node -e "
import { analyzeLatestConversation } from './conversation-analyzer-orchestrator';
analyzeLatestConversation('test_user_id').then(console.log);
"
```

## 📝 Monitoring

The system provides detailed logging:
- 🚀 Analysis start/completion
- 📨 Message fetching
- 🎯 Classification results
- 🏋️ Workout analysis
- 🥗 Nutrition analysis
- 💾 Database operations
- ❌ Error details

## 🔒 Security

- Uses service role key for database access
- Validates all input data
- Sanitizes database queries
- Handles sensitive data appropriately
- No user data exposure in logs

## 🚀 Future Enhancements

- Real-time WebSocket integration
- Advanced nutrition calculations
- Exercise performance tracking
- Progress visualization
- Mobile app integration
- Multi-language expansion

## 📞 Support

For issues or questions:
1. Check the logs for detailed error information
2. Verify environment variables are set correctly
3. Ensure database schema matches requirements
4. Test with the provided examples

---

**Note**: This system is designed to be completely standalone and does not modify any existing TopCoach project files. It can be used independently or integrated into existing workflows.
