import OpenAI from "openai";
import { db } from "./db";
import { aiReplyImprovements, aiAssistantVersions } from "@shared/schema";
import { desc } from "drizzle-orm";
import fs from "fs/promises";
import path from "path";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface FineTuningJob {
  id: string;
  status: string;
  model: string;
  trainingFile: string;
  fineTunedModel?: string;
  hyperparameters: any;
  resultFiles: string[];
  trainedTokens?: number;
  error?: any;
}

export class OpenAIFineTuningEngine {
  private trainingDataPath = "./training_data";

  async generateFineTuneJSONL(options: {
    limit?: number;
    minScoreGain?: number;
    categories?: string[];
  } = {}): Promise<{
    filename: string;
    recordCount: number;
    fileSize: string;
  }> {
    const {
      limit = 1000,
      minScoreGain = 1,
      categories = []
    } = options;

    console.log(`📄 Generating JSONL for OpenAI fine-tuning...`);

    // Get top improved replies from database
    let query = db
      .select()
      .from(aiReplyImprovements)
      .where(gte(aiReplyImprovements.scoreGainEstimate, minScoreGain))
      .orderBy(desc(aiReplyImprovements.scoreGainEstimate));

    if (categories.length > 0) {
      query = query.where(inArray(aiReplyImprovements.failureCategory, categories));
    }

    const improvements = await query.limit(limit);

    if (improvements.length === 0) {
      throw new Error("No training data available for fine-tuning");
    }

    // Generate JSONL content
    const jsonlLines: string[] = [];

    for (const improvement of improvements) {
      const trainingExample = {
        messages: [
          {
            role: "system",
            content: "You are an elite customer service assistant. Provide empathetic, accurate, and actionable responses to customer inquiries."
          },
          {
            role: "user",
            content: improvement.originalPrompt
          },
          {
            role: "assistant",
            content: improvement.correctedReply
          }
        ]
      };

      jsonlLines.push(JSON.stringify(trainingExample));
    }

    // Ensure training data directory exists
    await fs.mkdir(this.trainingDataPath, { recursive: true });

    // Write JSONL file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = path.join(this.trainingDataPath, `training_data_${timestamp}.jsonl`);
    const content = jsonlLines.join('\n');
    
    await fs.writeFile(filename, content);

    const stats = await fs.stat(filename);

    console.log(`✅ Generated ${improvements.length} training examples in ${filename}`);

    return {
      filename,
      recordCount: improvements.length,
      fileSize: `${(stats.size / 1024).toFixed(2)} KB`
    };
  }

  async uploadTrainingFile(filename: string): Promise<string> {
    try {
      console.log(`⬆️ Uploading training file to OpenAI: ${filename}`);

      const fileStream = await fs.readFile(filename);
      
      const file = await openai.files.create({
        file: new File([fileStream], path.basename(filename), { type: 'application/jsonl' }),
        purpose: 'fine-tune'
      });

      console.log(`✅ Training file uploaded with ID: ${file.id}`);
      return file.id;
    } catch (error) {
      console.error('Error uploading training file:', error);
      throw new Error(`Failed to upload training file: ${error.message}`);
    }
  }

  async createFineTuningJob(options: {
    trainingFileId: string;
    model?: string;
    suffix?: string;
    hyperparameters?: {
      nEpochs?: number;
      batchSize?: number;
      learningRateMultiplier?: number;
    };
  }): Promise<FineTuningJob> {
    try {
      const {
        trainingFileId,
        model = "gpt-3.5-turbo",
        suffix = `pagepilot-${Date.now()}`,
        hyperparameters = {}
      } = options;

      console.log(`🚀 Creating fine-tuning job for model: ${model}`);

      const fineTuningJob = await openai.fineTuning.jobs.create({
        training_file: trainingFileId,
        model,
        suffix,
        hyperparameters: {
          n_epochs: hyperparameters.nEpochs || 3,
          batch_size: hyperparameters.batchSize || 1,
          learning_rate_multiplier: hyperparameters.learningRateMultiplier || 1.0,
        }
      });

      console.log(`✅ Fine-tuning job created: ${fineTuningJob.id}`);

      return {
        id: fineTuningJob.id,
        status: fineTuningJob.status,
        model: fineTuningJob.model,
        trainingFile: fineTuningJob.training_file,
        fineTunedModel: fineTuningJob.fine_tuned_model,
        hyperparameters: fineTuningJob.hyperparameters,
        resultFiles: fineTuningJob.result_files || [],
        trainedTokens: fineTuningJob.trained_tokens,
        error: fineTuningJob.error,
      };
    } catch (error) {
      console.error('Error creating fine-tuning job:', error);
      throw new Error(`Failed to create fine-tuning job: ${error.message}`);
    }
  }

  async checkFineTuningStatus(jobId: string): Promise<FineTuningJob> {
    try {
      const job = await openai.fineTuning.jobs.retrieve(jobId);

      return {
        id: job.id,
        status: job.status,
        model: job.model,
        trainingFile: job.training_file,
        fineTunedModel: job.fine_tuned_model,
        hyperparameters: job.hyperparameters,
        resultFiles: job.result_files || [],
        trainedTokens: job.trained_tokens,
        error: job.error,
      };
    } catch (error) {
      console.error('Error checking fine-tuning status:', error);
      throw new Error(`Failed to check fine-tuning status: ${error.message}`);
    }
  }

  async listFineTuningJobs(limit: number = 10): Promise<FineTuningJob[]> {
    try {
      const jobs = await openai.fineTuning.jobs.list({ limit });

      return jobs.data.map(job => ({
        id: job.id,
        status: job.status,
        model: job.model,
        trainingFile: job.training_file,
        fineTunedModel: job.fine_tuned_model,
        hyperparameters: job.hyperparameters,
        resultFiles: job.result_files || [],
        trainedTokens: job.trained_tokens,
        error: job.error,
      }));
    } catch (error) {
      console.error('Error listing fine-tuning jobs:', error);
      throw new Error(`Failed to list fine-tuning jobs: ${error.message}`);
    }
  }

  async registerFineTunedModel(jobId: string, description: string): Promise<string> {
    try {
      const job = await this.checkFineTuningStatus(jobId);
      
      if (job.status !== 'succeeded' || !job.fineTunedModel) {
        throw new Error(`Fine-tuning job not ready: status is ${job.status}`);
      }

      // Create new AI assistant version
      const [newVersion] = await db.insert(aiAssistantVersions).values({
        versionTag: `v2.0-ft-${Date.now()}`,
        description,
        fineTuneId: job.fineTunedModel,
        modelConfig: {
          baseModel: job.model,
          fineTuningJob: jobId,
          hyperparameters: job.hyperparameters,
          trainedTokens: job.trainedTokens,
        },
        trainingDataCount: job.trainedTokens || 0,
        performanceMetrics: {
          status: job.status,
          resultFiles: job.resultFiles,
        },
        isActive: false, // Don't activate automatically
      }).returning();

      console.log(`✅ Registered fine-tuned model as version: ${newVersion.versionTag}`);
      return newVersion.id;
    } catch (error) {
      console.error('Error registering fine-tuned model:', error);
      throw new Error(`Failed to register fine-tuned model: ${error.message}`);
    }
  }

  async getTrainingProgress(jobId: string): Promise<{
    progress: number;
    currentStep: string;
    estimatedCompletion?: Date;
    metrics?: any;
  }> {
    try {
      const job = await this.checkFineTuningStatus(jobId);
      
      let progress = 0;
      let currentStep = "Initializing";

      switch (job.status) {
        case 'validating_files':
          progress = 10;
          currentStep = "Validating training files";
          break;
        case 'queued':
          progress = 20;
          currentStep = "Queued for training";
          break;
        case 'running':
          progress = 50;
          currentStep = "Training in progress";
          break;
        case 'succeeded':
          progress = 100;
          currentStep = "Training completed";
          break;
        case 'failed':
        case 'cancelled':
          progress = 0;
          currentStep = `Training ${job.status}`;
          break;
      }

      return {
        progress,
        currentStep,
        metrics: {
          trainedTokens: job.trainedTokens,
          resultFiles: job.resultFiles,
          error: job.error,
        }
      };
    } catch (error) {
      console.error('Error getting training progress:', error);
      return {
        progress: 0,
        currentStep: "Error checking progress",
      };
    }
  }

  async exportFineTuningReport(jobId: string): Promise<string> {
    try {
      const job = await this.checkFineTuningStatus(jobId);
      
      const report = `
OpenAI Fine-Tuning Report
========================

Job ID: ${job.id}
Status: ${job.status}
Base Model: ${job.model}
Fine-Tuned Model: ${job.fineTunedModel || 'Not available'}

Training Details:
- Training File: ${job.trainingFile}
- Trained Tokens: ${job.trainedTokens || 'Not available'}
- Hyperparameters: ${JSON.stringify(job.hyperparameters, null, 2)}

Result Files: ${job.resultFiles.length}
${job.resultFiles.map(file => `- ${file}`).join('\n')}

${job.error ? `Error: ${JSON.stringify(job.error, null, 2)}` : ''}

Generated: ${new Date().toISOString()}
`;

      return report;
    } catch (error) {
      console.error('Error exporting fine-tuning report:', error);
      return `Error generating report: ${error.message}`;
    }
  }
}

export const openAIFineTuning = new OpenAIFineTuningEngine();