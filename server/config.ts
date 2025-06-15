/**
 * Configuration Management for AI Ops
 * Handles model selection, feature flags, and performance thresholds
 */

export const AI_CONFIG = {
  // Model Selection
  USE_FINE_TUNED_MODEL: process.env.USE_FINE_TUNED_MODEL === 'true',
  FINE_TUNED_MODEL_ID: process.env.FINE_TUNED_MODEL_ID || 'ft:gpt-4o-2024-08-06:personal::AExample',
  BASE_MODEL: 'gpt-4o',
  
  // Performance Thresholds
  PERFORMANCE_DROP_THRESHOLD: 0.10, // 10% drop triggers auto-retraining
  CONFIDENCE_DRIFT_ALERT: 0.15, // 15% confidence drift alert
  REJECTION_RATE_THRESHOLD: 0.25, // 25% rejection rate alert
  
  // A/B Testing
  AB_TEST_SPLIT: 0.5, // 50/50 split between models
  AB_TEST_MIN_SAMPLES: 50, // Minimum samples for statistical significance
  
  // Auto-Training
  AUTO_TRAINING_ENABLED: true,
  TRAINING_BATCH_SIZE: 100,
  MIN_TRAINING_SAMPLES: 20,
  
  // SLA Monitoring
  MAX_RESPONSE_TIME: 5000, // 5 seconds max response time
  TARGET_CONFIDENCE: 0.80, // 80% target confidence
  TARGET_APPROVAL_RATE: 0.85, // 85% target approval rate
};

export const getActiveModel = (): string => {
  return AI_CONFIG.USE_FINE_TUNED_MODEL ? AI_CONFIG.FINE_TUNED_MODEL_ID : AI_CONFIG.BASE_MODEL;
};

export const shouldTriggerAutoTraining = (performanceDrop: number): boolean => {
  return AI_CONFIG.AUTO_TRAINING_ENABLED && performanceDrop >= AI_CONFIG.PERFORMANCE_DROP_THRESHOLD;
};

export const isStatisticallySignificant = (sampleSize: number): boolean => {
  return sampleSize >= AI_CONFIG.AB_TEST_MIN_SAMPLES;
};