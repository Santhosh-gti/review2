import { db } from "./firebase.js";
import {
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

window.addEventListener("hashchange", renderConcepts);
renderConcepts();

async function renderConcepts() {
  const hash = location.hash;
  if (!hash.startsWith("#concepts-")) return;

  const subject = hash.replace("#concepts-", "");
  const app = document.getElementById("app");

  /* ---------------- FETCH QUESTIONS ---------------- */
  const qRef = collection(db, "questions");
  const q = query(qRef, where("subject", "==", subject));
  const snapshot = await getDocs(q);

  const questions = [];
  const primaryConceptSet = new Set();

  snapshot.forEach(doc => {
    const data = doc.data();
    questions.push(data);

    if (Array.isArray(data.concepts) && data.concepts.length > 0) {
      primaryConceptSet.add(data.concepts[0]); // only concepts[0]
    }
  });

  const primaryConcepts = Array.from(primaryConceptSet);

  /* ---------------- UI STRUCTURE ---------------- */
  app.innerHTML = `
    <h2>Select Concepts - ${subject}</h2>

    <button id="manualBtn">Select Manually</button>
    <button id="typeBtn">Type Your Syllabus</button>

    <div id="dynamicSection" style="margin-top:20px;"></div>

    <br><br>
    <button onclick="location.hash='#take-test'">Back</button>
  `;

  const dynamicSection = document.getElementById("dynamicSection");

  /* ===================================================== */
  /* ================= MANUAL SELECTION ================== */
  /* ===================================================== */

  document.getElementById("manualBtn").onclick = () => {
    let html = "";

    primaryConcepts.forEach(concept => {
      html += `
        <label>
          <input type="checkbox" value="${concept}">
          ${concept}
        </label><br>
      `;
    });

    html += `<button id="generateManual">Generate Test</button>`;

    dynamicSection.innerHTML = html;

    document.getElementById("generateManual").onclick = () => {
      const selected = [];

      document.querySelectorAll("input[type=checkbox]:checked")
        .forEach(cb => selected.push(cb.value));

      if (selected.length === 0) {
        alert("Please select at least one concept.");
        return;
      }

      sessionStorage.setItem("selectedConcepts", JSON.stringify(selected));
      location.hash = `#test-${subject}`;
    };
  };

  /* ===================================================== */
  /* ================= TYPE SYLLABUS ===================== */
  /* ===================================================== */

  document.getElementById("typeBtn").onclick = () => {
    dynamicSection.innerHTML = `
      <textarea id="syllabusText"
        placeholder="Paste your syllabus here..."
        style="width:100%; height:150px;"></textarea>
      <br><br>
      <button id="analyzeBtn">Submit</button>

      <div id="matchedConcepts" style="margin-top:20px;"></div>
    `;

    document.getElementById("analyzeBtn").onclick = () => {
      const text =
        document.getElementById("syllabusText")
          .value
          .toLowerCase()
          .replace(/-/g, " ");  // treat "-" as space

      if (!text.trim()) {
        alert("Please enter syllabus text.");
        return;
      }

      const matchedPrimaryConcepts = new Set();

      questions.forEach(q => {
        if (!Array.isArray(q.concepts)) return;

        for (let conceptVariant of q.concepts) {
          if (text.includes(conceptVariant.toLowerCase())) {
            matchedPrimaryConcepts.add(q.concepts[0]); // only show primary
            break;
          }
        }
      });

      const matched = Array.from(matchedPrimaryConcepts);
      const displayDiv = document.getElementById("matchedConcepts");

      if (matched.length === 0) {
        displayDiv.innerHTML = `<p>No matching concepts found.</p>`;
        return;
      }

      let html = `<h3>Matched Concepts:</h3><ul>`;
      matched.forEach(c => {
        html += `<li>${c}</li>`;
      });
      html += `</ul>`;

      html += `<button id="generateTyped">Generate Test</button>`;

      displayDiv.innerHTML = html;

      document.getElementById("generateTyped").onclick = () => {
        sessionStorage.setItem(
          "selectedConcepts",
          JSON.stringify(matched)
        );
        location.hash = `#test-${subject}`;
      };
    };
  };
}
