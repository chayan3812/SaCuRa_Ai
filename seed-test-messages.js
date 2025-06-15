/**
 * SmartInboxAI Test Message Seeder
 * Generates realistic customer messages for AI analysis testing
 */

import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { customerInteractions } from './shared/schema.js';
import { eq } from 'drizzle-orm';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool });

const testMessages = [
  {
    customerName: "Sarah Johnson",
    message: "This is the third time my payment failed, what's going on?? I'm getting really frustrated and considering switching to a competitor. Fix this now!",
    expectedType: "Complaint",
    expectedUrgency: 85
  },
  {
    customerName: "Mike Chen", 
    message: "Hey, can I connect my bank account to this platform or does it only work with credit cards? Also wondering about international transfers.",
    expectedType: "Question",
    expectedUrgency: 25
  },
  {
    customerName: "Emma Rodriguez",
    message: "URGENT! My online store is completely down and it's Black Friday! Customers can't place orders and I'm losing thousands of dollars every minute!",
    expectedType: "Urgent Issue",
    expectedUrgency: 95
  },
  {
    customerName: "David Kumar",
    message: "Cool interface! Really impressed with the design. Just wanted to check if this works for international businesses? I'm based in Singapore.",
    expectedType: "Positive Feedback", 
    expectedUrgency: 15
  },
  {
    customerName: "Lisa Thompson",
    message: "I can't find the export button anywhere in the dashboard. I need to download my data for compliance reporting. Where is it located?",
    expectedType: "Support Request",
    expectedUrgency: 45
  },
  {
    customerName: "Robert Kim",
    message: "Your service saved my business! The automated features work perfectly and customer support has been amazing. Thank you so much!",
    expectedType: "Positive Feedback",
    expectedUrgency: 10
  },
  {
    customerName: "Janet Wilson",
    message: "I was charged twice for last month's subscription. Please refund the duplicate charge immediately. This is unacceptable.",
    expectedType: "Billing Issue",
    expectedUrgency: 70
  },
  {
    customerName: "Alex Martinez",
    message: "Could you add a dark mode theme? It would be really helpful for users who work late hours. Also, any plans for mobile app?",
    expectedType: "Feature Request",
    expectedUrgency: 20
  },
  {
    customerName: "Grace Liu",
    message: "System keeps crashing when I try to upload large files. Getting error code 500. This is blocking my entire workflow.",
    expectedType: "Bug Report",
    expectedUrgency: 65
  }
];

async function seedTestMessages() {
  console.log("🌱 Starting SmartInboxAI test message seeding...");
  
  try {
    const demoPageId = "demo-page-001";
    
    for (const testMsg of testMessages) {
      console.log(`📝 Seeding message from ${testMsg.customerName}...`);
      
      const messageData = {
        pageId: demoPageId,
        customerId: `customer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        customerName: testMsg.customerName,
        message: testMsg.message,
        status: "pending",
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      };

      await db.insert(customerInteractions).values(messageData);
      console.log(`✅ Message seeded: ${testMsg.expectedType} (expected ${testMsg.expectedUrgency}% urgency)`);
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`🎉 Successfully seeded ${testMessages.length} test messages!`);
    console.log(`📊 Visit /smart-inbox to see the messages and test AI analysis.`);
    
  } catch (error) {
    console.error("❌ Error seeding test messages:", error);
    process.exit(1);
  }
}

async function clearTestMessages() {
  console.log("🧹 Clearing existing test messages...");
  
  try {
    await db.delete(customerInteractions).where(eq(customerInteractions.pageId, "demo-page-001"));
    console.log(`✅ Cleared existing test messages`);
  } catch (error) {
    console.error("❌ Error clearing test messages:", error);
  }
}

async function main() {
  const action = process.argv[2];
  
  if (action === "clear") {
    await clearTestMessages();
  } else {
    await clearTestMessages();
    await seedTestMessages();
  }
  
  process.exit(0);
}

main().catch(console.error);

export { seedTestMessages, clearTestMessages };