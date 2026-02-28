import { auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { logoutUser } from "./auth.js";

/* ---------------- HASH LISTENER ---------------- */
window.addEventListener("hashchange", renderHome);
renderHome();

/* ---------------- RENDER HOME ---------------- */
function renderHome() {
  if (location.hash !== "#home") return;

  const app = document.getElementById("app");

  const name = sessionStorage.getItem("currentUsername") || "User";

  app.innerHTML = `
    <style>
      .page {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
      }

      .content {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }

      .welcome {
        font-size: 22px;
        margin-bottom: 30px;
      }

      .card-container {
        display: flex;
        gap: 20px;
        flex-wrap: wrap;
        justify-content: center;
      }

      .card {
        width: 220px;
        padding: 25px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 6px 15px rgba(0,0,0,0.1);
        text-align: center;
        cursor: pointer;
        transition: transform 0.2s ease;
      }

      .card:hover {
        transform: translateY(-5px);
      }

      .card h3 {
        margin-bottom: 10px;
      }

      .logout-btn {
        margin-top: 30px;
        padding: 10px 20px;
        border: none;
        border-radius: 8px;
        background: #e74c3c;
        color: white;
        cursor: pointer;
      }
    </style>

    <div class="page">

      <!-- HEADER -->
      <div class="header">
        CodeInsight
      </div>

      <!-- CONTENT -->
      <div class="content">

        <div class="welcome">Welcome, ${name}!</div>

        <div class="card-container">

          <div class="card" onclick="location.hash='#take-test'">
            <h3>Take Test</h3>
            <p>Practice coding concepts</p>
          </div>

          <div class="card" onclick="location.hash='#scores'">
            <h3>Previous Scores</h3>
            <p>View your performance</p>
          </div>

        </div>

        <button class="logout-btn" id="logoutBtn">
          Logout
        </button>

      </div>

      <!-- FOOTER -->
      <div class="footer">
        © 2026 CodeInsight • Built for students
      </div>

    </div>
  `;

  /* ---------- LOGOUT ---------- */
  document.getElementById("logoutBtn").onclick = logoutUser;
}

/* ---------------- AUTH PROTECTION ---------------- */
onAuthStateChanged(auth, (user) => {
  if (!user && location.hash === "#home") {
    location.hash = "#login";
  }
});