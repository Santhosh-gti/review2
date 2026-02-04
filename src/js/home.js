import { auth } from "./firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

window.addEventListener("hashchange", render);
render();

function render() {
  const app = document.getElementById("app");

  if (location.hash === "#home") {

    app.innerHTML = `
      <h2>Welcome</h2>

      <div class="subjects">
        <button data-subject="C">C</button>
        <button data-subject="HTML">HTML</button>
        <button data-subject="CSS">CSS</button>
        <button data-subject="JavaScript">JavaScript</button>
        <button data-subject="MySQL">MySQL</button>
      </div>

      <br><br>
      <button id="logoutBtn">Logout</button>
    `;

    // Attach subject navigation AFTER HTML is rendered
    document.querySelectorAll(".subjects button").forEach(btn => {
      btn.onclick = () => {
        const subject = btn.dataset.subject;
        window.location.hash = `#test-${subject}`;
      };
    });

    // Attach logout handler
    document.getElementById("logoutBtn").onclick = () => {
      signOut(auth);
      window.location.hash = "";
    };
  }
}
