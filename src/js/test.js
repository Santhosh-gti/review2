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

import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

/* ---------------- GLOBAL STATE ---------------- */
let currentQuestions = [];
let currentSubject = "";

window.addEventListener("hashchange", renderTest);
renderTest();

const functions = getFunctions();
const generateAIFeedback = httpsCallable(functions, "generateAIFeedback");

/* ---------------- RENDER TEST ---------------- */
async function renderTest() {
  const hash = location.hash;
  if (!hash.startsWith("#test-")) return;

  currentSubject = hash.replace("#test-", "");
  const app = document.getElementById("app");

  app.innerHTML = `<p>Loading questions...</p>`;

  const qRef = collection(db, "questions");

  const selectedConcepts =
    JSON.parse(sessionStorage.getItem("selectedConcepts")) || [];

  let q;

  if (selectedConcepts.length > 0) {
    q = query(
      qRef,
      where("subject", "==", currentSubject),
      where("concepts", "array-contains-any", selectedConcepts)
    );
  } else {
    q = query(qRef, where("subject", "==", currentSubject));
  }

  const snapshot = await getDocs(q);

  currentQuestions = [];

  let html = `
    <div class="header">CodeInsight</div>

    <div class="page-container">
      <h2>${currentSubject} Test</h2>
      <form id="testForm">
  `;

  let i = 1;

  snapshot.forEach(doc => {
    const qn = { id: doc.id, ...doc.data() };
    currentQuestions.push(qn);

    html += `<div class="question-card">
      <p><b>Q${i}:</b> ${qn.prompt_text}</p>`;

    if (qn.code_snippet) {
      html += `<pre class="code-block">${qn.code_snippet}</pre>`;
    }

    if (qn.prompt_image) {
      html += `<img src="${qn.prompt_image}" class="question-img"><br>`;
    }

    /* ---------- MCQ ---------- */
    if (qn.type === "mcq") {
      qn.options.forEach((opt, idx) => {
        html += `
          <label class="option">
            <input type="radio" name="q${i}" value="${idx}">
            <pre class="option-text">${opt.value}</pre>
          </label>
        `;
      });
    }

    /* ---------- OUTPUT ---------- */
    else if (qn.type === "OUTPUT") {
      html += `
        <input type="text"
          name="q${i}"
          placeholder="Enter output"
          class="output-box">
      `;
    }

    html += `</div>`;
    i++;
  });

  html += `
        <button type="submit" class="submit-btn">Submit Test</button>
      </form>
    </div>

    <div class="footer">
      © 2026 CodeInsight • Built for students
    </div>

    <style>

      .page-container {
        max-width: 800px;
        margin: auto;
        padding: 30px;
      }

      .question-card {
        background: white;
        padding: 20px;
        margin-bottom: 20px;
        border-radius: 10px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.08);
      }

      .code-block {
        background: #f4f4f4;
        padding: 10px;
        border-radius: 6px;
        overflow-x: auto;
      }

      .question-img {
        max-width: 100%;
        border: 1px solid #ccc;
        margin: 10px 0;
      }

      /* MCQ styling */
      .option {
        display: block;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 6px;
        margin: 8px 0;
        cursor: pointer;
        transition: 0.2s;
      }

      .option-text {
        display: inline;
        margin: 0;
        white-space: pre-wrap;
        font-family: inherit;
      }

      .option:hover {
        background: #f5f5f5;
      }

      .option input {
        margin-right: 10px;
      }

      .option input:checked + span {
        color: green;
        font-weight: bold;
      }

      /* OUTPUT BOX FIXED */
      .output-box {
        width: 100%;
        padding: 10px;
        border-radius: 6px;
        border: 1px solid #ccc;
        box-sizing: border-box;
        transition: border 0.2s, box-shadow 0.2s;
      }

      .output-box:focus {
        outline: none;
        border: 1px solid #4a90e2;
        box-shadow: 0 0 5px rgba(74,144,226,0.5);
      }

      .submit-btn {
        width: 100%;
        padding: 12px;
        background: #4a90e2;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        margin-top: 20px;
      }

      .submit-btn:hover {
        background: #357bd8;
      }

    </style>
  `;

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

    if (qn.type === "mcq") {
      const userIndex = Number(userAnswers[key]);
      const correctIndex = Number(qn.expected_answer);

      userAnswerText = qn.options?.[userIndex]?.value ?? "No answer";
      correctAnswerText = qn.options?.[correctIndex]?.value ?? "No answer";
    } else {
      userAnswerText = userAnswers[key] || "No answer";
      correctAnswerText = qn.expected_answer || "No answer";
    }

    const isCorrect =
      normalizeAnswer(userAnswerText, qn) ===
      normalizeAnswer(correctAnswerText, qn);

    const mainConcept = qn.concepts?.[0];

    if (isCorrect) {
      score++;
      if (mainConcept) strengths.add(mainConcept);
    } else {
      if (mainConcept) weaknesses.add(mainConcept);
    }

    let aiFeedback = "";

    if (!isCorrect) {
      try {
        const res = await generateAIFeedback({
          question: qn.prompt_text,
          userAnswer: userAnswerText,
          correctAnswer: correctAnswerText
        });

        aiFeedback = res.data.feedback || "";
      } catch (err) {
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

  const auth = getAuth();
  const user = auth.currentUser;

  const docRef = await addDoc(collection(db, "tests"), {
    userId: user.uid,
    subject: currentSubject,
    score,
    strengths: [...strengths],
    weaknesses: [...weaknesses],
    answers: detailedAnswers,
    submitted_at: serverTimestamp()
  });

  sessionStorage.setItem("viewTestId", docRef.id);
  location.hash = "#results";
}