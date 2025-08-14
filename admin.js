const API = "https://cazaofertas.onrender.com";

// Login de administrador
function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        localStorage.setItem("adminLoggedIn", "true");
        document.getElementById("loginSection").style.display = "none";
        document.getElementById("adminSection").style.display = "block";
        loadSavedLinks();
      } else {
        alert("Credenciales incorrectas");
      }
    });
}

// Cerrar sesión
function logout() {
  localStorage.removeItem("adminLoggedIn");
  document.getElementById("adminSection").style.display = "none";
  document.getElementById("loginSection").style.display = "flex";
}

// Revisar sesión
function checkSession() {
  const isLogged = localStorage.getItem("adminLoggedIn") === "true";
  document.getElementById("loginSection").style.display = isLogged ? "none" : "flex";
  document.getElementById("adminSection").style.display = isLogged ? "block" : "none";
  if (isLogged) loadSavedLinks();
}

// Guardar producto manual
function saveManualProduct() {
  const title = document.getElementById("manualTitle").value.trim();
  let url = document.getElementById("manualUrl").value.trim();
  const category = document.getElementById("manualCategory").value.trim();
  const price = parseFloat(document.getElementById("manualPrice").value.trim()) || 0;
  const discount = parseInt(document.getElementById("manualDiscount").value.trim()) || 0;

  const asin = extractASIN(url) || "manual";
  const tag = "cazaoferta0e3-20";
  if (asin !== "manual") {
    url = `https://www.amazon.es/dp/${asin}?tag=${tag}`;
  }

  if (!title || !url || !category) {
    alert("Por favor completa todos los campos obligatorios.");
    return;
  }

  fetch(`${API}/save-link`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, url, category, discount, asin, price }),
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert("Producto guardado manualmente.");
        loadSavedLinks();
      } else {
        alert("Error al guardar.");
      }
    });
}

// Extraer ASIN de la URL
function extractASIN(url) {
  const asinMatch = url.match(/(?:dp|gp\/product)\/([A-Z0-9]{10})/);
  return asinMatch ? asinMatch[1] : null;
}

// Cargar productos guardados
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

// Eliminar producto
function deleteLink(id) {
  if (!confirm("¿Estás seguro de que deseas eliminar este producto?")) return;

  fetch(`${API}/delete-link/${id}`, { method: "DELETE" })
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

// Inicializar eventos
window.onload = () => {
  checkSession();
  document.getElementById("loginBtn")?.addEventListener("click", login);
  document.getElementById("manualImportBtn")?.addEventListener("click", saveManualProduct);
};
