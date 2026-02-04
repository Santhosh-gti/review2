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

/* ---------------- FIREBASE FUNCTIONS ---------------- */
const functions = getFunctions();
const generateAIFeedback = httpsCallable(functions, "generateAIFeedback");

/* ---------------- AI FEEDBACK CALL ---------------- */
async function fetchAIFeedback({ question, userAnswer, correctAnswer }) {
  try {
    const result = await generateAIFeedback({
      question,
      userAnswer,
      correctAnswer
    });

    return result.data.feedback || "AI feedback unavailable.";
  } catch (err) {
    console.error("AI feedback error:", err);
    return "AI feedback unavailable.";
  }
}

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

    html += `
      <div class="question">
        <p><b>Q${i}</b>: ${qn.prompt_text}</p>
    `;

    if (qn.code_snippet) {
      html += `<pre>${qn.code_snippet}</pre>`;
    }

    if (qn.prompt_image) {
      html += `
        <img src="${qn.prompt_image}"
             style="max-width:420px;border:1px solid #ccc;margin:10px 0"><br>
      `;
    }

    /* ---------- MCQ (TEXT / IMAGE) ---------- */
    if (Array.isArray(qn.options) && qn.options.length > 0) {
      qn.options.forEach((opt, idx) => {

        if (opt.type === "image") {
          html += `
            <label>
              <input type="radio" name="q${i}" value="${idx}">
              <br>
              <img src="${opt.value}"
                   style="max-width:420px;border:1px solid #ccc;margin:6px 0">
            </label><br><br>
          `;
        } else {
          html += `
            <label>
              <input type="radio" name="q${i}" value="${idx}">
              <pre style="display:inline">${opt.value}</pre>
            </label><br>
          `;
        }
      });
    }

    /* ---------- OUTPUT / FILL TYPE ---------- */
    else {
      html += `
        <input type="text"
               name="q${i}"
               placeholder="Your Answer"
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

/* ---------------- SUBMIT + VALIDATION ---------------- */
async function handleSubmit(e) {
  e.preventDefault();

  const form = new FormData(e.target);
  const userAnswers = {};

  for (const [key, value] of form.entries()) {
    userAnswers[key] = value.trim();
  }

  /* ❗ Ensure ALL questions answered */
  for (let i = 1; i <= currentQuestions.length; i++) {
    if (!userAnswers[`q${i}`]) {
      alert(`Please answer Question ${i} before submitting.`);
      return;
    }
  }

  await handleEvaluation(userAnswers);
}

/* ---------------- NORMALIZATION ---------------- */
function normalizeAnswer(ans, qn) {
  let a = String(ans);

  if (!qn.case_sensitive) a = a.toLowerCase();
  if (qn.ignore_space) a = a.replace(/\s+/g, "");

  return a.trim();
}

/* ---------------- EVALUATION + AI ---------------- */
async function handleEvaluation(userAnswers) {
  let score = 0;
  const strengths = new Set();
  const weaknesses = new Set();
  const detailedAnswers = [];

  for (let index = 0; index < currentQuestions.length; index++) {
    const qn = currentQuestions[index];
    const key = `q${index + 1}`;
    const userAns = userAnswers[key];

    const correct = normalizeAnswer(qn.expected_answer, qn);
    const given = normalizeAnswer(userAns, qn);

    const isCorrect = correct === given;

    if (isCorrect) {
      score++;
      qn.concepts.forEach(c => strengths.add(c));
    } else {
      qn.concepts.forEach(c => weaknesses.add(c));
    }

    /* -------- AI FEEDBACK (WRONG ONLY) -------- */
    let aiFeedback = "";
    if (!isCorrect) {
      aiFeedback = await fetchAIFeedback({
        question: qn.prompt_text,
        userAnswer: userAns,
        correctAnswer: qn.expected_answer
      });
    }

    detailedAnswers.push({
      question_id: qn.id,
      prompt_text: qn.prompt_text,
      code_snippet: qn.code_snippet || "",
      prompt_image: qn.prompt_image || "",
      options: qn.options || null,
      user_answer: userAns,
      correct_answer: qn.expected_answer,
      is_correct: isCorrect,
      concepts: qn.concepts,
      reference_link: qn.reference_link || "",
      ai_feedback: aiFeedback
    });
  }

  const expandedWeaknesses = await expandWeaknesses([...weaknesses]);

  await addDoc(collection(db, "tests"), {
    subject: currentSubject,
    score,
    strengths: [...strengths],
    weaknesses: expandedWeaknesses,
    answers: detailedAnswers,
    submitted_at: serverTimestamp()
  });

  location.hash = "#results";
}

/* ---------------- CONCEPT DEPENDENCY EXPANSION ---------------- */
async function expandWeaknesses(weaknesses) {
  const expanded = new Set(weaknesses);

  for (const concept of weaknesses) {
    const snap = await getDocs(
      query(collection(db, "concepts"), where("name", "==", concept))
    );

    snap.forEach(doc => {
      const data = doc.data();
      if (Array.isArray(data.depends_on)) {
        data.depends_on.forEach(dep => expanded.add(dep));
      }
    });
  }

  return [...expanded];
}
