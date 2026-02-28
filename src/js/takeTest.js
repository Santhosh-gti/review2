/* ===============================
   TAKE TEST PAGE
================================= */

window.addEventListener("hashchange", renderTakeTest);
renderTakeTest();

function renderTakeTest() {
  if (location.hash !== "#take-test") return;

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
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }

      .title {
        font-size: 24px;
        margin-bottom: 30px;
        margin-top: 20px;
      }

      .card-container {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
        justify-content: center;
        max-width: 900px;
      }

      .card {
        width: 200px;
        padding: 20px;
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

      .card p {
        font-size: 14px;
        color: #555;
      }

      .back-btn {
        margin-top: 30px;
        margin-bottom: 20px;
        padding: 10px 20px;
        border: none;
        border-radius: 8px;
        background: #555;
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

        <div class="title">Select Language</div>

        <div class="card-container">

          <div class="card" onclick="location.hash='#concepts-HTML'">
            <h3>HTML</h3>
            <p>The language for building web pages</p>
          </div>

          <div class="card" onclick="location.hash='#concepts-CSS'">
            <h3>CSS</h3>
            <p>Style and design your web pages</p>
          </div>

          <div class="card" onclick="location.hash='#concepts-JavaScript'">
            <h3>JavaScript</h3>
            <p>Make web pages interactive</p>
          </div>

          <div class="card" onclick="location.hash='#concepts-C'">
            <h3>C</h3>
            <p>Foundation of programming logic</p>
          </div>

          <div class="card" onclick="location.hash='#concepts-MySQL'">
            <h3>MySQL</h3>
            <p>Manage and query databases</p>
          </div>

        </div>

        <button class="back-btn" onclick="location.hash='#home'">
          Back
        </button>

      </div>

      <!-- FOOTER -->
      <div class="footer">
        © 2026 CodeInsight • Built for students
      </div>

    </div>
  `;
}