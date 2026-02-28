import { db } from "./firebase.js";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

window.addEventListener("hashchange", renderResults);
renderResults();

/* ---------------- RENDER RESULTS ---------------- */
async function renderResults() {
  if (location.hash !== "#results") return;

  const app = document.getElementById("app");
  app.innerHTML = "<h2>Loading Results...</h2>";

  const testId = sessionStorage.getItem("viewTestId");

  let snapshot;

  if (testId) {
    snapshot = await getDocs(
      query(collection(db, "tests"), where("__name__", "==", testId))
    );
  } else {
    snapshot = await getDocs(
      query(
        collection(db, "tests"),
        orderBy("submitted_at", "desc"),
        limit(1)
      )
    );
  }

  if (snapshot.empty) {
    app.innerHTML = "<p>No results found.</p>";
    return;
  }

  const test = snapshot.docs[0].data();
  sessionStorage.removeItem("viewTestId");

  const totalQuestions = test.answers?.length || 0;

  let html = `
    <div class="header">CodeInsight</div>

    <div class="page-container">

      <h2>Results - ${test.subject}</h2>

      <div class="score-card">
        <p>Score</p>
        <h1>${test.score} / ${totalQuestions}</h1>
      </div>
  `;

  /* ---------- STRENGTHS & WEAKNESSES ---------- */
  if (test.strengths?.length || test.weaknesses?.length) {
    html += `<div class="summary-box"><h3>Performance Summary</h3>`;

    if (test.strengths?.length) {
      html += `
        <div class="strength">
          <b>Strengths</b>
          <ul>
            ${test.strengths.map(s => `<li>${s}</li>`).join("")}
          </ul>
        </div>
      `;
    }

    if (test.weaknesses?.length) {
      html += `
        <div class="weakness">
          <b>Weaknesses</b>
          <ul>
            ${test.weaknesses.map(w => `<li>${w}</li>`).join("")}
          </ul>
        </div>
      `;
    }

    html += `</div>`;
  }

  /* ---------- QUESTIONS ---------- */
  test.answers.forEach((a, i) => {
    html += `
      <div class="question-card">

        <p><b>Q${i + 1}:</b> ${a.prompt_text}</p>
    `;

    if (a.code_snippet) {
      html += `<pre class="code-block">${a.code_snippet}</pre>`;
    }

    if (a.prompt_image) {
      html += `<img src="${a.prompt_image}" class="question-img">`;
    }

    html += `
        <div class="answer-block">
          <b>Your Answer:</b>
          <pre>${a.user_answer}</pre>
        </div>

        <div class="answer-block correct">
          <b>Correct Answer:</b>
          <pre>${a.correct_answer}</pre>
        </div>

        <p class="${a.is_correct ? "correct-text" : "wrong-text"}">
          ${a.is_correct ? "Correct ✅" : "Wrong ❌"}
        </p>
    `;

    if (!a.is_correct) {
      html += `
        <div class="feedback">
          <b>AI Feedback:</b>
          <pre style="white-space: pre-wrap; word-wrap: break-word;">
${a.ai_feedback && a.ai_feedback.trim() !== ""
  ? a.ai_feedback
  : "AI feedback unavailable."}
          </pre>
        </div>
      `;
    }

    if (!a.is_correct && a.reference_link) {
      html += `
        <a href="${a.reference_link}" target="_blank" class="learn-link">
          📘 Learn this concept
        </a>
      `;
    }

    html += `</div>`;
  });

  html += `
      <button onclick="location.hash='#home'" class="home-btn">Go Home</button>
    </div>

    <div class="footer">
      © 2026 CodeInsight • Built for students
    </div>

    <style>

      .page-container {
        padding: 30px;
        max-width: 900px;
        margin: auto;
      }

      .score-card {
        background: white;
        padding: 20px;
        border-radius: 10px;
        text-align: center;
        margin: 20px 0;
        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
      }

      .summary-box {
        background: white;
        padding: 20px;
        border-radius: 10px;
        margin-bottom: 20px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
      }

      .strength ul {
        color: green;
      }

      .weakness ul {
        color: red;
      }

      .question-card {
        background: white;
        padding: 20px;
        border-radius: 10px;
        margin-bottom: 20px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
      }

      .code-block {
        background: #f4f4f4;
        padding: 10px;
        border-radius: 6px;
      }

      .question-img {
        max-width: 100%;
        border: 1px solid #ccc;
        margin: 10px 0;
      }

      .answer-block {
        margin-top: 10px;
      }

      .correct-text {
        color: green;
        font-weight: bold;
      }

      .wrong-text {
        color: red;
        font-weight: bold;
      }

      .feedback {
        margin-top: 10px;
        background: #fff4f4;
        padding: 10px;
        border-radius: 6px;
      }

      .learn-link {
        display: inline-block;
        margin-top: 10px;
        color: #007bff;
      }

      .home-btn {
        display: block;
        margin: 30px auto;
        padding: 10px 20px;
        border: none;
        background: #007bff;
        color: white;
        border-radius: 6px;
        cursor: pointer;
      }

    </style>
  `;

  app.innerHTML = html;
}