/**
 * Firebase Cloud Functions – AI Feedback Engine (v2)
 */

const { onCall } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const OpenAI = require("openai");

// --------------------
// Define Secrets
// --------------------
const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");

// --------------------
// AI Feedback Function
// --------------------
exports.generateAIFeedback = onCall(
  {
    secrets: [OPENAI_API_KEY],
  },
  async (request) => {
    try {
      const { question, userAnswer, correctAnswer } = request.data;

      if (!question || !userAnswer || !correctAnswer) {
        throw new Error("Missing required fields");
      }

      const client = new OpenAI({
        apiKey: OPENAI_API_KEY.value(),
      });

      const prompt = `
Question:
${question}

User Answer:
${userAnswer}

Correct Answer:
${correctAnswer}

Explain briefly:
1. Why the user's answer is incorrect
2. What concept they should revise
3. Give a short improvement tip
`;

      const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.4,
      });

      return {
        success: true,
        feedback: response.choices[0].message.content,
      };
    } catch (error) {
      console.error("AI Feedback Error:", error);

      return {
        success: false,
        feedback: "AI analysis failed. Please try again later.",
      };
    }
  }
);
