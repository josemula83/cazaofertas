// ========== CONFIG ==========
const API = "https://cazaofertas.onrender.com"; // tu backend
const PAGE_SIZE = 12;

// Estado de la página
let currentPage = 1;
let totalPages = 1;
let currentFilters = { category: "", minDiscount: 0, sort: "discount_desc" };

// Helper fetch con control de errores HTTP
async function apiFetch(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} en ${url}`);
  return res.json();
}

// Cargar categorías y pintar el select
async function loadCategories() {
  try {
    const data = await apiFetch(`${API}/categories`);
    const select = document.getElementById("filterCategorySelect");
    // Limpia dejando "Todas"
    select.innerHTML = `<option value="">Todas las categorías</option>`;
    (data.categories || []).forEach(cat => {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat;
      select.appendChild(opt);
    });
  } catch (e) {
    console.error("Error cargando categorías:", e);
    // Deja solo "Todas" si falla
  }
}

// Cargar links de la página actual con filtros
async function loadLinks(page = 1) {
  try {
    currentPage = page;

    const params = new URLSearchParams({
      page: String(currentPage),
      limit: String(PAGE_SIZE),
      sort: currentFilters.sort || "discount_desc",
    });

    if (currentFilters.category) params.set("category", currentFilters.category);
    if (currentFilters.minDiscount && Number(currentFilters.minDiscount) > 0) {
      params.set("minDiscount", String(currentFilters.minDiscount));
    }

    const data = await apiFetch(`${API}/public-links?${params.toString()}`);
    const { data: items, totalPages: tp } = data;

    totalPages = tp || 1;
    renderCards(items);
    renderPagination();
  } catch (err) {
    console.error("Error cargando productos:", err);
    document.getElementById("linksContainer").innerHTML = `
      <div class="col-span-full text-center text-red-600">
        Error al cargar productos.
      </div>`;
    document.getElementById("pagination").innerHTML = "";
  }
}

// Pintar tarjetas
function renderCards(items = []) {
  const container = document.getElementById("linksContainer");
  container.innerHTML = "";

  if (!items.length) {
    container.innerHTML = `
      <div class="col-span-full text-center text-gray-600">
        No hay productos para mostrar.
      </div>`;
    return;
  }

  items.forEach((link) => {
    const card = document.createElement("div");
    card.className = "rounded-lg shadow-md border p-4 bg-white hover:shadow-lg transition duration-200";
    card.innerHTML = `
      <img src="${link.image || "https://via.placeholder.com/150"}" alt="${escapeHtml(
      link.title || ""
    )}" class="w-full h-auto mb-2 rounded">
      <h2 class="font-semibold text-lg mb-2">${escapeHtml(link.title || "")}</h2>
      <a href="${link.url}" target="_blank" class="text-blue-600 hover:underline">Ver producto</a>
      <p class="text-sm text-gray-600 mt-1">
        Categoría: ${escapeHtml(link.category || "-")} | Descuento: ${Number(link.discount || 0)}%
      </p>
      <p class="text-sm text-gray-500 mt-1">Precio: ${Number(link.price || 0)}€</p>
    `;
    container.appendChild(card);
  });
}

// Paginación (Prev / Página X de Y / Next)
function renderPagination() {
  const box = document.getElementById("pagination");
  box.innerHTML = "";

  const prevBtn = document.createElement("button");
  prevBtn.textContent = "« Anterior";
  prevBtn.className =
    "px-4 py-2 rounded border bg-white hover:bg-gray-100 disabled:opacity-50";
  prevBtn.disabled = currentPage <= 1;
  prevBtn.onclick = () => goToPage(currentPage - 1);

  const info = document.createElement("span");
  info.textContent = `Página ${currentPage} de ${totalPages}`;
  info.className = "text-sm text-gray-700";

  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Siguiente »";
  nextBtn.className =
    "px-4 py-2 rounded border bg-white hover:bg-gray-100 disabled:opacity-50";
  nextBtn.disabled = currentPage >= totalPages;
  nextBtn.onclick = () => goToPage(currentPage + 1);

  box.appendChild(prevBtn);
  box.appendChild(info);
  box.appendChild(nextBtn);
}

function goToPage(p) {
  if (p < 1 || p > totalPages) return;
  loadLinks(p);
}

// Leer filtros y recargar a página 1
function applyFilters() {
  const category = document.getElementById("filterCategorySelect").value || "";
  const disc = parseInt(document.getElementById("filterDiscount").value || "0", 10) || 0;
  const sort = document.getElementById("sortBy").value || "discount_desc";

  currentFilters = { category, minDiscount: disc, sort };
  loadLinks(1);
}

// Sencillo escape de HTML en textos visibles
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Inicial
window.onload = async () => {
  await loadCategories();
  loadLinks(1);
};
