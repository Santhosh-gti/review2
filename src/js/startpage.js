window.addEventListener("hashchange", renderStartPage);
renderStartPage();

function renderStartPage() {
  if (location.hash && location.hash !== "#start") return;

  const app = document.getElementById("app");

  app.innerHTML = `
  <style>
    body {
      margin: 0;
      font-family: "Segoe UI", sans-serif;
      background: #f5f7fb;
    }

    /* HEADER */
    .header {
      text-align: center;
      padding: 20px;
      font-size: 28px;
      font-weight: bold;
      background: white;
      position: relative;
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    }

    /* HOVER DROPDOWN */
    .dropdown {
      display: none;
      position: absolute;
      top: 60px;
      left: 50%;
      transform: translateX(-50%);
      background: white;
      padding: 15px;
      width: 300px;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      font-size: 14px;
    }

    .header:hover .dropdown {
      display: block;
    }

    /* TAGLINE */
    .hero {
      text-align: center;
      margin-top: 40px;
    }

    .hero h1 {
      font-size: 32px;
      margin-bottom: 10px;
    }

    .hero p {
      color: #555;
      font-size: 16px;
    }

    .login-link {
      color: #4a90e2;
      cursor: pointer;
      font-weight: bold;
    }

    /* CARDS */
    .cards {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin: 40px;
      flex-wrap: wrap;
    }

    .card {
      background: white;
      padding: 20px;
      width: 180px;
      border-radius: 12px;
      text-align: center;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
      transition: transform 0.2s;
    }

    .card:hover {
      transform: translateY(-5px);
    }

    .card h3 {
      margin-bottom: 8px;
    }

    .card p {
      font-size: 13px;
      color: #666;
    }

    /* FOOTER */
    .footer {
      text-align: center;
      padding: 15px;
      background: white;
      margin-top: 40px;
      font-size: 14px;
      color: #777;
      box-shadow: 0 -2px 6px rgba(0,0,0,0.1);
    }
  </style>

  <!-- HEADER -->
  <div class="header">
    CodeInsight

    <div class="dropdown">
      <!-- YOU CAN EDIT THIS CONTENT -->
      <p>
        This application helps students revise programming concepts,
        practice logic-based questions, and get AI-powered insights and feedback.
      </p>
    </div>
  </div>

  <!-- HERO SECTION -->
  <div class="hero">
    <h1>Your last minute revision for code and logic</h1>
    <p>
      <span class="login-link" onclick="location.hash='#login'">
        Sign in
      </span>
      to start
    </p>
  </div>

  <!-- CARDS -->
  <div class="cards">
    <div class="card">
      <h3>HTML</h3>
      <p>The language for building web pages</p>
    </div>

    <div class="card">
      <h3>CSS</h3>
      <p>Styling and layout for web pages</p>
    </div>

    <div class="card">
      <h3>JavaScript</h3>
      <p>Logic and interactivity for web apps</p>
    </div>

    <div class="card">
      <h3>C</h3>
      <p>Core programming and problem solving</p>
    </div>

    <div class="card">
      <h3>SQL</h3>
      <p>A language for accessing databases</p>
    </div>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    © 2026 CodeInsight • Built for students
  </div>
  `;
}