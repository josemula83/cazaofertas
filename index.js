// index.js

// Helper de red con fallback
const api = typeof window !== "undefined" && typeof window.apiFetch === "function"
  ? window.apiFetch
  : async function api(path, options = {}) {
      const res = await fetch(path, options);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    };

async function loadCategories() {
  try {
    const cats = await api("/categories");
    const sel = document.getElementById("filterCategory");
    sel.innerHTML = `<option value="">Todas las categorías</option>` +
      cats.map(c => `<option value="${c}">${c}</option>`).join("");
  } catch (e) {
    console.error("Error cargando categorías:", e);
  }
}

async function fetchLinks() {
  // Ajusta la ruta si tu backend sirve en prefijo (p. ej., /api/public-links)
  return api("/public-links");
}

function renderLinks(links) {
  const category = document.getElementById("filterCategory")?.value || "";
  const discountMin = parseInt(document.getElementById("filterDiscount")?.value || "0", 10) || 0;
  const container = document.getElementById("linksContainer");
  const info = document.getElementById("resultsInfo");

  const filtered = links.filter(l =>
    (!category || (l.category || "") === category) &&
    (parseInt(l.discount || 0, 10) >= discountMin)
  );

  info.textContent = `${filtered.length} resultado${filtered.length === 1 ? "" : "s"}` +
    (category ? ` en “${category}”` : "") +
    (discountMin ? ` con ≥ ${discountMin}% de descuento` : "");

  container.innerHTML = "";
  filtered.forEach(link => {
    const card = document.createElement("div");
    card.className = "rounded-lg shadow-md border p-4 bg-white hover:shadow-lg transition duration-200";

    const img = link.image || "https://via.placeholder.com/300x300?text=Producto";
    const title = link.title || "Producto";
    const url = link.url || "#";
    const categoryText = link.category || "-";
    const discount = parseInt(link.discount || 0, 10) || 0;

    card.innerHTML = `
      <img src="${img}" alt="${title}" class="w-full h-auto mb-2 rounded">
      <h2 class="font-semibold text-lg mb-2">${title}</h2>
      <a href="${url}" target="_blank" rel="nofollow sponsored" class="text-blue-600 hover:underline">Ver producto</a>
      <p class="text-sm text-gray-600 mt-1">Categoría: ${categoryText} | Descuento: ${discount}%</p>
    `;

    container.appendChild(card);
  });
}

async function loadAll() {
  try {
    const [_, links] = await Promise.all([
      loadCategories(),
      fetchLinks(),
    ]);
    renderLinks(links);
  } catch (e) {
    console.error("Error cargando datos:", e);
  }
}

// Listeners
window.addEventListener("load", () => {
  loadAll();

  document.getElementById("filterBtn")?.addEventListener("click", (e) => {
    e.preventDefault();
    fetchLinks().then(renderLinks);
  });

  document.getElementById("filterCategory")?.addEventListener("change", () => {
    fetchLinks().then(renderLinks);
  });

  document.getElementById("filterDiscount")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      fetchLinks().then(renderLinks);
    }
  });
});