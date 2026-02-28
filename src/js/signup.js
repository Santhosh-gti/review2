import { signUpUser } from "./auth.js";

window.addEventListener("hashchange", renderSignup);
renderSignup();

function renderSignup() {
  if (location.hash !== "#signup") return;

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
          <h2>Create Account</h2>

          <label>Email</label>
          <input type="email" id="email">

          <label>Password</label>
          <input type="password" id="password">

          <label>Username</label>
          <input type="text" id="username">

          <button id="signupBtn">
            Create Account
          </button>

          <div class="bottom-text">
            Already have an account?
            <a href="#login">Sign in</a>
          </div>
        </div>
      </div>

      <!-- FOOTER -->
      <div class="footer">
        © 2026 CodeInsight • Built for students
      </div>

    </div>
  `;

  document.getElementById("signupBtn").onclick = async () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const username = document.getElementById("username").value.trim();

    if (!email || !password || !username) {
      alert("All fields are required");
      return;
    }

    if (password.length < 6) {
      alert("Password should be at least 6 characters");
      return;
    }

    try {
      await signUpUser(email, password, username);
    } catch (err) {
      alert(err.message);
    }
  };
}