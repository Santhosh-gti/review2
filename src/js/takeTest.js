/* ===============================
   TAKE TEST PAGE
================================= */

window.addEventListener("hashchange", renderTakeTest);
renderTakeTest();

function renderTakeTest() {
  if (location.hash !== "#take-test") return;

  const app = document.getElementById("app");

  app.innerHTML = `
    <h2>Select Language</h2>

    <button onclick="location.hash='#concepts-C'">C</button><br><br>
    <button onclick="location.hash='#concepts-HTML'">HTML</button><br><br>
    <button onclick="location.hash='#concepts-CSS'">CSS</button><br><br>
    <button onclick="location.hash='#concepts-JavaScript'">JavaScript</button><br><br>
    <button onclick="location.hash='#concepts-MySQL'">MySQL</button><br><br>

    <button onclick="location.hash='#home'">Back</button>
  `;
}
