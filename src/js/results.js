import { db } from "./firebase.js";
import {
  collection,
  query,
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

  const q = query(
    collection(db, "tests"),
    orderBy("submitted_at", "desc"),
    limit(1)
  );

  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    app.innerHTML = "<p>No results found.</p>";
    return;
  }

  const test = snapshot.docs[0].data();

  let html = `
    <h2>Results - ${test.subject}</h2>
    <p><b>Score:</b> ${test.score}</p>

    <h3>Detailed Analysis</h3>
  `;

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
