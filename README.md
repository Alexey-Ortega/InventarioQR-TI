# 📦 TI Inventario

Sistema de gestión de inventario de TI y recursos empresariales. Permite llevar un control detallado de equipos, préstamos, empleados, movimientos de stock y generación de códigos QR para identificación rápida de activos.

## ✨ Características Principales

- **Dashboard:** Resumen en tiempo real del stock, alertas de ítems agotados y préstamos activos/vencidos.
- **Inventario:** Gestión de ítems por categoría, control de cantidades mínimas y seguimiento de números de serie y ubicaciones.
- **Préstamos:** Asignación temporal de equipos a empleados y control de fechas de devolución.
- **Empleados:** Directorio del personal e historial de equipos que tienen asignados.
- **Movimientos:** Registro detallado de entradas y salidas de stock.
- **Equipos de Cómputo:** Gestión específica del hardware, garantías, licenciamiento y características técnicas.
- **Recursos TI:** Control sobre infraestructura compartida como impresoras, redes WiFi, teléfonos, cámaras y licencias.
- **Códigos QR:** Generación de etiquetas QR para fácil identificación. Al escanearlos desde un dispositivo móvil, muestran una tarjeta informativa detallada de cada activo.
- **Soporte Multi-sucursal:** El proyecto soporta distintas "sucursales" o "branches" (ej. `main`, `alberta`, `salto`) y guarda los datos de manera independiente.

## 🛠️ Tecnologías Utilizadas

- **Frontend:** Vanilla JavaScript (ES6), HTML5, CSS3. (Arquitectura SPA sin frameworks externos).
- **Backend:** Node.js con Express.js.
- **Persistencia de Datos:** Lectura y escritura en archivos JSON (`data.json`, `data_alberta.json`, `data_salto.json`), respaldado por `localStorage` en el cliente.
- **Autenticación:** JWT simple generado con `crypto` (HMAC SHA-256).
- **Librerías Extra:** `ssh2` y `xlsx` (usadas para scripts de automatización y exportación).

## 📁 Estructura del Proyecto

```text
├── app.js               # Lógica principal del Frontend (SPA, Router, Vistas, LocalStorage)
├── index.html           # Punto de entrada de la aplicación
├── index.css            # Estilos principales de la interfaz web
├── server.js            # Servidor Backend (Express) y API REST
├── package.json         # Dependencias de Node.js y scripts
├── data.json            # Base de datos de la sucursal principal
├── data_alberta.json    # Base de datos de la sucursal Alberta
├── data_salto.json      # Base de datos de la sucursal Salto
├── deploy.mjs / *.mjs   # Scripts automáticos para despliegue y mantenimiento
└── logo.png             # Logo de la empresa
```

## 🚀 Instalación y Ejecución Local

1. **Clonar/Descargar** el proyecto en tu máquina local.
2. **Instalar las dependencias** de Node.js:
   ```bash
   npm install
   ```
3. **Iniciar el servidor** en modo desarrollo:
   ```bash
   npm run dev
   # o
   npm start
   ```
4. **Abrir en el navegador:**
   Visita `http://localhost:3001` (o el puerto configurado en las variables de entorno).

## 🔐 Autenticación y Acceso

El acceso al guardado de datos y paneles administrativos está protegido por un login de administrador. 

Los usuarios por defecto están configurados en el archivo `server.js` dentro del objeto `VALIDADMINS`:
- `admin.villa`
- `admin.pascual`
- `admin.alexei`
- `admin.alejandro`

*(Por seguridad, recuerda cambiar las contraseñas predeterminadas directamente en el código de producción)*.

## 📡 Endpoints de la API

* `GET /api/data`: Devuelve todos los datos del inventario (acepta el query `?branch=nombre_sucursal`).
* `POST /api/login`: Valida las credenciales y devuelve un Token de acceso.
* `POST /api/data`: Guarda los cambios del inventario (Requiere el Token de autorización en el Header).
* `GET /equipo/:id`: Muestra la ficha visual pública al escanear el QR de un equipo de cómputo.
* `GET /item/:id`: Muestra la ficha visual pública al escanear el QR de un ítem general.
* `GET /recurso/:type/:id`: Muestra la ficha visual de un recurso en particular.
