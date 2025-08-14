const API = "https://cazaofertas.onrender.com";

// Cargar productos en la página principal
function loadLinks() {
  fetch(`${API}/public-links`)
    .then(res => res.json())
    .then((links) => {
      const categoryFilter = document.getElementById("filterCategory").value.toLowerCase();
      const discountFilter = parseInt(document.getElementById("filterDiscount").value || "0");
      const container = document.getElementById("linksContainer");
      container.innerHTML = "";

      links
        .filter(link =>
          (!categoryFilter || link.category.toLowerCase().includes(categoryFilter)) &&
          link.discount >= discountFilter
        )
        .forEach((link) => {
          const card = document.createElement("div");
          card.className = "rounded-lg shadow-md border p-4 bg-white hover:shadow-lg transition duration-200";
          card.innerHTML = `
            <img src="${link.image || 'https://via.placeholder.com/150'}" alt="${link.title}" class="w-full h-auto mb-2 rounded">
            <h2 class="font-semibold text-lg mb-2">${link.title}</h2>
            <a href="${link.url}" target="_blank" class="text-blue-600 hover:underline">Ver producto</a>
            <p class="text-sm text-gray-600 mt-1">Categoría: ${link.category} | Descuento: ${link.discount}%</p>
          `;
          container.appendChild(card);
        });
    })
    .catch(err => {
      console.error("Error cargando productos:", err);
    });
}

// Ejecutar al cargar
window.onload = () => {
  loadLinks(); // Mostrar todos los productos al inicio
  document.querySelector("button[onclick='loadLinks()']").addEventListener("click", loadLinks);
};
