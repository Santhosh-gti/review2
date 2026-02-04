import { auth } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const appDiv = document.getElementById("app");

function showLogin() {
  appDiv.innerHTML = `
    <h2>Login</h2>
    <input id="emailInput" placeholder="Email"><br>
    <input id="passwordInput" type="password" placeholder="Password"><br><br>
    <button id="loginBtn">Login</button>
    <button id="signupBtn">Signup</button>
  `;

  document.getElementById("loginBtn").onclick = handleLogin;
  document.getElementById("signupBtn").onclick = handleSignup;
}

function handleLogin() {
  const email = document.getElementById("emailInput").value;
  const password = document.getElementById("passwordInput").value;

  signInWithEmailAndPassword(auth, email, password)
    .catch(err => alert(err.message));
}

function handleSignup() {
  const email = document.getElementById("emailInput").value;
  const password = document.getElementById("passwordInput").value;

  createUserWithEmailAndPassword(auth, email, password)
    .catch(err => alert(err.message));
}

onAuthStateChanged(auth, user => {
  if (user) {
    window.location.hash = "#home";
  } else {
    showLogin();
  }
});
