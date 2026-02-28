import { loginUser } from "./auth.js";
import { auth } from "./firebase.js";
import { sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

window.addEventListener("hashchange", renderLogin);
renderLogin();

function renderLogin() {
  if (location.hash !== "#login") return;

  const app = document.getElementById("app");

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
        justify-content: center;
        align-items: center;
      }

      .card {
        background: white;
        padding: 30px;
        width: 350px;
        border-radius: 12px;
        box-shadow: 0 6px 15px rgba(0,0,0,0.1);
      }

      h2 {
        text-align: center;
        margin-bottom: 20px;
      }

      input {
        width: 100%;
        padding: 10px;
        margin-bottom: 12px;
        border-radius: 8px;
        border: 1px solid #ccc;
      }

      button {
        width: 100%;
        padding: 12px;
        border: none;
        border-radius: 8px;
        background: #4a90e2;
        color: white;
        font-weight: bold;
        cursor: pointer;
      }

      .link {
        font-size: 14px;
        color: #4a90e2;
        cursor: pointer;
        text-align: right;
        display: block;
        margin-bottom: 15px;
      }

      .bottom-text {
        text-align: center;
        margin-top: 15px;
        font-size: 14px;
      }

      .bottom-text a {
        color: #4a90e2;
        text-decoration: none;
        font-weight: 500;
      }
    </style>

    <div class="page">

      <!-- HEADER -->
      <div class="header">
        CodeInsight
      </div>

      <!-- CONTENT -->
      <div class="content">
        <div class="card">
          <h2>Sign in</h2>

          <label>Username or Email</label>
          <input type="text" id="identifier">

          <label>Password</label>
          <input type="password" id="password">

          <span class="link" id="forgotPassword">
            Forgot password?
          </span>

          <button id="loginBtn">Sign in</button>

          <div class="bottom-text">
            New to CodeInsight?
            <a href="#signup">Create an account</a>
          </div>
        </div>
      </div>

      <!-- FOOTER -->
      <div class="footer">
        © 2026 CodeInsight • Built for students
      </div>

    </div>
  `;

  // LOGIN
  document.getElementById("loginBtn").onclick = async () => {
    const identifier = document.getElementById("identifier").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!identifier || !password) {
      alert("Please fill all fields");
      return;
    }

    try {
      await loginUser(identifier, password);
    } catch (err) {
      alert(err.message);
    }
  };

  // FORGOT PASSWORD
  document.getElementById("forgotPassword").onclick = async () => {
    const email = prompt("Enter your registered email:");

    if (!email) return;

    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent!");
    } catch (err) {
      alert(err.message);
    }
  };
}