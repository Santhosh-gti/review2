import { loginUser, resetPassword} from "./auth.js";

window.addEventListener("hashchange", renderLogin);
renderLogin();

function renderLogin() {
  if (location.hash !== "#login") return;

  const app = document.getElementById("app");

  app.innerHTML = `
    <h2>Sign in to AA System</h2>

    <div style="max-width:400px">

      <label>Username or Email</label><br>
      <input type="text" id="identifier" style="width:100%"><br><br>

      <label>Password</label>
      <input type="password" id="password" style="width:100%"><br><br>

      <div style="text-align:right">
      <a href="#" id="forgotPasswordLink">Forgot password?</a></div>
      <br>

      <button id="loginBtn" style="width:100%">
        Sign in
      </button>

      <br><br>

      <hr>

      <p>
        New to AA System?
        <a href="#signup">Create an account</a>
      </p>
    </div>
  `;

  /* --- LOGIN --- */
  document.getElementById("loginBtn").onclick = async () => {
    const identifier = document.getElementById("identifier").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!identifier || !password) {
      alert("Both fields are required");
      return;
    }

    try {
      await loginUser(identifier, password);
    } catch (err) {
      alert(err.message);
    }
  };

  /* --- FORGOT PASSWORD --- */
  document.getElementById("forgotPasswordLink").onclick = async () => {
    const identifier = document.getElementById("identifier").value.trim();

    if (!identifier) {
      alert("Please enter your email to reset password");
      return;
    }

    try {
      await resetPassword(identifier);
      alert("Password reset email sent. Please check your inbox.");
    } catch (err) {
      alert(err.message);
    }
  };
}
