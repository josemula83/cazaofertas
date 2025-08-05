const API = "http://localhost:3000";

function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        localStorage.setItem("adminLoggedIn", "true");
        document.getElementById("loginSection").style.display = "none";
        document.getElementById("adminSection").style.display = "block";
        document.getElementById("logoutSection").style.display = "block";
      } else {
        alert("Login incorrecto");
      }
    });
}

function searchProducts() {
  const keyword = document.getElementById("keyword").value;
  const category = document.getElementById("category").value;
  const discount = document.getElementById("discountRange").value;
  const primeOnly = document.getElementById("primeOnly").value;

  fetch(`${API}/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ keyword, category, discount, primeOnly })
  })
    .then((res) => res.json())
    .then((products) => {
      const results = document.getElementById("results");
      results.innerHTML = "";
      products.forEach((p) => {
        const card = document.createElement("div");
        card.className = "rounded-lg shadow-md border p-4 bg-white hover:shadow-lg transition duration-200";
        card.innerHTML = `
          <img src='${p.image || "https://via.placeholder.com/150"}' alt='${p.title}' class='w-full h-auto mb-2 rounded'>
          <h2 class='font-semibold text-lg mb-2'>${p.title}</h2>
          <a href='${p.url}' target='_blank' class='text-blue-600 hover:underline'>Ver producto</a>
          <p class='text-sm text-gray-600 mt-1'>Categoría: ${p.category} | Descuento: ${p.discount}%</p>
          <p class='text-sm text-gray-500 mt-1'>Prime: ${p.prime ? "Sí" : "No"}</p>
          <button onclick='saveLink("${p.title}", "${p.url}", "${p.category}", ${p.discount}, "${p.asin}", ${p.price})' class='mt-3 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded'>Guardar</button>`;
        results.appendChild(card);
      });
    });
}

function saveLink(title, url, category, discount, asin, price) {
  fetch(`${API}/save-link`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, url, category, discount, asin, price }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) alert("Guardado");
    });
}

window.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.includes("index.html")) {
    fetch(`${API}/validate-links`, { method: "POST" })
      .then((res) => res.json())
      .then((data) => {
        console.log(`Validación automática: ${data.removed} productos eliminados por falta de stock o cambio de precio.`);
      });
  }
});

function validateStoredLinks() {
  fetch(`${API}/validate-links`, { method: "POST" })
    .then((res) => res.json())
    .then((data) => {
      alert(`Validación completada. Se eliminaron ${data.removed} productos no disponibles.`);
    });
}

