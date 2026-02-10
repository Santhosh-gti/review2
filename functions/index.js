/**
 * Firebase Cloud Functions – AI Feedback Engine (v2)
 * Supports MULTI-question feedback in ONE API call
 */

const { onCall } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const OpenAI = require("openai");

// --------------------
// Define Secret
// --------------------
const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");

// --------------------
// AI Feedback Function
// --------------------
exports.generateAIFeedback = onCall(
  {
    secrets: [OPENAI_API_KEY],
    timeoutSeconds: 60
  },
  async (request) => {
    try {
      const { subject, questions } = request.data;

      if (!subject || !Array.isArray(questions) || questions.length === 0) {
        throw new Error("Invalid request: subject or questions missing");
      }

      const client = new OpenAI({
        apiKey: OPENAI_API_KEY.value(),
      });

      const feedbackResults = [];

      // ---------- Generate feedback PER question ----------
      for (const q of questions) {
        const prompt = `
Subject: ${subject}

Question:
${q.question}

Student Answer:
${q.userAnswer || "No answer"}

Correct Answer:
${q.correctAnswer}

Explain briefly:
1. Why the student's answer is incorrect
2. What concept they should revise
3. Give a short improvement tip
        `;

        const response = await client.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.4,
        });

        let feedbackText = response.choices[0].message.content || "";

        // ---------- Clean formatting ----------
        feedbackText = feedbackText
          .replace(/\*\*/g, "")
          .replace(/\n{2,}/g, "\n")
          .replace(/(\d+\.)/g, "\n$1")
          .trim();

        feedbackResults.push({
          index: q.index,
          feedback: feedbackText
        });
      }

      return {
        success: true,
        feedback: feedbackResults
      };

    } catch (error) {
      console.error("AI Feedback Error:", error);

      return {
        success: false,
        feedback: []
      };
    }
  }
);
