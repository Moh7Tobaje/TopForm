// Test script to verify GLM integration
// This simulates the process that happens in the API route

const { processAnalysisWithGLM } = require('./lib/performance-processor');

// Sample analysis text that might come from Twelve Labs
const sampleAnalysis = `
The user performed a squat exercise with several form issues that need attention.

**Form Analysis:**
- Setup: The user started with feet slightly too narrow and bar position was high on the neck
- Execution: During the descent, the user's knees collapsed inward (valgus) and depth was only to parallel, not below parallel
- Completion: The ascent was rushed with poor hip drive and the bar path drifted forward

**Technical Issues:**
1. Knee valgus - moderate severity, increases risk of knee injury
2. Insufficient depth - limits muscle activation and mobility benefits
3. Bar path forward - puts unnecessary strain on lower back

**Positive Points:**
- Good tempo control throughout the movement
- Maintained neutral spine position
- Showed good effort and consistency between reps

**Safety Concerns:**
Risk of knee injury due to valgus collapse. Should reduce weight and focus on knee tracking.

**Recommendations:**
- Focus on pushing knees outward during squat
- Work on hip mobility to achieve deeper squat
- Practice with lighter weight to perfect form
- Use "track your toes" cue during movement
`;

async function testIntegration() {
  try {
    console.log('🧪 Testing GLM integration with sample analysis...');
    
    const result = await processAnalysisWithGLM(sampleAnalysis);
    
    console.log('✅ Integration test successful!');
    console.log('📊 Result structure:');
    
    // Log the structure to verify all cards are present
    console.log('- Hero Score:', result.heroScore ? '✅' : '❌');
    console.log('- Score Breakdown:', result.scoreBreakdown ? '✅' : '❌');
    console.log('- Measurements:', result.measurements ? '✅' : '❌');
    console.log('- Issues:', result.issues ? '✅' : '❌');
    console.log('- Positives:', result.positives ? '✅' : '❌');
    console.log('- Drills:', result.drills ? '✅' : '❌');
    console.log('- Safety Alert:', result.safetyAlert ? '✅' : '❌');
    
    // Log some sample data
    console.log('\n📈 Sample Data:');
    console.log('Total Score:', result.heroScore?.totalScore);
    console.log('Level:', result.heroScore?.level);
    console.log('Issues Count:', result.issues?.issues?.length);
    console.log('Positives Count:', result.positives?.positives?.length);
    
    return result;
    
  } catch (error) {
    console.error('❌ Integration test failed:', error);
    throw error;
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testIntegration()
    .then(() => console.log('\n🎉 Test completed successfully'))
    .catch(() => console.log('\n💥 Test failed'));
}

module.exports = { testIntegration };
