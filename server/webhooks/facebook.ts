/**
 * Facebook Messenger Webhook Handler
 * Handles webhook verification and incoming message events
 */

import express from "express";
const router = express.Router();

// Verify token for Facebook webhook verification
const VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN || "sacura_ai_webhook_token_2025";

// Facebook webhook verification (GET request)
router.get("/", (req, res) => {
  console.log("Facebook webhook verification request received");
  
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  console.log("Verification params:", { mode, token, challenge });

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verification successful");
    return res.status(200).send(challenge);
  } else {
    console.log("Webhook verification failed - invalid token");
    return res.sendStatus(403);
  }
});

// Facebook webhook event handler (POST request)
router.post("/", async (req, res) => {
  console.log("Incoming Facebook webhook event:", JSON.stringify(req.body, null, 2));
  
  try {
    const body = req.body;

    // Process incoming messages
    if (body.object === "page") {
      body.entry?.forEach((entry: any) => {
        entry.messaging?.forEach(async (event: any) => {
          if (event.message) {
            await handleMessage(event);
          } else if (event.postback) {
            await handlePostback(event);
          }
        });
      });
    }

    // Always respond with 200 to acknowledge receipt
    res.status(200).send("EVENT_RECEIVED");
  } catch (error) {
    console.error("Error processing webhook event:", error);
    res.status(500).send("Error processing event");
  }
});

// Handle incoming messages
async function handleMessage(event: any) {
  const senderId = event.sender.id;
  const messageText = event.message.text;
  const recipientId = event.recipient.id; // Facebook Page ID
  
  console.log(`Message from ${senderId}: ${messageText}`);
  
  // Store the interaction in database
  try {
    const { storage } = await import('../storage');
    
    // Find or create Facebook page entry
    let facebookPage = await storage.getFacebookPageByPageId(recipientId);
    if (!facebookPage) {
      // Create a default Facebook page entry for webhook messages
      facebookPage = await storage.createFacebookPage({
        userId: 'system-webhook-user', // System user for webhook messages
        pageId: recipientId,
        pageName: 'Facebook Messenger',
        accessToken: 'webhook_token',
        category: 'Business'
      });
    }
    
    await storage.createCustomerInteraction({
      pageId: facebookPage.id,
      customerId: senderId,
      customerName: 'Facebook User',
      message: messageText,
      sentiment: 'neutral',
      status: 'pending'
    });
  } catch (error) {
    console.error("Error storing message:", error);
  }

  // Send auto-response using AI
  try {
    await sendAIResponse(senderId, messageText);
  } catch (error) {
    console.error("Error sending AI response:", error);
  }
}

// Handle postback events
async function handlePostback(event: any) {
  const senderId = event.sender.id;
  const payload = event.postback.payload;
  
  console.log(`Postback from ${senderId}: ${payload}`);
  
  // Handle different postback payloads
  switch (payload) {
    case 'GET_STARTED':
      await sendMessage(senderId, "Welcome to SaCuRa AI! How can I help you today?");
      break;
    default:
      console.log(`Unknown postback payload: ${payload}`);
  }
}

// Send AI-powered response
async function sendAIResponse(recipientId: string, messageText: string) {
  try {
    // Import AI service
    const { generateCustomerServiceResponse } = await import('../openai');
    
    // Generate AI response with context
    const aiResult = await generateCustomerServiceResponse(
      messageText,
      [], // No previous interactions for now
      "SaCuRa AI Customer Support"
    );
    
    console.log(`AI Response generated for ${recipientId}: ${aiResult.response} (confidence: ${aiResult.confidence})`);
    
    // Only send AI response if confidence is above threshold
    if (aiResult.confidence > 0.6 && !aiResult.requiresHuman) {
      await sendMessage(recipientId, aiResult.response);
    } else {
      console.log(`Low confidence AI response (${aiResult.confidence}), requires human intervention`);
      await sendMessage(recipientId, "Thank you for your message. A team member will respond to you shortly.");
    }
  } catch (error) {
    console.error("Error generating AI response:", error);
    // Fallback message
    await sendMessage(recipientId, "Thank you for your message! Our team will get back to you soon.");
  }
}

// Send message to Facebook user
async function sendMessage(recipientId: string, messageText: string) {
  const PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;
  
  if (!PAGE_ACCESS_TOKEN) {
    console.error("FB_PAGE_ACCESS_TOKEN not found");
    return;
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient: { id: recipientId },
          message: { text: messageText },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Error sending message:", error);
    } else {
      console.log(`Message sent to ${recipientId}: ${messageText}`);
    }
  } catch (error) {
    console.error("Error sending message:", error);
  }
}

export default router;