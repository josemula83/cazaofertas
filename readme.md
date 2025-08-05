# CazaOfertas - Amazon Affiliate WebApp

**CazaOfertas** es una plataforma web desarrollada con Node.js y HTML/CSS/JS que permite buscar, filtrar y publicar productos de Amazon con enlaces de afiliado.

---

## 🚀 Características principales
- Conexión con la API de Amazon Product Advertising v5
- Búsqueda por categoría, palabra clave, descuentos, y estado Prime
- Publicación automática de enlaces afiliados
- Validación automática de productos (stock y precio)
- Panel privado de administración (con login)
- Visualización pública filtrable sin necesidad de registro

---

## 🧱 Estructura del proyecto
```
amazon-affiliate-webapp/
├── backend/
│   ├── server.js          → servidor Node.js con Express
│   ├── amazon.js          → conexión y consultas a la API de Amazon
│   ├── db.js              → base de datos SQLite3
│   └── .env               → credenciales locales (no subir)
├── frontend/
│   ├── index.html         → parte pública
│   ├── admin.html         → panel privado
│   ├── scripts.js         → lógica JS común
│   ├── logo-cazaofertas.png
│   ├── favicon.ico
│   └── logo-cazaofertas.svg
├── README.md              → este archivo
└── package.json
```

---

## ⚙️ Cómo ejecutar en local

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/amazon-affiliate-webapp.git
cd amazon-affiliate-webapp
```

### 2. Instalar dependencias del backend
```bash
cd backend
npm install
```

### 3. Crear el archivo `.env`
```
ADMIN_USER=admin
ADMIN_PASS=admin123
AWS_ACCESS_KEY_ID=xxxx
AWS_SECRET_ACCESS_KEY=xxxx
ASSOCIATE_TAG=midominio-20
```

### 4. Ejecutar el backend
```bash
node server.js
```

### 5. Abrir el frontend
Abre `frontend/index.html` y `frontend/admin.html` con Live Server o `npx serve`.

---

## 🌐 Despliegue

### Frontend con GitHub Pages
1. Mover archivos de `frontend/` a raíz si es necesario.
2. En **Settings → Pages**, seleccionar:
   - Branch: `main`
   - Carpeta: `/ (root)`
3. Accede en: `https://tu-usuario.github.io/amazon-affiliate-webapp`

### Backend con Render.com
1. Crear cuenta en [https://render.com](https://render.com)
2. Nuevo Web Service → conectar repo
3. Build command: `npm install`
4. Start command: `node server.js`
5. Añadir variables del `.env`

---

## 🔐 Acceso administrador
- URL: `/admin.html`
- Usuario: `admin`
- Contraseña: `admin123`

---

## 📦 Validación automática
- Se valida cada hora los productos guardados
- Se eliminan aquellos con precio cambiado o sin stock
- También puede ejecutarse manualmente desde el panel admin

---

## 📩 Contacto y aviso legal

Este proyecto es una demostración funcional sin fines comerciales. No está afiliado oficialmente con Amazon.

- Correo de contacto: contacto@cazaofertas.es
- Responsable del sitio: Jose Ferrandez Mula
- Este sitio participa en el programa de afiliados de Amazon. Los productos se muestran automáticamente y pueden incluir enlaces con código de afiliado.

---

## 🔒 Política de privacidad

Esta web no recopila ni almacena información personal de los usuarios visitantes. No se utilizan cookies ni se realiza seguimiento individualizado. Todos los productos se obtienen automáticamente a través de la API de Amazon y no implican la recopilación de datos sensibles.

- No se utiliza almacenamiento local ni base de datos del lado del usuario.
- La interacción con enlaces de Amazon se realiza de forma directa a su plataforma.
- Esta web no solicita registro, login, ni datos de contacto al visitante.

---

Este proyecto es una demostración funcional sin fines comerciales. No está afiliado oficialmente con Amazon.

- Correo de contacto: contacto@cazaofertas.es
- Responsable del sitio: Jose Ferrandez Mula
- Este sitio participa en el programa de afiliados de Amazon. Los productos se muestran automáticamente y pueden incluir enlaces con código de afiliado.

---

## ✨ Créditos
- Diseñado y desarrollado por Jose Ferrandez Mula
- Asistido por ChatGPT para generación estructural y diseño técnico

---
