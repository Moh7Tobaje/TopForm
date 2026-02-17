import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase configuration. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
}

// Create Supabase client with service role key for admin access
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface Message {
  id: number;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface LastMessages {
  userMessage: Message | null;
  assistantMessage: Message | null;
  userId: string | null;
}

/**
 * Fetch the last user and assistant messages for a specific user
 * @param clerkUserId - The Clerk user ID to fetch messages for
 * @returns Object containing last user and assistant messages
 */
export async function getLastUserAndAssistantMessages(clerkUserId: string): Promise<LastMessages> {
  try {
    console.log(`🔍 Fetching last messages for user: ${clerkUserId}`);

    // First get the internal user_id from clerk_user_id
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('user_id')
      .eq('clerk_user_id', clerkUserId)
      .single();

    if (userError || !userData) {
      console.error('❌ Error fetching user data:', userError);
      return { userMessage: null, assistantMessage: null, userId: null };
    }

    const internalUserId = userData.user_id;
    console.log(`✅ Found internal user_id: ${internalUserId}`);

    // Fetch the last 2 messages (user and assistant) for this user
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('user_id', internalUserId)
      .order('timestamp', { ascending: false })
      .limit(2);

    if (messagesError) {
      console.error('❌ Error fetching messages:', messagesError);
      return { userMessage: null, assistantMessage: null, userId: internalUserId };
    }

    if (!messages || messages.length === 0) {
      console.log('📭 No messages found for user');
      return { userMessage: null, assistantMessage: null, userId: internalUserId };
    }

    console.log(`📨 Found ${messages.length} messages`);

    // Separate user and assistant messages
    let userMessage: Message | null = null;
    let assistantMessage: Message | null = null;

    for (const message of messages) {
      if (message.role === 'user' && !userMessage) {
        userMessage = message;
      } else if (message.role === 'assistant' && !assistantMessage) {
        assistantMessage = message;
      }
    }

    console.log(`👤 User message: ${userMessage ? 'Found' : 'Not found'}`);
    console.log(`🤖 Assistant message: ${assistantMessage ? 'Found' : 'Not found'}`);

    return {
      userMessage,
      assistantMessage,
      userId: internalUserId
    };

  } catch (error) {
    console.error('❌ Unexpected error in getLastUserAndAssistantMessages:', error);
    return { userMessage: null, assistantMessage: null, userId: null };
  }
}

/**
 * Get all recent messages for analysis (last 10 messages)
 * @param clerkUserId - The Clerk user ID
 * @returns Array of recent messages
 */
export async function getRecentMessages(clerkUserId: string, limit: number = 10): Promise<Message[]> {
  try {
    console.log(`🔍 Fetching last ${limit} messages for user: ${clerkUserId}`);

    // Get internal user_id
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('user_id')
      .eq('clerk_user_id', clerkUserId)
      .single();

    if (userError || !userData) {
      console.error('❌ Error fetching user data:', userError);
      return [];
    }

    // Fetch recent messages
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('user_id', userData.user_id)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (messagesError) {
      console.error('❌ Error fetching messages:', messagesError);
      return [];
    }

    return messages || [];

  } catch (error) {
    console.error('❌ Unexpected error in getRecentMessages:', error);
    return [];
  }
}

/**
 * Format messages for GLM analysis
 * @param messages - Array of messages
 * @returns Formatted conversation string
 */
export function formatMessagesForAnalysis(messages: Message[]): string {
  if (!messages || messages.length === 0) {
    return '';
  }

  // Sort messages by timestamp (oldest first)
  const sortedMessages = [...messages].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const conversation = sortedMessages.map(msg => {
    const role = msg.role === 'user' ? 'User' : 'Assistant';
    const timestamp = new Date(msg.timestamp).toLocaleString();
    return `[${timestamp}] ${role}: ${msg.content}`;
  }).join('\n\n');

  return conversation;
}
