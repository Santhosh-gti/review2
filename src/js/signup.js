import { signUpUser} from "./auth.js";

window.addEventListener("hashchange", renderSignup);
renderSignup();

function renderSignup() {
  if (location.hash !== "#signup") return;

  const app = document.getElementById("app");

  app.innerHTML = `
    <h2>Create your AA Account</h2>

    <div style="max-width:400px">

      <label>Email</label><br>
      <input type="email" id="email" style="width:100%"><br><br>

      <label>Password</label><br>
      <input type="password" id="password" style="width:100%"><br><br>

      <label>Username</label><br>
      <input type="text" id="username" style="width:100%"><br><br>

      <button id="signupBtn" style="width:100%">
        Create Account
      </button>

      <br><br>

      <p>
        Already have an account?
        <a href="#login">Sign in</a>
      </p>
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
