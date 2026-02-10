import { db } from "./firebase.js";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  getFunctions,
  httpsCallable
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-functions.js";


/* ---------------- GLOBAL STATE ---------------- */
window.addEventListener("hashchange", renderTest);
renderTest();

let currentQuestions = [];
let currentSubject = "";

const functions = getFunctions();
const generateAIFeedback = httpsCallable(functions, "generateAIFeedback");

/* ---------------- RENDER TEST ---------------- */
async function renderTest() {
  const hash = location.hash;
  if (!hash.startsWith("#test-")) return;

  currentSubject = hash.replace("#test-", "");
  const app = document.getElementById("app");

  app.innerHTML = `<h2>${currentSubject} Test</h2><p>Loading questions...</p>`;

  const qRef = collection(db, "questions");
  const q = query(qRef, where("subject", "==", currentSubject));
  const snapshot = await getDocs(q);

  currentQuestions = [];

  let html = `<h2>${currentSubject} Test</h2><form id="testForm">`;
  let i = 1;

  snapshot.forEach(doc => {
    const qn = { id: doc.id, ...doc.data() };
    currentQuestions.push(qn);

    html += `<div class="question">
      <p><b>Q${i}</b>: ${qn.prompt_text}</p>`;

    if (qn.code_snippet) {
      html += `<pre>${qn.code_snippet}</pre>`;
    }

    if (qn.prompt_image) {
      html += `<img src="${qn.prompt_image}"
        style="max-width:420px;border:1px solid #ccc;margin:10px 0"><br>`;
    }

    /* ---------- MCQ ---------- */
    if (qn.type === "mcq") {
      qn.options.forEach((opt, idx) => {
        html += `
          <label>
            <input type="radio" name="q${i}" value="${idx}">
            <pre style="display:inline">${opt.value}</pre>
          </label><br>
        `;
      });
    }

    /* ---------- OUTPUT ---------- */
    else if (qn.type === "OUTPUT") {
      html += `
        <input type="text"
               name="q${i}"
               placeholder="Enter output"
               style="width:300px">
      `;
    }

    html += `</div><br>`;
    i++;
  });

  html += `<button type="submit">Submit Test</button></form>`;
  app.innerHTML = html;

  document.getElementById("testForm").onsubmit = handleSubmit;
}

/* ---------------- SUBMIT ---------------- */
async function handleSubmit(e) {
  e.preventDefault();

  const form = new FormData(e.target);
  const userAnswers = {};

  for (const [key, value] of form.entries()) {
    userAnswers[key] = value.trim();
  }

  for (let i = 1; i <= currentQuestions.length; i++) {
    if (!userAnswers[`q${i}`]) {
      alert(`Please answer Question ${i}`);
      return;
    }
  }

  await handleEvaluation(userAnswers);
}

/* ---------------- NORMALIZATION ---------------- */
function normalizeAnswer(ans, qn) {
  let a = String(ans ?? "");

  if (!qn.case_sensitive) a = a.toLowerCase();
  if (qn.ignore_space) a = a.replace(/\s+/g, "");

  return a.trim();
}

/* ---------------- EVALUATION ---------------- */
async function handleEvaluation(userAnswers) {
  let score = 0;
  const strengths = new Set();
  const weaknesses = new Set();
  const detailedAnswers = [];

  for (let i = 0; i < currentQuestions.length; i++) {
    const qn = currentQuestions[i];
    const key = `q${i + 1}`;

    let userAnswerText = "";
    let correctAnswerText = "";

    /* ---------- MCQ ---------- */
    if (qn.type === "mcq") {
      const userIndex = Number(userAnswers[key]);
      const correctIndex = Number(qn.expected_answer);

      userAnswerText =
        qn.options?.[userIndex]?.value ?? "No answer";
      correctAnswerText =
        qn.options?.[correctIndex]?.value ?? "No answer";
    }

    /* ---------- OUTPUT ---------- */
    else if (qn.type === "OUTPUT") {
      userAnswerText = userAnswers[key] || "No answer";
      correctAnswerText = qn.expected_answer || "No answer";
    }

    const isCorrect =
      normalizeAnswer(userAnswerText, qn) ===
      normalizeAnswer(correctAnswerText, qn);

    if (isCorrect) {
      score++;
      qn.concepts?.forEach(c => strengths.add(c));
    } else {
      qn.concepts?.forEach(c => weaknesses.add(c));
    }

    let aiFeedback = "";

    if (!isCorrect) {
      try {
        const res = await generateAIFeedback({
          question: qn.prompt_text,
          userAnswer: userAnswerText,
          correctAnswer: correctAnswerText
        });

        aiFeedback = res.data.feedback
          ?.replace(/\*\*/g, "")
          ?.replace(/(\d+\.)/g, "\n$1")
          ?.trim() || "";
      } catch (err) {
        console.error("AI feedback failed:", err);
        aiFeedback = "AI feedback unavailable.";
      }
    }

    detailedAnswers.push({
      question_id: qn.id,
      prompt_text: qn.prompt_text,
      code_snippet: qn.code_snippet || "",
      prompt_image: qn.prompt_image || "",
      type: qn.type,
      options: qn.options || null,
      user_answer: userAnswerText,
      correct_answer: correctAnswerText,
      is_correct: isCorrect,
      concepts: qn.concepts || [],
      reference_link: qn.reference_link || "",
      ai_feedback: aiFeedback
    });
  }

  await addDoc(collection(db, "tests"), {
    subject: currentSubject,
    score,
    strengths: [...strengths],
    weaknesses: [...weaknesses],
    answers: detailedAnswers,
    submitted_at: serverTimestamp()
  });

  location.hash = "#results";
}
