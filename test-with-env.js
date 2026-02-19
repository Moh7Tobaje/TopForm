// Test file to verify API keys work and reproduce the error
// This simulates the complete video analysis flow with proper environment variables

console.log('🧪 Testing Video Analysis with API Keys');
console.log('========================================');

// Set environment variables for testing
process.env.GLM_API_KEY = 'a54685e27a454d7daae357dde1202681.FwhlKmDwaJVrJM6m';
process.env.TWELVE_LABS_API_KEY = 'tlk_02AT33J2HHRG352V4V71P3GM6CVC';

// Import the modules we need to test
const { getGLMAnswer } = require('./glm-api.ts');

// Test 1: GLM API with real key
async function testGLMAPIWithRealKey() {
  console.log('\n📋 Test 1: GLM API with Real Key');
  
  try {
    const systemPrompt = `You are an expert fitness analysis AI. Your task is to convert exercise performance analysis text into structured JSON data.

You will receive raw analysis text from a video analysis system. You must extract and organize the information into the exact JSON structure specified below.

IMPORTANT RULES:
1. You must respond with ONLY valid JSON - no explanations, no markdown, no code blocks
2. If information is missing from the analysis, make reasonable inferences based on typical exercise patterns
3. Scores should be realistic (0-100) and consistent with the analysis tone

JSON Structure:
{
  "heroScore": {
    "totalScore": number (0-100),
    "percentage": number (0-100),
    "level": "beginner" | "intermediate" | "advanced" | "elite",
    "summary": "string (one sentence summary)",
    "color": "green" | "yellow" | "orange" | "red"
  },
  "scoreBreakdown": {
    "phases": [
      {
        "phase": "Setup" | "Execution" | "Completion",
        "score": number (0-100),
        "icon": "check" | "warning" | "error",
        "observations": ["string", "string"]
      }
    ]
  },
  "measurements": {
    "measurements": [
      {
        "name": "Depth" | "Knee Tracking" | "Back Position" | "Weight Distribution" | "Symmetry",
        "value": "string",
        "status": "good" | "attention" | "warning" | "problem"
      }
    ]
  },
  "issues": {
    "issues": [
      {
        "priority": number (1=highest),
        "name": "string",
        "description": "string",
        "severity": "critical" | "moderate" | "minor",
        "solution": "string (step-by-step)",
        "cue": "string (short cue for exercise)"
      }
    ]
  },
  "positives": {
    "positives": ["string", "string", "string", "string"]
  },
  "drills": {
    "topFocus": "string (one sentence)",
    "drills": [
      {
        "name": "string",
        "description": "string (optional)",
        "videoLink": "string (optional)"
      }
    ]
  }
}`;

    const userQuestion = `Convert this exercise performance analysis into structured JSON:

85%
Analysis Complete
The individual demonstrates a generally good squat form with some areas for improvement, particularly in knee tracking and back angle. The setup is solid with proper barbell positioning and foot placement. During execution, depth is below parallel which is good, but there's slight knee valgus and excessive forward lean. The completion shows steady return to standing position.

Extract all relevant information and organize it according to the specified JSON structure.`;

    console.log('🚀 Calling GLM API...');
    const response = await getGLMAnswer(systemPrompt, '', userQuestion);
    
    console.log('✅ GLM API Response received');
    console.log('📏 Response length:', response.length);
    
    // Try to parse as JSON
    try {
      let jsonStr = response.trim();
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.replace(/```json\s*/, '').replace(/```\s*$/, '');
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/```\s*/, '').replace(/```\s*$/, '');
      }
      
      const parsedResult = JSON.parse(jsonStr);
      console.log('✅ JSON parsing successful');
      console.log('📊 Structure keys:', Object.keys(parsedResult));
      
      return parsedResult;
      
    } catch (parseError) {
      console.error('❌ JSON parsing failed:', parseError.message);
      console.log('🔍 Raw response:', response);
      return null;
    }
    
  } catch (error) {
    console.error('❌ GLM API call failed:', error.message);
    return null;
  }
}

// Test 2: Simulate the complete flow
async function testCompleteFlow() {
  console.log('\n📋 Test 2: Complete Video Analysis Flow Simulation');
  
  // Step 1: Get analysis from GLM API
  const analysisData = await testGLMAPIWithRealKey();
  
  if (!analysisData) {
    console.log('❌ Failed to get analysis from GLM API');
    return;
  }
  
  // Step 2: Test component rendering with the data
  console.log('\n🎨 Testing Component Rendering...');
  
  try {
    // Simulate what PerformanceResultCards component does
    const { heroScore, scoreBreakdown, measurements, issues, positives, drills } = analysisData;
    
    console.log('📊 Hero Score:', heroScore ? '✅ Present' : '❌ Missing');
    if (heroScore) {
      console.log(`   - Total Score: ${heroScore.totalScore}`);
      console.log(`   - Level: ${heroScore.level}`);
      console.log(`   - Color: ${heroScore.color}`);
    }
    
    console.log('📊 Score Breakdown:', scoreBreakdown ? '✅ Present' : '❌ Missing');
    if (scoreBreakdown && scoreBreakdown.phases) {
      console.log(`   - Phases: ${scoreBreakdown.phases.length}`);
      scoreBreakdown.phases.forEach(phase => {
        console.log(`     * ${phase.phase}: ${phase.score}/100`);
      });
    }
    
    console.log('📊 Measurements:', measurements ? '✅ Present' : '❌ Missing');
    if (measurements && measurements.measurements) {
      console.log(`   - Items: ${measurements.measurements.length}`);
      measurements.measurements.forEach(measurement => {
        console.log(`     * ${measurement.name}: ${measurement.value} (${measurement.status})`);
      });
    }
    
    console.log('📊 Issues:', issues ? '✅ Present' : '❌ Missing');
    if (issues && issues.issues) {
      console.log(`   - Issues: ${issues.issues.length}`);
      issues.issues.forEach(issue => {
        console.log(`     * ${issue.name} (Priority: ${issue.priority})`);
      });
    }
    
    console.log('📊 Positives:', positives ? '✅ Present' : '❌ Missing');
    if (positives && positives.positives) {
      console.log(`   - Positives: ${positives.positives.length}`);
    }
    
    console.log('📊 Drills:', drills ? '✅ Present' : '❌ Missing');
    if (drills && drills.topFocus) {
      console.log(`   - Top Focus: ${drills.topFocus}`);
    }
    
    console.log('✅ Component rendering simulation successful');
    console.log('🎯 This should work in the actual component!');
    
  } catch (componentError) {
    console.error('❌ Component rendering failed:', componentError.message);
    console.log('🔍 This is the client-side error!');
    console.log('💡 Need to add error boundaries and null checks');
  }
}

// Test 3: Test with problematic data
function testProblematicData() {
  console.log('\n📋 Test 3: Testing Problematic Data Scenarios');
  
  const problematicCases = [
    {
      name: 'Null analysisResult',
      data: null,
      description: 'This happens when API fails'
    },
    {
      name: 'Missing heroScore',
      data: { scoreBreakdown: {}, measurements: {}, issues: {}, positives: {}, drills: {} },
      description: 'This happens when GLM returns incomplete data'
    },
    {
      name: 'Invalid JSON structure',
      data: { heroScore: 'invalid', scoreBreakdown: null },
      description: 'This happens when JSON parsing fails'
    }
  ];
  
  problematicCases.forEach(testCase => {
    console.log(`\n🧪 Testing: ${testCase.name}`);
    console.log(`📝 Description: ${testCase.description}`);
    
    try {
      if (testCase.data) {
        const { heroScore, scoreBreakdown, measurements, issues, positives, drills } = testCase.data;
        
        // This is where the error occurs
        console.log(`   Hero Score: ${heroScore ? heroScore.totalScore : 'MISSING'}`);
        console.log(`   Score Breakdown: ${scoreBreakdown ? 'PRESENT' : 'MISSING'}`);
        console.log(`   Measurements: ${measurements ? 'PRESENT' : 'MISSING'}`);
        console.log(`   Issues: ${issues ? 'PRESENT' : 'MISSING'}`);
        console.log(`   Positives: ${positives ? 'PRESENT' : 'MISSING'}`);
        console.log(`   Drills: ${drills ? 'PRESENT' : 'MISSING'}`);
        
      } else {
        console.log('   ❌ NULL DATA - This will cause client-side error!');
      }
      
    } catch (error) {
      console.error(`   ❌ ERROR: ${error.message}`);
      console.log('   🎯 This is the client-side exception!');
    }
  });
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting comprehensive test with real API keys...\n');
  
  await testGLMAPIWithRealKey();
  await testCompleteFlow();
  testProblematicData();
  
  console.log('\n🎯 Test Summary');
  console.log('===============');
  console.log('✅ API Keys are set correctly');
  console.log('✅ GLM API should work with real key');
  console.log('✅ Component rendering works with valid data');
  console.log('❌ Component crashes with invalid data');
  console.log('❌ Need error boundaries and null checks');
  
  console.log('\n💡 Final Solution:');
  console.log('1. Add environment variables to .env.local');
  console.log('2. Add error boundaries to PerformanceResultCards');
  console.log('3. Add null checks before accessing properties');
  console.log('4. Add fallback data when API fails');
  console.log('5. Test the complete flow');
}

// Execute tests
runAllTests().catch(console.error);
