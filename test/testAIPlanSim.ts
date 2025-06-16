import { generateAdContent } from "../server/advancedAdOptimizer";

const test = async () => {
  const userId = "mock-user-id";
  
  console.log("🔬 AI Plan Tier Testing Simulation");
  console.log("===================================\n");
  
  for (const plan of ["free", "pro", "enterprise"]) {
    console.log(`\n🔬 Testing plan: ${plan.toUpperCase()}`);
    console.log("-".repeat(40));
    
    try {
      const result = await generateAdContent(userId, plan, "summer product launch");
      
      console.log(`Strategy: ${result.strategy}`);
      console.log(`Training Examples: ${result.trainingExamples || 0}`);
      console.log(`Content: ${result.text}`);
      
      if (result.error) {
        console.log(`⚠️  Error: ${result.error}`);
      }
      
    } catch (error) {
      console.log(`❌ Test failed for ${plan}: ${error}`);
    }
    
    console.log("\n" + "=".repeat(40));
  }
  
  console.log("\n✅ AI Plan Testing Complete");
};

// Simulate different user scenarios
const testUserScenarios = async () => {
  console.log("\n🎭 User Scenario Testing");
  console.log("========================\n");
  
  const scenarios = [
    {
      userId: "new-user-123",
      plan: "free",
      scenario: "New user with no historical data"
    },
    {
      userId: "pro-user-456", 
      plan: "pro",
      scenario: "Pro user with some engagement"
    },
    {
      userId: "enterprise-789",
      plan: "enterprise", 
      scenario: "Enterprise user with performance history"
    }
  ];
  
  for (const scenario of scenarios) {
    console.log(`\n👤 ${scenario.scenario}`);
    console.log(`Plan: ${scenario.plan} | User: ${scenario.userId}`);
    
    try {
      const result = await generateAdContent(scenario.userId, scenario.plan, "holiday special offer");
      console.log(`Generated: "${result.text.substring(0, 80)}..."`);
      console.log(`Strategy: ${result.strategy}`);
    } catch (error) {
      console.log(`❌ Scenario failed: ${error}`);
    }
  }
};

// Main execution
(async () => {
  console.log("🚀 Starting AI Plan Simulation Tests...\n");
  
  await test();
  await testUserScenarios();
  
  console.log("\n🎉 All tests completed!");
})();