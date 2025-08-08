# 🛍️ CazaOfertas – Web de afiliados Amazon

**CazaOfertas** es una plataforma web para promocionar productos de Amazon con descuentos, clasificados por categoría y con enlaces de afiliados. Incluye un panel de administración privado para gestionar manualmente los productos y un frontend público limpio y responsive.

---

## 🔧 Tecnologías utilizadas

- **Frontend**: HTML + TailwindCSS + JavaScript Vanilla
- **Backend**: Node.js con Express
- **Base de datos**: SQLite
- **API**: Amazon Product Advertising API (manual por ahora)
- **Hosting Frontend**: GitHub Pages
- **Hosting Backend**: Render (auto-ping incluido)

---

## 🧪 Requisitos

- Node.js v18+
- Git
- Cuenta de Amazon Afiliados
- Archivo `.env` con usuario y contraseña:

```env
ADMIN_USER=admin
ADMIN_PASS=1234

.
├── backend/
│   ├── server.js
│   ├── db.js
│   ├── amazon.js
│   └── .env
├── frontend/
│   ├── index.html
│   ├── admin.html
│   ├── scripts.js
│   └── logo-cazaofertas.svg/png
└── README.md
🔐 Panel de administración (admin.html)
Disponible desde el botón en la web principal.

Funcionalidades:
Login (usuario desde .env)

Búsqueda de productos por palabra clave, categoría, Prime, descuento.

Importar desde URL de Amazon (ASIN).

Añadir producto manualmente: título, URL, categoría, precio, descuento.

Ver todos los productos guardados.

Eliminar productos con un clic.

🛠️ Rutas del servidor
Método	Ruta	Descripción
POST	/login	Autenticación básica por usuario y password
POST	/save-link	Guarda un nuevo producto
GET	/admin-links	Lista todos los productos guardados
DELETE	/delete-link/:id	Elimina un producto por ID
GET	/	Comprobación de salud del servidor

🔁 Auto-ping Render
Para evitar que Render suspenda el servidor tras 15 minutos de inactividad, se incluye un setInterval() que hace peticiones cada 5 minutos a https://cazaofertas.onrender.com.

🚀 Despliegue
Frontend
Subir carpeta frontend/ a un repositorio GitHub

Activar GitHub Pages desde la configuración del repositorio

Elegir carpeta main > root

Backend
Subir carpeta backend/ a un repositorio separado (o mismo si está limpio)

Crear cuenta en https://render.com

Nuevo servicio web (Node.js) → conectar GitHub

Definir build command:
🔐 Panel de administración (admin.html)
Disponible desde el botón en la web principal.

Funcionalidades:
Login (usuario desde .env)

Búsqueda de productos por palabra clave, categoría, Prime, descuento.

Importar desde URL de Amazon (ASIN).

Añadir producto manualmente: título, URL, categoría, precio, descuento.

Ver todos los productos guardados.

Eliminar productos con un clic.

🛠️ Rutas del servidor
Método	Ruta	Descripción
POST	/login	Autenticación básica por usuario y password
POST	/save-link	Guarda un nuevo producto
GET	/admin-links	Lista todos los productos guardados
DELETE	/delete-link/:id	Elimina un producto por ID
GET	/	Comprobación de salud del servidor

🔁 Auto-ping Render
Para evitar que Render suspenda el servidor tras 15 minutos de inactividad, se incluye un setInterval() que hace peticiones cada 5 minutos a https://cazaofertas.onrender.com.

🚀 Despliegue
Frontend
Subir carpeta frontend/ a un repositorio GitHub

Activar GitHub Pages desde la configuración del repositorio

Elegir carpeta main > root

Backend
Subir carpeta backend/ a un repositorio separado (o mismo si está limpio)

Crear cuenta en https://render.com

Nuevo servicio web (Node.js) → conectar GitHub

Definir build command:
Definir start command:
node server.js
 Enlace de afiliado
Para cada producto, se genera el enlace con tu código de afiliado en este formato:

arduino
Copiar
Editar
https://www.amazon.es/dp/ASIN?tag=TU-CODIGO
📬 Contacto
Desarrollado por: Jose Antonio Ferrandez Mula
Repositorio: https://github.com/josemula83/cazaofertas