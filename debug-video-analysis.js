// Debug file to reproduce the exact client-side error
// This simulates the video analysis flow step by step

console.log('🔍 Debugging Video Analysis Flow');
console.log('=====================================');

// Test 1: Check if the API endpoint exists and works
async function testAPIEndpoint() {
  console.log('\n📋 Test 1: API Endpoint Check');
  
  try {
    // Test the API endpoint with a simple request
    const response = await fetch('/api/analyze-performance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ video_url: 'https://example.com/test.mp4' })
    });
    
    console.log('📊 Response Status:', response.status);
    console.log('📋 Response Headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('📄 Response Body:', responseText);
    
    if (response.ok) {
      try {
        const jsonResponse = JSON.parse(responseText);
        console.log('✅ Parsed JSON Response:', jsonResponse);
        return jsonResponse;
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError.message);
        return null;
      }
    } else {
      console.error('❌ API Error:', response.status, responseText);
      return null;
    }
  } catch (error) {
    console.error('❌ Network Error:', error.message);
    return null;
  }
}

// Test 2: Simulate the performance processor
function testPerformanceProcessor() {
  console.log('\n📋 Test 2: Performance Processor Simulation');
  
  // Simulate the raw analysis from Twelve Labs
  const mockRawAnalysis = `85%
Analysis Complete
The individual demonstrates a generally good squat form with some areas for improvement, particularly in knee tracking and back angle.`;
  
  console.log('📝 Mock Raw Analysis:', mockRawAnalysis);
  
  // Test the processAnalysisWithGLM function
  try {
    // This would normally call the GLM API
    console.log('🔄 Would call processAnalysisWithGLM with this data...');
    
    // Simulate a potential JSON parsing error
    const malformedJSON = '{ "heroScore": { "totalScore": 75, "level": "intermediate" '; // Missing closing brace
    try {
      JSON.parse(malformedJSON);
    } catch (jsonError) {
      console.error('❌ JSON Parsing Error (simulated):', jsonError.message);
      console.log('💡 This could cause the client-side exception!');
    }
    
    // Test with valid JSON
    const validJSON = {
      heroScore: {
        totalScore: 75,
        percentage: 75,
        level: "intermediate",
        summary: "Good form with areas for improvement",
        color: "yellow"
      },
      scoreBreakdown: {
        phases: [
          { phase: "Setup", score: 80, icon: "check", observations: ["Good setup"] },
          { phase: "Execution", score: 70, icon: "warning", observations: ["Some issues"] },
          { phase: "Completion", score: 75, icon: "check", observations: ["Good completion"] }
        ]
      },
      measurements: {
        measurements: [
          { name: "Depth", value: "below_parallel", status: "good" },
          { name: "Knee Tracking", value: "slight_valgus", status: "attention" }
        ]
      },
      issues: { issues: [] },
      positives: { positives: ["Good depth", "Steady movement"] },
      drills: { topFocus: "Improve knee tracking", drills: [] }
    };
    
    console.log('✅ Valid JSON structure works fine');
    return validJSON;
    
  } catch (error) {
    console.error('❌ Performance Processor Error:', error.message);
    return null;
  }
}

// Test 3: Component rendering simulation
function testComponentRendering() {
  console.log('\n📋 Test 3: Component Rendering Simulation');
  
  // Test cases that could cause client-side exceptions
  const testCases = [
    {
      name: 'Undefined analysisResult',
      data: null,
      expectedError: 'Cannot read properties of null'
    },
    {
      name: 'Missing heroScore',
      data: { scoreBreakdown: {}, measurements: {}, issues: {}, positives: {}, drills: {} },
      expectedError: 'Cannot read properties of undefined'
    },
    {
      name: 'Invalid data structure',
      data: { heroScore: 'invalid', scoreBreakdown: null },
      expectedError: 'Cannot read properties of null'
    },
    {
      name: 'Valid data structure',
      data: {
        heroScore: { totalScore: 75, percentage: 75, level: 'intermediate', summary: 'Good', color: 'yellow' },
        scoreBreakdown: { phases: [] },
        measurements: { measurements: [] },
        issues: { issues: [] },
        positives: { positives: [] },
        drills: { topFocus: 'test', drills: [] }
      },
      expectedError: null
    }
  ];
  
  testCases.forEach(testCase => {
    console.log(`\n🧪 Testing: ${testCase.name}`);
    
    try {
      // Simulate what PerformanceResultCards component does
      if (testCase.data) {
        const { heroScore, scoreBreakdown, measurements, issues, positives, drills } = testCase.data;
        
        // This is where the error would occur
        if (heroScore && heroScore.totalScore) {
          console.log(`✅ Hero Score: ${heroScore.totalScore}`);
        } else if (heroScore === undefined) {
          console.error('❌ Missing heroScore - this would cause client-side error!');
        }
        
        if (scoreBreakdown && scoreBreakdown.phases) {
          console.log(`✅ Score Breakdown: ${scoreBreakdown.phases.length} phases`);
        }
        
        if (measurements && measurements.measurements) {
          console.log(`✅ Measurements: ${measurements.measurements.length} items`);
        }
        
        if (issues && issues.issues) {
          console.log(`✅ Issues: ${issues.issues.length} items`);
        }
        
        if (positives && positives.positives) {
          console.log(`✅ Positives: ${positives.positives.length} items`);
        }
        
        if (drills && drills.topFocus) {
          console.log(`✅ Drills: ${drills.topFocus}`);
        }
      } else {
        console.error('❌ Null data - this would cause client-side error!');
      }
      
      if (testCase.expectedError) {
        console.log(`⚠️ Expected error: ${testCase.expectedError}`);
      } else {
        console.log('✅ No error expected');
      }
      
    } catch (error) {
      console.error(`❌ Caught Error: ${error.message}`);
      console.log(`🎯 This matches expected: ${testCase.expectedError}`);
    }
  });
}

// Test 4: Environment variables check
function testEnvironmentVariables() {
  console.log('\n📋 Test 4: Environment Variables Check');
  
  const requiredEnvVars = [
    'GLM_API_KEY',
    'TWELVE_LABS_API_KEY',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY'
  ];
  
  requiredEnvVars.forEach(envVar => {
    const value = process.env[envVar];
    if (value) {
      console.log(`✅ ${envVar}: Set (length: ${value.length})`);
    } else {
      console.log(`❌ ${envVar}: Missing - this could cause errors!`);
    }
  });
}

// Test 5: Network connectivity test
async function testNetworkConnectivity() {
  console.log('\n📋 Test 5: Network Connectivity');
  
  const urls = [
    'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    'https://api.twelvelabs.io/v1.3/indexes'
  ];
  
  for (const url of urls) {
    try {
      console.log(`🔍 Testing: ${url}`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Authorization': 'Bearer test-key',
          'x-api-key': 'test-key'
        }
      });
      
      clearTimeout(timeoutId);
      console.log(`📊 Response: ${response.status} ${response.statusText}`);
      
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log(`⏰ Timeout: ${url}`);
      } else {
        console.log(`❌ Error: ${error.message} - ${url}`);
      }
    }
  }
}

// Run all tests
async function runAllDebugTests() {
  console.log('🚀 Starting comprehensive debug analysis...\n');
  
  await testAPIEndpoint();
  testPerformanceProcessor();
  testComponentRendering();
  testEnvironmentVariables();
  await testNetworkConnectivity();
  
  console.log('\n🎯 Debug Analysis Complete');
  console.log('========================');
  console.log('💡 Most likely causes of client-side error:');
  console.log('1. Missing or undefined analysisResult prop');
  console.log('2. JSON parsing failure in performance processor');
  console.log('3. Network timeout during API calls');
  console.log('4. Missing environment variables');
  console.log('5. Component trying to access undefined properties');
  
  console.log('\n🔧 Recommended fixes:');
  console.log('1. Add null checks in PerformanceResultCards component');
  console.log('2. Add error boundaries around component rendering');
  console.log('3. Add timeout handling for API calls');
  console.log('4. Add fallback data when API fails');
  console.log('5. Ensure all environment variables are set');
}

// Execute the debug tests
runAllDebugTests().catch(console.error);
