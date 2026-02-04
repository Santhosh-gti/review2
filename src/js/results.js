import { db } from "./firebase.js";
import { collection, query, orderBy, limit, getDocs } from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

window.addEventListener("hashchange", renderResults);
renderResults();

// ---------- Helper: Render Option (Text / Image) ----------
function renderOption(option) {
  if (!option) return "<i>No answer</i>";

  // Image option
  if (option.type === "image") {
    return `
      <img src="${option.value}"
           style="max-width:400px;border:1px solid #ccc;margin-top:6px">
    `;
  }

  // Text / Code option
  return `<pre style="display:inline">${option.value}</pre>`;
}

// ---------- Render Results ----------
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

    <h3>Strengths</h3>
    <ul>${test.strengths.map(s => `<li>${s}</li>`).join("")}</ul>

    <h3>Weaknesses</h3>
    <ul>${test.weaknesses.map(w => `<li>${w}</li>`).join("")}</ul>

    <h3>Detailed Analysis</h3>
  `;

  test.answers.forEach((a, i) => {

    const userIndex = Number(a.user_answer);
    const correctIndex = Number(a.correct_answer);

    const userOption = a.options?.[userIndex];
    const correctOption = a.options?.[correctIndex];

    html += `
      <div style="margin-bottom:20px">
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
      <b>Your Answer:</b><br>
      ${
        Array.isArray(a.options) && a.options.length > 0
          ? renderOption(userOption)
          : `<pre>${a.user_answer !== "" ? a.user_answer : "No answer"}</pre>`
      }
      <br><br>

      <b>Correct Answer:</b><br>
      ${
        Array.isArray(a.options) && a.options.length > 0
          ? renderOption(correctOption)
          : `<pre>${a.correct_answer !== "" ? a.correct_answer : "No answer"}</pre>`
      }
      <br><br>

      <b>Result:</b> ${a.is_correct ? "Correct ✅" : "Wrong ❌"}<br>
    `;

    if (!a.is_correct) {
      html += `
        <i>AI Feedback:</i> ${a.ai_feedback}<br>
      `;
      if (a.reference_link) {
        html += `
          <a href="${a.reference_link}" target="_blank">📘 Learn this concept</a>
        `;
      }
    }

    html += `<hr></div>`;

  });

  html += `<button onclick="location.hash='#home'">Home</button>`;

  app.innerHTML = html;
}
