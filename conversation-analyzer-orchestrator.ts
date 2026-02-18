// Main Orchestrator for Conversation Analysis System
// Coordinates all standalone components to analyze conversations and update tracking tables

import { 
  getLastUserAndAssistantMessages, 
  getRecentMessages, 
  formatMessagesForAnalysis 
} from './standalone-message-analyzer';

import { 
  classifyConversationContent, 
  classifyConversationFromMessages 
} from './standalone-glm-classifier';

import { 
  analyzeAndSaveWorkoutChanges, 
  analyzeWorkoutChangesFromMessages 
} from './standalone-workout-analyzer';


export interface AnalysisResult {
  success: boolean;
  classification: 'workout' | '0';
  workoutChangesSaved?: boolean;
  messagesAnalyzed: number;
  userId?: string;
  error?: string;
  processingTime: number;
}

/**
 * Main orchestrator function that analyzes the latest conversation
 * and routes to appropriate specialized analyzers
 * 
 * @param clerkUserId - The Clerk user ID to analyze conversations for
 * @returns Promise<AnalysisResult> - Detailed analysis results
 */
export async function analyzeLatestConversation(clerkUserId: string): Promise<AnalysisResult> {
  const startTime = Date.now();
  console.log(`🚀 Starting conversation analysis for user: ${clerkUserId}`);

  try {
    // Step 1: Fetch the last user and assistant messages
    const { userMessage, assistantMessage, userId } = await getLastUserAndAssistantMessages(clerkUserId);
    
    if (!userId) {
      return {
        success: false,
        classification: '0',
        messagesAnalyzed: 0,
        processingTime: Date.now() - startTime,
        error: 'User not found in database'
      };
    }

    if (!userMessage || !assistantMessage) {
      console.log('📭 Insufficient messages for analysis');
      return {
        success: true,
        classification: '0',
        messagesAnalyzed: userMessage ? 1 : 0,
        userId,
        processingTime: Date.now() - startTime
      };
    }

    console.log(`📨 Analyzing messages: User (${userMessage.content.length} chars), Assistant (${assistantMessage.content.length} chars)`);

    // Step 2: Classify the conversation content
    const classificationResult = await classifyConversationContent(
      userMessage.content,
      assistantMessage.content
    );
    const classification = ['workout', '0'].includes(classificationResult) 
      ? classificationResult as 'workout' | '0'
      : '0';

    console.log(`🎯 Classification result: ${classification}`);

    let workoutChangesSaved = false;

    // Step 3: Route to specialized analyzer based on classification
    if (classification === 'workout') {
      console.log('🏋️ Routing to workout analyzer...');
      workoutChangesSaved = await analyzeAndSaveWorkoutChanges(
        userMessage.content,
        assistantMessage.content,
        userId
      );
    } else {
      console.log('📭 Neutral content - no specialized analysis needed');
    }

    const processingTime = Date.now() - startTime;
    
    return {
      success: true,
      classification,
      workoutChangesSaved,
      messagesAnalyzed: 2,
      userId,
      processingTime
    };

  } catch (error) {
    console.error('❌ Error in analyzeLatestConversation:', error);
    return {
      success: false,
      classification: '0',
      messagesAnalyzed: 0,
      processingTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Analyze multiple recent messages for better context
 * 
 * @param clerkUserId - The Clerk user ID
 * @param messageLimit - Number of recent messages to analyze (default: 10)
 * @returns Promise<AnalysisResult> - Detailed analysis results
 */
export async function analyzeRecentConversationHistory(
  clerkUserId: string, 
  messageLimit: number = 10
): Promise<AnalysisResult> {
  const startTime = Date.now();
  console.log(`🚀 Starting recent conversation analysis for user: ${clerkUserId} (limit: ${messageLimit})`);

  try {
    // Step 1: Fetch recent messages
    const messages = await getRecentMessages(clerkUserId, messageLimit);
    
    if (!messages || messages.length === 0) {
      console.log('📭 No messages found for analysis');
      return {
        success: true,
        classification: '0',
        messagesAnalyzed: 0,
        processingTime: Date.now() - startTime
      };
    }

    console.log(`📨 Found ${messages.length} recent messages`);

    // Step 2: Classify the conversation
    const classificationResult = await classifyConversationFromMessages(messages);
    const classification = ['workout', '0'].includes(classificationResult) 
      ? classificationResult as 'workout' | '0'
      : '0';
    console.log(`🎯 Classification result: ${classification}`);

    // Get user ID from the first message
    const userId = messages[0]?.user_id;
    if (!userId) {
      return {
        success: false,
        classification: '0',
        messagesAnalyzed: messages.length,
        processingTime: Date.now() - startTime,
        error: 'User ID not found in messages'
      };
    }

    let workoutChangesSaved = false;

    // Step 3: Route to specialized analyzer
    if (classification === 'workout') {
      console.log('🏋️ Routing to workout analyzer with multiple messages...');
      workoutChangesSaved = await analyzeWorkoutChangesFromMessages(messages, userId);
    } else {
      console.log('📭 Neutral content - no specialized analysis needed');
    }

    const processingTime = Date.now() - startTime;
    
    return {
      success: true,
      classification,
      workoutChangesSaved,
      messagesAnalyzed: messages.length,
      userId,
      processingTime
    };

  } catch (error) {
    console.error('❌ Error in analyzeRecentConversationHistory:', error);
    return {
      success: false,
      classification: '0',
      messagesAnalyzed: 0,
      processingTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Quick analysis using only the last message (faster but less context)
 * 
 * @param clerkUserId - The Clerk user ID
 * @returns Promise<AnalysisResult> - Quick analysis results
 */
export async function quickAnalyzeLastMessage(clerkUserId: string): Promise<AnalysisResult> {
  const startTime = Date.now();
  console.log(`⚡ Starting quick analysis for user: ${clerkUserId}`);

  try {
    // Fetch only the last message
    const messages = await getRecentMessages(clerkUserId, 1);
    
    if (!messages || messages.length === 0) {
      return {
        success: true,
        classification: '0',
        messagesAnalyzed: 0,
        processingTime: Date.now() - startTime
      };
    }

    const lastMessage = messages[0];
    console.log(`⚡ Quick analyzing last message: ${lastMessage.role} (${lastMessage.content.length} chars)`);

    // Use keyword-based classification for speed
    const { quickKeywordClassification } = await import('./standalone-glm-classifier');
    const classificationResult = quickKeywordClassification(lastMessage.content);
    const classification = ['workout', '0'].includes(classificationResult) 
      ? classificationResult as 'workout' | '0'
      : '0';
    
    console.log(`⚡ Quick classification result: ${classification}`);

    const processingTime = Date.now() - startTime;
    
    return {
      success: true,
      classification,
      messagesAnalyzed: 1,
      userId: lastMessage.user_id,
      processingTime
    };

  } catch (error) {
    console.error('❌ Error in quickAnalyzeLastMessage:', error);
    return {
      success: false,
      classification: '0',
      messagesAnalyzed: 0,
      processingTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Batch analysis for multiple users
 * 
 * @param clerkUserIds - Array of Clerk user IDs to analyze
 * @returns Promise<AnalysisResult[]> - Results for each user
 */
export async function batchAnalyzeUsers(clerkUserIds: string[]): Promise<AnalysisResult[]> {
  console.log(`🔄 Starting batch analysis for ${clerkUserIds.length} users`);
  
  const results: AnalysisResult[] = [];
  
  for (const userId of clerkUserIds) {
    try {
      const result = await analyzeLatestConversation(userId);
      results.push(result);
      
      // Add small delay between users to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`❌ Error analyzing user ${userId}:`, error);
      results.push({
        success: false,
        classification: '0',
        messagesAnalyzed: 0,
        processingTime: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  console.log(`✅ Batch analysis completed. Success: ${results.filter(r => r.success).length}/${results.length}`);
  return results;
}

/**
 * Generate analysis report
 */
export function generateAnalysisReport(results: AnalysisResult[]): string {
  const total = results.length;
  const successful = results.filter(r => r.success).length;
  const workoutClassifications = results.filter(r => r.classification === 'workout').length;
  const neutralClassifications = results.filter(r => r.classification === '0').length;
  
  const avgProcessingTime = results.reduce((sum, r) => sum + r.processingTime, 0) / total;
  
  const report = `
📊 Conversation Analysis Report
================================
Total Users Analyzed: ${total}
Successful Analyses: ${successful} (${((successful/total)*100).toFixed(1)}%)

Classification Results:
- Workout: ${workoutClassifications} (${((workoutClassifications/total)*100).toFixed(1)}%)
- Neutral: ${neutralClassifications} (${((neutralClassifications/total)*100).toFixed(1)}%)

Performance:
- Average Processing Time: ${avgProcessingTime.toFixed(0)}ms
- Total Messages Analyzed: ${results.reduce((sum, r) => sum + r.messagesAnalyzed, 0)}

Changes Saved:
- Workout Changes: ${results.filter(r => r.workoutChangesSaved).length}
  `.trim();
  
  return report;
}

// Export all functions for external use
export {
  analyzeLatestConversation as main,
  analyzeRecentConversationHistory as detailed,
  quickAnalyzeLastMessage as quick,
  batchAnalyzeUsers as batch
};
