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
      primaryConceptSet.add(data.concepts[0]);
    }
  });

  const primaryConcepts = Array.from(primaryConceptSet);

  /* ---------------- UI ---------------- */
  app.innerHTML = `
    <!-- HEADER (uses global CSS) -->
    <div class="header">
      CodeInsight
    </div>

    <div class="page-container">

      <h2>Select Concepts - ${subject}</h2>

      <div class="card-container">
        <div class="card" id="manualCard">
          <h3>Select Manually</h3>
          <p>Choose concepts manually for targeted practice</p>
        </div>

        <div class="card" id="typeCard">
          <h3>Type Your Syllabus</h3>
          <p>Paste syllabus and auto-detect concepts</p>
        </div>
      </div>

      <!-- POPUP -->
      <div id="popupOverlay" class="popup-overlay" style="display:none;">
        <div class="popup-box">
          <span id="closePopup" class="close-btn">&times;</span>
          <div id="popupContent"></div>
        </div>
      </div>

      <br>
      <button onclick="location.hash='#take-test'" class="back-btn">Back</button>

    </div>

    <!-- FOOTER -->
    <div class="footer">
      © 2026 CodeInsight • Built for students
    </div>

    <!-- INTERNAL CSS -->
    <style>
      
      #app {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
      }

      .page-container {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        
      }

      .card-container {
        display: flex;
        justify-content: center;
        gap: 20px;
        margin-top: 20px;
        margin-bottom: 20px;
        flex-wrap: wrap;
      }

      .card {
        background: white;
        padding: 25px;
        width: 250px;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        cursor: pointer;
        transition: 0.2s;
      }

      .card:hover {
        transform: translateY(-5px);
      }

      /* POPUP */
      .popup-overlay {
        position: fixed;
        top:0;
        left:0;
        width:100%;
        height:100%;
        background: rgba(0,0,0,0.5);
        display:flex;
        justify-content:center;
        align-items:center;
      }

      .popup-box {
        background:white;
        padding:30px 25px;
        border-radius:10px;
        width:420px;
        max-height:80%;
        overflow:auto;
        position:relative;
      }

      .close-btn {
        position:absolute;
        top:10px;
        right:15px;
        font-size:22px;
        cursor:pointer;
      }

      /* MANUAL LIST FIX */
      .concept-row {
        display:flex;
        justify-content:space-between;
        align-items:center;
        padding:8px 10px;
        border-bottom:1px solid #eee;
      }

      .concept-text {
        text-align:left;
      }

      /* TYPE BOX FIX */
      textarea {
        width:100%;
        height:130px;
        resize:none;
        overflow-y:auto;
        margin-top:10px;
      }

      .matched-box {
        text-align:left;
        margin-top:20px;
      }

      .back-btn {
        padding:10px 20px;
        border:none;
        background:#555;
        color:white;
        border-radius:6px;
        cursor:pointer;
      }

    </style>
  `;

  const popup = document.getElementById("popupOverlay");
  const popupContent = document.getElementById("popupContent");

  /* CLOSE */
  document.getElementById("closePopup").onclick = () => {
    popup.style.display = "none";
  };

  /* ================= MANUAL ================= */
  document.getElementById("manualCard").onclick = () => {
    let html = "";

    primaryConcepts.forEach(concept => {
      html += `
        <div class="concept-row">
          <span class="concept-text">${concept}</span>
          <input type="checkbox" value="${concept}">
        </div>
      `;
    });

    html += `<br><button id="generateManual">Generate Test</button>`;

    popupContent.innerHTML = html;
    popup.style.display = "flex";

    document.getElementById("generateManual").onclick = () => {
      const selected = [];

      document.querySelectorAll("input[type=checkbox]:checked")
        .forEach(cb => selected.push(cb.value));

      if (selected.length === 0) {
        alert("Select at least one concept");
        return;
      }

      sessionStorage.setItem("selectedConcepts", JSON.stringify(selected));
      location.hash = `#test-${subject}`;
    };
  };

  /* ================= TYPE ================= */
  document.getElementById("typeCard").onclick = () => {
    popupContent.innerHTML = `
      <textarea id="syllabusText" placeholder="Paste syllabus..."></textarea>
      <br><br>
      <button id="analyzeBtn">Submit</button>

      <div id="matchedConcepts" class="matched-box"></div>
    `;

    popup.style.display = "flex";

    document.getElementById("analyzeBtn").onclick = () => {
      const text = document.getElementById("syllabusText")
        .value.toLowerCase()
        .replace(/-/g, " ");

      if (!text.trim()) {
        alert("Enter syllabus");
        return;
      }

      const matchedSet = new Set();

      questions.forEach(q => {
        if (!Array.isArray(q.concepts)) return;

        for (let c of q.concepts) {
          if (text.includes(c.toLowerCase())) {
            matchedSet.add(q.concepts[0]);
            break;
          }
        }
      });

      const matched = Array.from(matchedSet);

      const container = document.getElementById("matchedConcepts");

      if (matched.length === 0) {
        container.innerHTML = "<p>No matches found</p>";
        return;
      }

      let html = `<h4>Matched Concepts:</h4><ul>`;
      matched.forEach(c => html += `<li>${c}</li>`);
      html += `</ul>`;

      html += `<button id="generateTyped">Generate Test</button>`;

      container.innerHTML = html;

      document.getElementById("generateTyped").onclick = () => {
        sessionStorage.setItem("selectedConcepts", JSON.stringify(matched));
        location.hash = `#test-${subject}`;
      };
    };
  };
}