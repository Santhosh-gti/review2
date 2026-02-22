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
    <h2>Assessment Analysis System</h2>

    <h3>Welcome, ${name}!</h3>

    <div style="margin-top:30px">
      <button onclick="location.hash='#take-test'">
        Take Test
      </button>
    </div>

    <div style="margin-top:20px">
      <button onclick="location.hash='#scores'">
        View Previous Scores
      </button>
    </div>

    <br><br>

    <button id="logoutBtn">Logout</button>
  `;

  /* ---------- LOGOUT ---------- */
  document.getElementById("logoutBtn").onclick = logoutUser;
}

/* ---------------- AUTH PROTECTION ---------------- */
/* Prevent accessing home if not logged in */
onAuthStateChanged(auth, (user) => {
  if (!user && location.hash === "#home") {
    location.hash = "#login";
  }
});
