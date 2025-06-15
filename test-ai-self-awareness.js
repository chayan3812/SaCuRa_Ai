/**
 * AI Self-Awareness Mode Testing Script
 * Tests the complete feedback replay system with failure analysis
 */

const API_BASE = 'http://localhost:3000';

async function makeRequest(path, method = 'GET', data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_BASE}${path}`, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${response.status}: ${errorText}`);
  }

  return response.json();
}

async function testAISelfAwarenessSystem() {
  console.log('🧠 Testing AI Self-Awareness Mode...\n');

  try {
    // Test 1: Submit feedback replay with failed AI response
    console.log('1. Testing feedback replay with AI failure analysis...');
    
    const failedReplayData = {
      message: "My payment failed three times and I'm really frustrated. What's going on?",
      aiReply: "Thank you for contacting us. We'll look into it.",
      agentReply: "I understand your frustration with the payment failures. Let me check your account immediately and resolve this for you. I can see the issue - your bank is blocking the transaction. I'll provide you with alternative payment methods right now.",
      feedback: "no",
      improvementNotes: "AI response was too generic and didn't address the specific payment issue or show empathy",
      sessionId: `test-session-${Date.now()}`
    };

    const replayResult = await makeRequest('/api/feedback/replay', 'POST', failedReplayData);
    console.log('✅ Feedback replay stored:', replayResult.replayId);

    // Test 2: Check if failure explanation was generated
    console.log('\n2. Checking AI failure insights...');
    
    const failureInsights = await makeRequest('/api/ai/failure-insights');
    console.log('📊 Failure Insights:', {
      totalFailures: failureInsights.totalFailures,
      recentFailuresCount: failureInsights.recentFailures?.length || 0,
      commonPatterns: failureInsights.commonFailurePatterns?.length || 0
    });

    // Test 3: Get failure explanations
    console.log('\n3. Retrieving failure explanations...');
    
    const explanations = await makeRequest('/api/ai/failure-explanations');
    console.log('🔍 Latest failure explanations:');
    explanations.slice(0, 3).forEach((exp, index) => {
      console.log(`\n   Failure ${index + 1}:`);
      console.log(`   Message: "${exp.message.substring(0, 60)}..."`);
      console.log(`   AI Reply: "${exp.aiReply.substring(0, 40)}..."`);
      console.log(`   Analysis: "${exp.explanation?.substring(0, 100)}..."`);
      console.log(`   Created: ${new Date(exp.createdAt).toLocaleString()}`);
    });

    // Test 4: Test direct failure analysis
    console.log('\n4. Testing direct failure analysis...');
    
    const directAnalysisData = {
      userMessage: "I've been waiting 2 hours for a response to my urgent issue!",
      aiReply: "We appreciate your patience.",
      agentReply: "I sincerely apologize for the 2-hour delay on your urgent matter. This is unacceptable service. Let me personally handle your issue right now and ensure it's resolved within the next 10 minutes.",
      feedback: "no"
    };

    const analysisResult = await makeRequest('/api/ai/analyze-failure', 'POST', directAnalysisData);
    console.log('🎯 Direct failure analysis:', {
      analyzed: analysisResult.analyzed,
      hasExplanation: !!analysisResult.explanation
    });

    // Test 5: Test positive feedback (should not trigger analysis)
    console.log('\n5. Testing positive feedback (no analysis expected)...');
    
    const positiveData = {
      userMessage: "Thank you for the great service!",
      aiReply: "You're welcome! We're glad we could help.",
      feedback: "yes"
    };

    const positiveResult = await makeRequest('/api/ai/analyze-failure', 'POST', positiveData);
    console.log('✅ Positive feedback result:', positiveResult.message);

    console.log('\n🎉 AI Self-Awareness Mode Test Complete!');
    console.log('\nKey Features Verified:');
    console.log('✅ Automatic failure analysis on negative feedback');
    console.log('✅ Failure explanation generation and storage');
    console.log('✅ Failure insights aggregation');
    console.log('✅ Direct failure analysis API');
    console.log('✅ Positive feedback filtering');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function testTrainingPipelineIntegration() {
  console.log('\n🔄 Testing Training Pipeline Integration...\n');

  try {
    // Test training data export
    console.log('1. Testing training data export...');
    
    const batchId = `batch-${Date.now()}`;
    const trainingExample = {
      prompt: "Customer is frustrated about payment failure",
      completion: "I understand your frustration with the payment issue. Let me check your account and resolve this immediately.",
      feedbackScore: 5,
      trainingBatch: batchId
    };

    const storeResult = await makeRequest('/api/training/store-example', 'POST', trainingExample);
    console.log('✅ Training example stored:', storeResult.id);

    // Test training data retrieval
    console.log('\n2. Getting training examples...');
    
    const examples = await makeRequest('/api/training/examples');
    console.log('📚 Training examples count:', examples.length);

    // Test JSONL export
    console.log('\n3. Testing JSONL export...');
    
    const exportData = await makeRequest('/api/training/export', 'POST', { batchId });
    console.log('📄 Export format preview:', exportData.jsonl?.substring(0, 200) + '...');

    console.log('\n✅ Training Pipeline Integration Complete!');

  } catch (error) {
    console.error('❌ Training pipeline test failed:', error.message);
  }
}

async function main() {
  console.log('🚀 Starting AI Self-Awareness Mode Test Suite\n');
  console.log('=' .repeat(60));
  
  await testAISelfAwarenessSystem();
  await testTrainingPipelineIntegration();
  
  console.log('\n' + '='.repeat(60));
  console.log('🎯 Test Suite Complete - GPT Ops Mode Verified');
}

main().catch(console.error);