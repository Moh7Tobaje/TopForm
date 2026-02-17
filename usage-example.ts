// Usage Example for Standalone Conversation Analysis System
// This file demonstrates how to use the conversation analyzer

import { 
  analyzeLatestConversation,
  analyzeRecentConversationHistory,
  quickAnalyzeLastMessage,
  batchAnalyzeUsers,
  generateAnalysisReport
} from './conversation-analyzer-orchestrator';

/**
 * Example 1: Analyze the latest conversation for a single user
 */
async function example1() {
  console.log('=== Example 1: Analyze Latest Conversation ===');
  
  const clerkUserId = 'user_12345'; // Replace with actual Clerk user ID
  
  try {
    const result = await analyzeLatestConversation(clerkUserId);
    
    console.log('Analysis Result:');
    console.log(`Success: ${result.success}`);
    console.log(`Classification: ${result.classification}`);
    console.log(`Messages Analyzed: ${result.messagesAnalyzed}`);
    console.log(`Processing Time: ${result.processingTime}ms`);
    
    if (result.workoutChangesSaved) {
      console.log('✅ Workout changes saved to database');
    }
    
    if (result.nutritionChangesSaved) {
      console.log('✅ Nutrition changes saved to database');
    }
    
    if (result.error) {
      console.log(`Error: ${result.error}`);
    }
    
  } catch (error) {
    console.error('Example 1 failed:', error);
  }
}

/**
 * Example 2: Analyze recent conversation history with more context
 */
async function example2() {
  console.log('\n=== Example 2: Analyze Recent History ===');
  
  const clerkUserId = 'user_12345'; // Replace with actual Clerk user ID
  
  try {
    const result = await analyzeRecentConversationHistory(clerkUserId, 10);
    
    console.log('Detailed Analysis Result:');
    console.log(`Success: ${result.success}`);
    console.log(`Classification: ${result.classification}`);
    console.log(`Messages Analyzed: ${result.messagesAnalyzed}`);
    console.log(`Processing Time: ${result.processingTime}ms`);
    
  } catch (error) {
    console.error('Example 2 failed:', error);
  }
}

/**
 * Example 3: Quick analysis of just the last message
 */
async function example3() {
  console.log('\n=== Example 3: Quick Analysis ===');
  
  const clerkUserId = 'user_12345'; // Replace with actual Clerk user ID
  
  try {
    const result = await quickAnalyzeLastMessage(clerkUserId);
    
    console.log('Quick Analysis Result:');
    console.log(`Success: ${result.success}`);
    console.log(`Classification: ${result.classification}`);
    console.log(`Processing Time: ${result.processingTime}ms`);
    
  } catch (error) {
    console.error('Example 3 failed:', error);
  }
}

/**
 * Example 4: Batch analysis for multiple users
 */
async function example4() {
  console.log('\n=== Example 4: Batch Analysis ===');
  
  const clerkUserIds = ['user_12345', 'user_67890', 'user_11111']; // Replace with actual Clerk user IDs
  
  try {
    const results = await batchAnalyzeUsers(clerkUserIds);
    
    console.log('Batch Analysis Results:');
    results.forEach((result, index) => {
      console.log(`User ${index + 1}: ${result.success ? '✅' : '❌'} - ${result.classification}`);
    });
    
    // Generate a report
    const report = generateAnalysisReport(results);
    console.log('\n' + report);
    
  } catch (error) {
    console.error('Example 4 failed:', error);
  }
}

/**
 * Example 5: Integration with existing chat system
 * This shows how you might integrate the analyzer into your existing chat API
 */
async function example5() {
  console.log('\n=== Example 5: Integration Example ===');
  
  // This would typically be called after a chat message is processed
  async function onChatMessageProcessed(clerkUserId: string) {
    try {
      // Run analysis in the background (don't block the chat response)
      const analysisPromise = analyzeLatestConversation(clerkUserId);
      
      // Handle analysis asynchronously
      analysisPromise.then(result => {
        if (result.success && (result.workoutChangesSaved || result.nutritionChangesSaved)) {
          console.log(`🎯 Background analysis completed for user ${clerkUserId}`);
          console.log(`Changes saved: Workout=${result.workoutChangesSaved}, Nutrition=${result.nutritionChangesSaved}`);
        }
      }).catch(error => {
        console.error(`Background analysis failed for user ${clerkUserId}:`, error);
      });
      
      console.log('Chat response sent, analysis running in background...');
      
    } catch (error) {
      console.error('Integration example failed:', error);
    }
  }
  
  await onChatMessageProcessed('user_12345');
}

/**
 * Example 6: Scheduled analysis for all users
 * This shows how you might run periodic analysis
 */
async function example6() {
  console.log('\n=== Example 6: Scheduled Analysis ===');
  
  async function scheduledAnalysisForAllUsers() {
    try {
      // In a real implementation, you would fetch all active users from your database
      const allActiveUsers = ['user_12345', 'user_67890']; // This would come from your database
      
      console.log(`Starting scheduled analysis for ${allActiveUsers.length} users...`);
      
      const results = await batchAnalyzeUsers(allActiveUsers);
      
      const report = generateAnalysisReport(results);
      console.log('Scheduled Analysis Report:');
      console.log(report);
      
      // You could store this report or send notifications based on results
      
    } catch (error) {
      console.error('Scheduled analysis failed:', error);
    }
  }
  
  await scheduledAnalysisForAllUsers();
}

/**
 * Run all examples
 */
async function runAllExamples() {
  console.log('🚀 Running Conversation Analysis System Examples\n');
  
  await example1();
  await example2();
  await example3();
  await example4();
  await example5();
  await example6();
  
  console.log('\n✅ All examples completed!');
}

// Export examples for individual testing
export {
  example1,
  example2,
  example3,
  example4,
  example5,
  example6,
  runAllExamples
};

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples().catch(console.error);
}
