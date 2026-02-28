import { db } from "./firebase.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

window.addEventListener("hashchange", renderScores);
renderScores();

async function renderScores() {
  if (location.hash !== "#scores") return;

  const app = document.getElementById("app");
  app.innerHTML = "<h2>Loading Previous Scores...</h2>";

  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    app.innerHTML = "<p>Please login first.</p>";
    return;
  }

  const q = query(
    collection(db, "tests"),
    where("userId", "==", user.uid),
    orderBy("submitted_at", "desc")
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    app.innerHTML = `
      <div class="header">CodeInsight</div>

      <div class="page-container">
        <h2>Previous Scores</h2>
        <p>No tests taken yet.</p>
        <button class="back-btn" onclick="location.hash='#home'">Back</button>
      </div>

      <div class="footer">© 2026 CodeInsight • Built for students</div>
    `;
    return;
  }

  const tests = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  renderList(app, tests, "all");
}

function renderList(app, tests, selectedSubject) {

  const subjects = ["all", "C", "HTML", "CSS", "JavaScript", "MySQL"];

  let html = `
    <!-- HEADER -->
    <div class="header">CodeInsight</div>

    <div class="page-container">

      <h2>Previous Scores</h2>

      <div class="filter-box">
        <label><b>Filter by Subject:</b></label>
        <select id="subjectFilter">
          ${subjects.map(s => `
            <option value="${s}" ${s === selectedSubject ? "selected" : ""}>
              ${s.toUpperCase()}
            </option>
          `).join("")}
        </select>
      </div>

      <div class="score-list">
  `;

  const filteredTests =
    selectedSubject === "all"
      ? tests
      : tests.filter(t => t.subject === selectedSubject);

  if (filteredTests.length === 0) {
    html += `<p>No tests found for selected subject.</p>`;
  } else {
    filteredTests.forEach(test => {

      const date = test.submitted_at?.toDate
        ? test.submitted_at.toDate().toLocaleString()
        : "Unknown date";

      html += `
        <div class="score-card">
          <div class="score-info">
            <h3>${test.subject}</h3>
            <p><b>Score:</b> ${test.score}</p>
            <p class="date">${date}</p>
          </div>

          <button class="view-btn" onclick="viewResult('${test.id}')">
            View Result
          </button>
        </div>
      `;
    });
  }

  html += `
      </div>

      <button class="back-btn" onclick="location.hash='#home'">Back</button>

    </div>

    <!-- FOOTER -->
    <div class="footer">
      © 2026 CodeInsight • Built for students
    </div>

    <!-- INTERNAL CSS -->
    <style>

      .page-container {
        padding: 30px;
        min-height: calc(100vh - 140px);
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      h2 {
        margin-bottom: 20px;
      }

      .filter-box {
        margin-bottom: 25px;
      }

      select {
        padding: 8px 12px;
        border-radius: 6px;
        border: 1px solid #ccc;
        margin-left: 10px;
      }

      .score-list {
        width: 100%;
        max-width: 600px;
        display: flex;
        flex-direction: column;
        gap: 15px;
      }

      .score-card {
        background: white;
        padding: 18px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .score-info h3 {
        margin: 0 0 5px 0;
      }

      .score-info p {
        margin: 2px 0;
      }

      .date {
        font-size: 13px;
        color: #777;
      }

      .view-btn {
        background: #4f8df5;
        color: white;
        border: none;
        padding: 8px 14px;
        border-radius: 6px;
        cursor: pointer;
      }

      .view-btn:hover {
        background: #3c73cc;
      }

      .back-btn {
        margin-top: 25px;
        padding: 10px 20px;
        border: none;
        background: #555;
        color: white;
        border-radius: 6px;
        cursor: pointer;
      }

    </style>
  `;

  app.innerHTML = html;

  document.getElementById("subjectFilter")
    .addEventListener("change", (e) => {
      renderList(app, tests, e.target.value);
    });
}

window.viewResult = function(testId) {
  sessionStorage.setItem("viewTestId", testId);
  location.hash = "#results";
};