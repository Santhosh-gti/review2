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
    <h2>Results - ${test.subject}</h2>
    <p><b>Score:</b> ${test.score}/ ${totalQuestions}</p>
  `;

  /* ---------- STRENGTHS & WEAKNESSES ---------- */
if (test.strengths?.length || test.weaknesses?.length) {
  html += `<h3>Performance Summary</h3>`;

  if (test.strengths?.length) {
    html += `
      <b>Strengths:</b>
      <ul>
        ${test.strengths.map(s => `<li>${s}</li>`).join("")}
      </ul>
    `;
  }

  if (test.weaknesses?.length) {
    html += `
      <b>Weaknesses:</b>
      <ul>
        ${test.weaknesses.map(w => `<li>${w}</li>`).join("")}
      </ul>
      <hr>
    `;
  }
}


  test.answers.forEach((a, i) => {
    html += `
      <div style="margin-bottom:24px">
        <b>Q${i + 1}:</b> ${a.prompt_text}<br><br>
    `;

    if (a.code_snippet) {
      html += `<pre>${a.code_snippet}</pre>`;
    }

    if (a.prompt_image) {
      html += `<img src="${a.prompt_image}"
        style="max-width:400px;border:1px solid #ccc"><br>`;
    }

    html += `
      <b>Your Answer:</b>
      <pre>${a.user_answer}</pre>

      <b>Correct Answer:</b>
      <pre>${a.correct_answer}</pre>

      <b>Result:</b> ${a.is_correct ? "Correct ✅" : "Wrong ❌"}<br>
    `;

    if (!a.is_correct) {
      html += `
        <div style="margin-top:8px">
          <b>AI Feedback:</b><br>
          <pre style="white-space:pre-wrap">
    ${a.ai_feedback && a.ai_feedback.trim() !== ""
      ? a.ai_feedback
      : "AI feedback unavailable."}
          </pre>
        </div>
      `;
    }


    if (!a.is_correct && a.reference_link) {
      html += `
        <a href="${a.reference_link}" target="_blank">
          📘 Learn this concept
        </a>
      `;
    }

    html += `<hr></div>`;
  });

  html += `<button onclick="location.hash='#home'">Home</button>`;
  app.innerHTML = html;
}
