const API = "https://cazaofertas.onrender.com";

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

function extractASIN(url) {
  const asinMatch = url.match(/(?:dp|gp\/product)\/([A-Z0-9]{10})/);
  return asinMatch ? asinMatch[1] : null;
}

function importFromAmazonUrl() {
  const url = document.getElementById("amazonUrl").value.trim();
  const asin = extractASIN(url);
  const tag = "cazaofertas-20"; // 🔁 Sustituye por tu tag real

  if (!asin) {
    document.getElementById("importResult").innerHTML = "<p class='text-red-500'>No se pudo extraer el ASIN de la URL.</p>";
    return;
  }

  const shortLink = `https://www.amazon.es/dp/${asin}?tag=${tag}`;
  document.getElementById("importResult").innerHTML = `
    <p><strong>ASIN:</strong> ${asin}</p>
    <p><strong>Enlace de afiliado:</strong> <a href="${shortLink}" class="text-blue-600 underline" target="_blank">${shortLink}</a></p>
    <button onclick="saveImportedLink('${asin}', '${shortLink}')" class="mt-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded">Guardar enlace</button>
  `;
}

function saveImportedLink(asin, url) {
  const title = `Producto importado (${asin})`;
  const category = "manual";
  const discount = 0;
  const price = 0;

  fetch(`${API}/save-link`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, url, category, discount, asin, price })
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        alert("Producto guardado correctamente.");
        document.getElementById("importResult").innerHTML = "";
        document.getElementById("amazonUrl").value = "";
      } else {
        alert("Error al guardar.");
      }
    });
}
