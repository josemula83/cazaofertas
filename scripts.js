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
        loadSavedLinks();
      } else {
        alert("Login incorrecto");
      }
    });
}

function logout() {
  localStorage.removeItem("adminLoggedIn");
  document.getElementById("adminSection").style.display = "none";
  document.getElementById("logoutSection").style.display = "none";
  document.getElementById("loginSection").style.display = "flex";
}

function checkSession() {
  const isLogged = localStorage.getItem("adminLoggedIn") === "true";
  document.getElementById("loginSection").style.display = isLogged ? "none" : "flex";
  document.getElementById("adminSection").style.display = isLogged ? "block" : "none";
  document.getElementById("logoutSection").style.display = isLogged ? "block" : "none";
  if (isLogged) loadSavedLinks();
}

function searchProducts() {
  const keyword = document.getElementById("keyword").value;
  const category = document.getElementById("category").value;
  const discount = document.getElementById("discountRange").value;
  const primeOnly = document.getElementById("primeOnly").value;

  fetch(`${API}/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ keyword, category, discount, primeOnly }),
  })
    .then((res) => res.json())
    .then((products) => {
      const results = document.getElementById("results");
      results.innerHTML = "";
      products.forEach((p) => {
        const card = document.createElement("div");
        card.className = "rounded-lg shadow-md border p-4 bg-white";
        card.innerHTML = `
          <h2 class='font-semibold text-lg mb-2'>${p.title}</h2>
          <a href='${p.url}' target='_blank' class='text-blue-600 hover:underline'>Ver producto</a>
          <p class='text-sm text-gray-600 mt-1'>Categoría: ${p.category} | Descuento: ${p.discount}%</p>
          <button onclick='saveLink("${p.title}", "${p.url}", "${p.category}", ${p.discount}, "${p.asin}", ${p.price})' class='mt-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded'>Guardar</button>
        `;
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

function extractASIN(url) {
  const asinMatch = url.match(/(?:dp|gp\/product)\/([A-Z0-9]{10})/);
  return asinMatch ? asinMatch[1] : null;
}

function importFromAmazonUrl() {
  const url = document.getElementById("amazonUrl").value.trim();
  const asin = extractASIN(url);
  const tag = "cazaoferta0e3-20";

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
    body: JSON.stringify({ title, url, category, discount, asin, price }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        alert("Producto guardado correctamente.");
        document.getElementById("importResult").innerHTML = "";
        document.getElementById("amazonUrl").value = "";
        loadSavedLinks();
      } else {
        alert("Error al guardar.");
      }
    });
}

function saveManualProduct() {
  const title = document.getElementById("manualTitle").value.trim();
  //const url = document.getElementById("manualUrl").value.trim();

  let url = document.getElementById("manualUrl").value.trim();
  const asin = extractASIN(url) || "manual";
  const tag = "cazaoferta0e3-20";

  if (asin !== "manual") {
    url = `https://www.amazon.es/dp/${asin}?tag=${tag}`;
  }





  const category = document.getElementById("manualCategory").value.trim();
  const price = parseFloat(document.getElementById("manualPrice").value.trim()) || 0;
  const discount = parseInt(document.getElementById("manualDiscount").value.trim()) || 0;
  //const asin = extractASIN(url) || "manual";

  if (!title || !url || !category) {
    alert("Por favor completa todos los campos obligatorios.");
    return;
  }

  fetch(`${API}/save-link`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, url, category, discount, asin, price }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        alert("Producto guardado manualmente.");
        loadSavedLinks();
      } else {
        alert("Error al guardar.");
      }
    });
}

function loadSavedLinks() {
  fetch(`${API}/admin-links`)
    .then(res => res.json())
    .then((links) => {
      const container = document.getElementById("savedLinks");
      container.innerHTML = "";

      links.forEach((link) => {
        const card = document.createElement("div");
        card.className = "rounded-lg shadow-md border p-4 bg-white";
        card.innerHTML = `
          <h3 class="font-semibold text-lg mb-1">${link.title}</h3>
          <p class="text-sm text-gray-600 mb-2">Categoría: ${link.category} | Descuento: ${link.discount}% | Precio: ${link.price}€</p>
          <a href="${link.url}" target="_blank" class="text-blue-600 underline mb-2 block">Ver en Amazon</a>
          <button onclick="deleteLink(${link.id})" class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded">Eliminar</button>
        `;
        container.appendChild(card);
      });
    });
}

function deleteLink(id) {
  if (!confirm("¿Estás seguro de que deseas eliminar este producto?")) return;

  fetch(`${API}/delete-link/${id}`, {
    method: "DELETE"
  })
    .then(res => res.json())
    .then((data) => {
      if (data.success) {
        alert("Producto eliminado");
        loadSavedLinks();
      } else {
        alert("Error al eliminar");
      }
    });
}

// Exponer funciones globalmente para asegurar su disponibilidad
window.login = login;
window.logout = logout;
window.searchProducts = searchProducts;
window.saveManualProduct = saveManualProduct;

// Ejecutar al cargar
window.onload = () => {
  checkSession();
  document.getElementById("loginBtn")?.addEventListener("click", login);
  document.getElementById("searchBtn")?.addEventListener("click", searchProducts);
  document.getElementById("manualImportBtn")?.addEventListener("click", saveManualProduct);
  loadLinks();
};
