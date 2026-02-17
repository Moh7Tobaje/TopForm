// Test script for the standalone conversation analysis system
// Run this to verify the system is working correctly

import { analyzeLatestConversation } from './conversation-analyzer-orchestrator';

async function testAnalysisSystem() {
  console.log('🧪 Testing Conversation Analysis System...\n');
  
  // Test with a sample Clerk user ID (replace with real one for testing)
  const testClerkUserId = 'test_user_id';
  
  try {
    console.log('📊 Running analysis test...');
    const result = await analyzeLatestConversation(testClerkUserId);
    
    console.log('\n📋 Analysis Results:');
    console.log(`✅ Success: ${result.success}`);
    console.log(`🎯 Classification: ${result.classification}`);
    console.log(`📨 Messages Analyzed: ${result.messagesAnalyzed}`);
    console.log(`⏱️ Processing Time: ${result.processingTime}ms`);
    
    if (result.workoutChangesSaved) {
      console.log('💪 Workout changes saved to database');
    }
    
    if (result.nutritionChangesSaved) {
      console.log('🥗 Nutrition changes saved to database');
    }
    
    if (result.error) {
      console.log(`❌ Error: ${result.error}`);
    }
    
    if (result.userId) {
      console.log(`👤 User ID: ${result.userId}`);
    }
    
    console.log('\n✅ Test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Test individual components
async function testIndividualComponents() {
  console.log('\n🔧 Testing Individual Components...\n');
  
  try {
    // Test message analyzer
    console.log('1️⃣ Testing Message Analyzer...');
    const { getLastUserAndAssistantMessages } = await import('./standalone-message-analyzer');
    const messages = await getLastUserAndAssistantMessages('test_user_id');
    console.log(`   Messages found: User=${messages.userMessage ? 'Yes' : 'No'}, Assistant=${messages.assistantMessage ? 'Yes' : 'No'}`);
    
    // Test classifier
    console.log('2️⃣ Testing GLM Classifier...');
    const { classifyConversationContent } = await import('./standalone-glm-classifier');
    const classification = await classifyConversationContent(
      'I want to start working out and build muscle',
      'Great! Let me create a workout plan for you with exercises like squats and bench press'
    );
    console.log(`   Classification result: ${classification}`);
    
    // Test workout analyzer
    console.log('3️⃣ Testing Workout Analyzer...');
    const { analyzeAndSaveWorkoutChanges } = await import('./standalone-workout-analyzer');
    const workoutResult = await analyzeAndSaveWorkoutChanges(
      'Add deadlifts to my Monday workout',
      'I\'ll add deadlifts to your Monday routine: 3 sets of 5 reps at 100kg',
      'test_user_id'
    );
    console.log(`   Workout analysis result: ${workoutResult}`);
    
    // Test nutrition analyzer
    console.log('4️⃣ Testing Nutrition Analyzer...');
    const { analyzeAndSaveNutritionChanges } = await import('./standalone-nutrition-analyzer');
    const nutritionResult = await analyzeAndSaveNutritionChanges(
      'I ate chicken and rice for lunch',
      'That\'s about 400 calories with 35g protein and 45g carbs',
      'test_user_id'
    );
    console.log(`   Nutrition analysis result: ${nutritionResult}`);
    
    console.log('\n✅ Component tests completed!');
    
  } catch (error) {
    console.error('❌ Component test failed:', error);
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Analysis System Tests\n');
  console.log('=' .repeat(50));
  
  await testAnalysisSystem();
  await testIndividualComponents();
  
  console.log('\n' + '=' .repeat(50));
  console.log('🎉 All tests completed!');
}

// Export for individual testing
export {
  testAnalysisSystem,
  testIndividualComponents,
  runAllTests
};

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}
