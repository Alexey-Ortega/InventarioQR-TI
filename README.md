# 📦 InventarioQR-TI (Versión Demo Pública)

Esta es una versión de demostración con datos ficticios y sin información sensible.  
No contiene datos reales de sucursales, empleados ni contraseñas de producción.

Para la versión completa/privada, contacta al autor.

Sistema de gestión de inventario de TI y recursos empresariales. Permite llevar un control detallado de equipos, préstamos, empleados, movimientos de stock y generación de códigos QR para identificación rápida de activos.

### 🎥 Demostración en Video
*(Reemplaza este texto con el enlace a tu video en YouTube o carga el GIF aquí)*
![Demo Video](ruta-a-tu-video-o-gif.gif)

### 📸 Capturas de Pantalla
*(Añade tus capturas aquí)*
| Dashboard | Inventario y QR |
| :---: | :---: |
| ![Dashboard](ruta-a-imagen-1.png) | ![QR](ruta-a-imagen-2.png) |

## ✨ Características Principales
- **Dashboard:** Resumen en tiempo real del stock, alertas de ítems agotados y préstamos activos/vencidos.
- **Inventario:** Gestión de ítems por categoría, control de cantidades mínimas y seguimiento de números de serie y ubicaciones.
- **Préstamos:** Asignación temporal de equipos a empleados y control de fechas de devolución.
- **Empleados:** Directorio del personal e historial de equipos que tienen asignados.
- **Equipos de Cómputo:** Gestión específica del hardware, garantías, licenciamiento y características.
- **Recursos TI:** Control sobre infraestructura como impresoras, redes WiFi, teléfonos, cámaras y licencias.
- **Códigos QR:** Generación de etiquetas QR para fácil identificación. Al escanearlos desde un dispositivo móvil muestran información valiosa.

## 🛠️ Tecnologías Utilizadas
- **Frontend:** Vanilla JavaScript (ES6), HTML5, CSS3. (Arquitectura SPA sin frameworks externos).
- **Backend:** Node.js con Express.js.
- **Autenticación:** JWT simple generado con `crypto` (HMAC SHA-256).

## 📁 Estructura del Proyecto

```text
├── app.js               # Lógica principal del Frontend (SPA, Router, Vistas, LocalStorage)
├── index.html           # Punto de entrada de la aplicación
├── index.css            # Estilos principales de la interfaz web
├── server.js            # Servidor Backend (Express) y API REST
└── package.json         # Dependencias de Node.js y scripts
```

## 🚀 Acceso a la Demo y Ejecución Local
Esta versión de demostración funciona de forma estática con datos pre-cargados al no tener bases de datos asignadas. 

**Para correrlo localmente:**
1. Clonar el repositorio.
2. `npm install`
3. `npm start`
4. Visita `http://localhost:3001`

**Credenciales de acceso de prueba:**
- **Usuario:** demo
- **Contraseña:** demo123
