// Debug script to check environment variables and system setup
// Run this to verify all required configurations are in place

console.log('🔍 Environment Variable Check\n');
console.log('=' .repeat(50));

// Check Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('📊 Supabase Configuration:');
console.log(`NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`);
console.log(`SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? '✅ Set' : '❌ Missing'}`);

// Check GLM API configuration
const glmApiKey = process.env.GLM_API_KEY;
const glmApiUrl = process.env.GLM_API_URL;

console.log('\n🤖 GLM API Configuration:');
console.log(`GLM_API_KEY: ${glmApiKey ? '✅ Set' : '❌ Missing'}`);
console.log(`GLM_API_URL: ${glmApiUrl || 'https://open.bigmodel.cn/api/paas/v4/chat/completions'} ✅`);

// Check Google Embeddings API
const googleApiKey = process.env.GOOG_API_KEY;

console.log('\n🔍 Google API Configuration:');
console.log(`GOOG_API_KEY: ${googleApiKey ? '✅ Set' : '❌ Missing'}`);

// Check Clerk configuration
const clerkSecretKey = process.env.CLERK_SECRET_KEY;
const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

console.log('\n👤 Clerk Configuration:');
console.log(`CLERK_SECRET_KEY: ${clerkSecretKey ? '✅ Set' : '❌ Missing'}`);
console.log(`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${clerkPublishableKey ? '✅ Set' : '❌ Missing'}`);

console.log('\n' + '=' .repeat(50));

// Test imports
console.log('🔍 Testing Module Imports...\n');

async function testImports() {
  try {
    console.log('1️⃣ Testing message analyzer...');
    const messageAnalyzer = await import('./standalone-message-analyzer');
    console.log('   ✅ standalone-message-analyzer imported successfully');

    console.log('2️⃣ Testing GLM classifier...');
    const glmClassifier = await import('./standalone-glm-classifier');
    console.log('   ✅ standalone-glm-classifier imported successfully');

    console.log('3️⃣ Testing workout analyzer...');
    const workoutAnalyzer = await import('./standalone-workout-analyzer');
    console.log('   ✅ standalone-workout-analyzer imported successfully');

    console.log('4️⃣ Testing nutrition analyzer...');
    const nutritionAnalyzer = await import('./standalone-nutrition-analyzer');
    console.log('   ✅ standalone-nutrition-analyzer imported successfully');

    console.log('5️⃣ Testing orchestrator...');
    const orchestrator = await import('./conversation-analyzer-orchestrator');
    console.log('   ✅ conversation-analyzer-orchestrator imported successfully');

    console.log('\n✅ All modules imported successfully!');
    return true;

  } catch (error) {
    console.error('❌ Import error:', error);
    return false;
  }
}

// Test database connection
async function testDatabaseConnection() {
  try {
    console.log('\n🔍 Testing Database Connection...');
    
    const { createClient } = await import('@supabase/supabase-js');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.log('   ❌ Missing Supabase configuration');
      return false;
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Test basic connection
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.log('   ❌ Database connection failed:', error.message);
      return false;
    }
    
    console.log('   ✅ Database connection successful');
    return true;

  } catch (error) {
    console.error('   ❌ Database test error:', error);
    return false;
  }
}

// Test GLM API connection
async function testGLMAPIConnection() {
  try {
    console.log('\n🔍 Testing GLM API Connection...');
    
    if (!glmApiKey) {
      console.log('   ❌ Missing GLM API key');
      return false;
    }

    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${glmApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'glm-4-flash',
        messages: [{ role: 'user', content: 'Hello' }],
        stream: false
      })
    });

    if (!response.ok) {
      console.log('   ❌ GLM API connection failed:', response.status, response.statusText);
      return false;
    }

    console.log('   ✅ GLM API connection successful');
    return true;

  } catch (error) {
    console.error('   ❌ GLM API test error:', error);
    return false;
  }
}

// Main test runner
async function runAllDiagnostics() {
  console.log('🚀 Running System Diagnostics...\n');
  
  const importsOk = await testImports();
  const dbOk = await testDatabaseConnection();
  const glmOk = await testGLMAPIConnection();
  
  console.log('\n' + '=' .repeat(50));
  console.log('📊 Diagnostic Summary:');
  console.log(`Module Imports: ${importsOk ? '✅' : '❌'}`);
  console.log(`Database Connection: ${dbOk ? '✅' : '❌'}`);
  console.log(`GLM API Connection: ${glmOk ? '✅' : '❌'}`);
  
  if (importsOk && dbOk && glmOk) {
    console.log('\n🎉 All systems ready! The analysis system should work correctly.');
  } else {
    console.log('\n⚠️ Some issues detected. Please check the failed components above.');
  }
}

// Export for individual testing
export {
  testImports,
  testDatabaseConnection,
  testGLMAPIConnection,
  runAllDiagnostics
};

// Run diagnostics if this file is executed directly
if (require.main === module) {
  runAllDiagnostics().catch(console.error);
}
