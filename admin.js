const API = "https://cazaofertas.onrender.com";
const AFFILIATE_TAG = "cazaoferta0e3-20"; // tu tag

// Utils
function extractASIN(url) {
  const m = (url || "").match(/(?:dp|gp\/product)\/([A-Z0-9]{10})/i);
  return m ? m[1] : null;
}
function makeAffiliateUrl(url, tag = AFFILIATE_TAG) {
  const asin = extractASIN(url);
  if (!asin) return url; // no tocamos si no hay ASIN
  // Fuerza URL corta con tag correcto
  return `https://www.amazon.es/dp/${asin}?tag=${encodeURIComponent(tag)}`;
}

// Auth
function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  fetch(`${API}/login`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
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
    })
    .catch(() => alert("Error de red en login"));
}

function logout() {
  localStorage.removeItem("adminLoggedIn");
  document.getElementById("adminSection").style.display = "none";
  document.getElementById("loginSection").style.display = "flex";
}

function checkSession() {
  const isLogged = localStorage.getItem("adminLoggedIn") === "true";
  document.getElementById("loginSection").style.display = isLogged ? "none" : "flex";
  document.getElementById("adminSection").style.display = isLogged ? "block" : "none";
  if (isLogged) loadSavedLinks();
}

// Importar por URL
function importFromAmazonUrl() {
  const url = document.getElementById("amazonUrl").value.trim();
  const asin = extractASIN(url);
  if (!asin) {
    document.getElementById("importResult").innerHTML =
      "<p class='text-red-500'>No se pudo extraer el ASIN de la URL.</p>";
    return;
  }

  const shortLink = makeAffiliateUrl(url);
  document.getElementById("importResult").innerHTML = `
    <p><strong>ASIN:</strong> ${asin}</p>
    <p><strong>Enlace de afiliado:</strong> 
      <a href="${shortLink}" class="text-blue-600 underline" target="_blank">${shortLink}</a>
    </p>
    <button id="saveImportedBtn" class="mt-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded">
      Guardar enlace
    </button>
  `;

  document.getElementById("saveImportedBtn").onclick = () => {
    const title = `Producto importado (${asin})`;
    const payload = { title, url: shortLink, category: "manual", discount: 0, asin, price: 0 };

    fetch(`${API}/save-link`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(payload),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert("Producto guardado correctamente.");
          document.getElementById("importResult").innerHTML = "";
          document.getElementById("amazonUrl").value = "";
          loadSavedLinks();
        } else {
          alert("Error al guardar.");
        }
      });
  };
}

// Guardado manual
function saveManualProduct() {
  const title = document.getElementById("manualTitle").value.trim();
  let url = document.getElementById("manualUrl").value.trim();
  const category = document.getElementById("manualCategory").value.trim();
  const price = parseFloat(document.getElementById("manualPrice").value.trim()) || 0;
  const discount = parseInt(document.getElementById("manualDiscount").value.trim()) || 0;

  if (!title || !url || !category) {
    alert("Por favor completa título, URL y categoría.");
    return;
  }

  // Si la URL es de Amazon con ASIN, normalizamos a tu enlace de afiliados
  const asin = extractASIN(url) || "manual";
  if (asin !== "manual") url = makeAffiliateUrl(url);

  const payload = { title, url, category, discount, asin, price };

  fetch(`${API}/save-link`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(payload),
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert("Producto guardado.");
        document.getElementById("manualTitle").value = "";
        document.getElementById("manualUrl").value = "";
        document.getElementById("manualCategory").value = "";
        document.getElementById("manualPrice").value = "";
        document.getElementById("manualDiscount").value = "";
        loadSavedLinks();
      } else {
        alert("Error al guardar.");
      }
    })
    .catch(() => alert("Error de red al guardar."));
}

// Listado y borrado
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
          <a href="${link.url}" target="_blank" class="text-blue-600 underline mb-2 block">Ver</a>
          <button data-id="${link.id}" class="del-btn bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded">Eliminar</button>
        `;
        container.appendChild(card);
      });

      // bind eliminar
      document.querySelectorAll(".del-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
          const id = e.currentTarget.getAttribute("data-id");
          if (!confirm("¿Eliminar este producto?")) return;
          fetch(`${API}/delete-link/${id}`, { method: "DELETE" })
            .then(res => res.json())
            .then(d => {
              if (d.success) {
                alert("Eliminado");
                loadSavedLinks();
              } else {
                alert("Error al eliminar");
              }
            });
        });
      });
    });
}

// Init
window.onload = () => {
  checkSession();
  document.getElementById("loginBtn")?.addEventListener("click", login);
  document.getElementById("logoutBtn")?.addEventListener("click", logout);
  document.getElementById("importBtn")?.addEventListener("click", importFromAmazonUrl);
  document.getElementById("manualSaveBtn")?.addEventListener("click", saveManualProduct);
};
