import { auth } from "./firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

window.addEventListener("hashchange", renderHome);
renderHome();

function renderHome() {
  if (location.hash && location.hash !== "#home") return;

  const app = document.getElementById("app");

  app.innerHTML = `
    <h2>Assessment Analysis System</h2>

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

   

    // Attach logout handler
    document.getElementById("logoutBtn").onclick = () => {
      signOut(auth);
      window.location.hash = "";
    };
}

