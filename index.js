// index.js
const APIS = [
  "https://cazaofertas.onrender.com",        // pon aquí tu backend si REALMENTE sirve /public-links
  "https://cazaofertas-backend.onrender.com" // fallback
];

// helper: intenta cada API hasta obtener JSON válido
async function apiFetch(path, options = {}) {
  let lastErr;
  for (const base of APIS) {
    try {
      const res = await fetch(`${base}${path}`, options);
      // debe devolver 2xx y JSON
      const ct = res.headers.get("content-type") || "";
      if (!res.ok) throw new Error(`HTTP ${res.status} en ${base}${path}`);
      if (!ct.includes("application/json")) throw new Error(`No-JSON desde ${base}${path}`);
      return await res.json();
    } catch (e) {
      lastErr = e;
      // intenta siguiente base
    }
  }
  throw lastErr || new Error("No hay API disponible");
}

function renderLinks(links) {
  const categoryFilter = (document.getElementById("filterCategory")?.value || "").toLowerCase();
  const discountFilter = parseInt(document.getElementById("filterDiscount")?.value || "0", 10) || 0;
  const container = document.getElementById("linksContainer");
  container.innerHTML = "";

  links
    .filter(l =>
      (!categoryFilter || (l.category || "").toLowerCase().includes(categoryFilter)) &&
      (parseInt(l.discount || 0, 10) >= discountFilter)
    )
    .forEach(link => {
      const card = document.createElement("div");
      card.className = "rounded-lg shadow-md border p-4 bg-white hover:shadow-lg transition duration-200";
      card.innerHTML = `
        <img src="${link.image || 'https://via.placeholder.com/300x200?text=Producto'}" alt="${link.title}" class="w-full h-auto mb-2 rounded">
        <h2 class="font-semibold text-lg mb-2">${link.title}</h2>
        <a href="${link.url}" target="_blank" rel="nofollow sponsored" class="text-blue-600 hover:underline">Ver producto</a>
        <p class="text-sm text-gray-600 mt-1">Categoría: ${link.category || '-'} | Descuento: ${link.discount || 0}%</p>
      `;
      container.appendChild(card);
    });
}

async function loadLinks() {
  try {
    const links = await apiFetch("/public-links");
    renderLinks(links);
  } catch (err) {
    console.error("Error cargando productos:", err);
    const container = document.getElementById("linksContainer");
    container.innerHTML = `
      <div class="col-span-full bg-red-50 border border-red-200 text-red-700 p-4 rounded">
        No se pudieron cargar los productos. Revisa la URL de la API.
      </div>`;
  }
}

window.onload = () => {
  // 1) Cargar TODOS al inicio
  loadLinks();

  // 2) Permitir filtrar
  document.querySelector('button[onclick="loadLinks()"]')?.addEventListener("click", (e) => {
    e.preventDefault();
    loadLinks();
  });
};
