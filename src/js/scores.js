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
    app.innerHTML = "<h2>Previous Scores</h2><p>No tests taken yet.</p>";
    return;
  }

  // Convert docs to array for filtering
  const tests = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  renderList(app, tests, "all");
}

function renderList(app, tests, selectedSubject) {

  const subjects = ["all", "C", "HTML", "CSS", "JavaScript", "MySQL"];

  let html = `
    <h2>Previous Scores</h2>

    <label><b>Filter by Subject:</b></label>
    <select id="subjectFilter">
      ${subjects.map(s => `
        <option value="${s}" ${s === selectedSubject ? "selected" : ""}>
          ${s.toUpperCase()}
        </option>
      `).join("")}
    </select>

    <br><br>
    <ul>
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
        <li style="margin-bottom:12px">
          <b>${test.subject}</b> |
          Score: ${test.score} |
          ${date}
          <button onclick="viewResult('${test.id}')">
            View Result
          </button>
        </li>
      `;
    });
  }

  html += `
    </ul>
    <br>
    <button onclick="location.hash='#home'">Back</button>
  `;

  app.innerHTML = html;

  // Attach filter listener
  document.getElementById("subjectFilter")
    .addEventListener("change", (e) => {
      renderList(app, tests, e.target.value);
    });
}

window.viewResult = function(testId) {
  sessionStorage.setItem("viewTestId", testId);
  location.hash = "#results";
};
