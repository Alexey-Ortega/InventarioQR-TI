/**
 * TI Inventario — servidor Express
 * Sirve los archivos estáticos y expone /api/data para persistencia
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Seguridad y Autenticación ──────────────────────────────
const TOKEN_SECRET = process.env.TOKEN_SECRET || 'CH4_INVENTARIO_SECURE_KEY_2024';

const VALIDADMINS = {
  'admin': 'admin123',
  'demo': 'demo123'
};

function generateToken(user) {
  const hash = crypto.createHmac('sha256', TOKEN_SECRET).update(user).digest('hex');
  return `${user}:${hash}`;
}

function verifyToken(token) {
  if (!token) return false;
  const lastColon = token.lastIndexOf(':');
  if (lastColon === -1) return false;
  const user = token.substring(0, lastColon);
  const hash = token.substring(lastColon + 1);
  if (!user || !hash) return false;
  const expectedHash = crypto.createHmac('sha256', TOKEN_SECRET).update(user).digest('hex');
  return hash === expectedHash;
}

// ── Middlewares ──────────────────────────────────────────────
app.use(express.json({ limit: '5mb' }));
app.use(express.static(__dirname));   // sirve index.html, index.css, app.js

// ── Helper ───────────────────────────────────────────────────
function loadData(branch) {
  let file = 'data.json';
  if (branch === 'alberta') file = 'data_alberta.json';
  if (branch === 'salto') file = 'data_salto.json';
  const filePath = path.join(__dirname, file);
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (e) {
    console.error(`Error leyendo ${file}:`, e.message);
  }
  return null;  // null = el cliente usa sus datos por defecto
}

function saveData(data, branch) {
  let file = 'data.json';
  if (branch === 'alberta') file = 'data_alberta.json';
  if (branch === 'salto') file = 'data_salto.json';
  const filePath = path.join(__dirname, file);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// ── API ───────────────────────────────────────────────────────

// GET /api/data — carga todos los datos
app.get('/api/data', (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.set('Pragma', 'no-cache');
  const branch = req.query.branch || 'main';
  const data = loadData(branch);
  res.json({ ok: true, data });   // data puede ser null (primera vez)
});

// POST /api/login — valida credenciales y devuelve un token
app.post('/api/login', (req, res) => {
  const { user, pass } = req.body;
  if (!user || !pass) {
    return res.status(400).json({ ok: false, error: 'Credenciales incompletas' });
  }

  if (VALIDADMINS[user] && VALIDADMINS[user] === pass) {
    const token = generateToken(user);
    res.json({ ok: true, token, user });
  } else {
    res.status(401).json({ ok: false, error: 'Usuario o contraseña incorrectos' });
  }
});

// POST /api/data — guarda todos los datos (Requiere Token)
app.post('/api/data', (req, res) => {
  try {
    // Validar autenticación
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!verifyToken(token)) {
      return res.status(401).json({ ok: false, error: 'Acceso denegado o sesión expirada' });
    }

    const data = req.body;
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ ok: false, error: 'Payload inválido' });
    }
    const branch = req.query.branch || 'main';
    saveData(data, branch);
    res.json({ ok: true });
  } catch (e) {
    console.error('Error guardando:', e.message);
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ── Tarjeta visual para Equipos de Cómputo (QR scan) ─────────
app.get('/equipo/:id', (req, res) => {
  const branch = req.query.branch || 'main';
  const db = loadData(branch);
  const comp = db && db.computers && db.computers.find(c => c.id === req.params.id);
  if (!comp) return res.status(404).send('<h2 style="font-family:sans-serif;padding:2rem">Equipo no encontrado</h2>');

  const esc = s => (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const row = (icon, label, val) => val && val !== '-' && val !== 'N/A' && val !== 'NA'
    ? `<div class="row"><div class="lbl">${icon} ${label}</div><div class="val">${esc(val)}</div></div>` : '';

  const statusCls = { ACTIVO: 'green', BAJA: 'red', PERDIDO: 'orange', ROBADA: 'red' };
  const stCls = statusCls[comp.estado] || 'gray';

  res.send(`<!DOCTYPE html><html lang="es"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(comp.hostname || comp.serie)}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:system-ui,-apple-system,Arial,sans-serif;background:#0d1117;color:#e6edf3;min-height:100vh;padding:16px;display:flex;align-items:flex-start;justify-content:center}
  .card{background:#161b22;border:1px solid #30363d;border-radius:16px;padding:20px;max-width:400px;width:100%;box-shadow:0 8px 32px rgba(0,0,0,.6);margin:12px 0}
  .header{display:flex;align-items:center;gap:14px;margin-bottom:18px;padding-bottom:14px;border-bottom:1px solid #30363d}
  .icon{font-size:2.2rem;line-height:1}
  .meta{flex:1}
  .hostname{font-size:1.1rem;font-weight:800;letter-spacing:.5px}
  .brand{font-size:.82rem;color:#7d8590;margin-top:3px}
  .badge{display:inline-block;padding:2px 10px;border-radius:20px;font-size:.72rem;font-weight:700;margin-top:6px;
         background:${stCls === 'green' ? '#1a3a1a' : stCls === 'red' ? '#3a1a1a' : '#3a2a0a'};
         color:${stCls === 'green' ? '#3fb950' : stCls === 'red' ? '#f85149' : '#d29922'};
         border:1px solid ${stCls === 'green' ? '#238636' : stCls === 'red' ? '#da3633' : '#9e6a03'}}
  .row{display:flex;gap:10px;padding:9px 0;border-bottom:1px solid #21262d;align-items:flex-start}
  .row:last-child{border-bottom:none}
  .lbl{font-size:.72rem;color:#7d8590;min-width:100px;padding-top:1px}
  .val{font-size:.83rem;word-break:break-word}
  .section{margin-top:14px;padding-top:14px;border-top:1px solid #30363d;font-size:.7rem;color:#7d8590;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px}
  .footer{text-align:center;font-size:.68rem;color:#484f58;margin-top:16px;padding-top:12px;border-top:1px solid #21262d}
</style></head><body><div class="card">
  <div class="header">
    <div class="icon">🖥️</div>
    <div class="meta">
      <div class="hostname">${esc(comp.hostname || comp.serie)}</div>
      <div class="brand">${esc(comp.marca || '')} ${esc(comp.modelo || '')}</div>
      <div><span class="badge">${esc(comp.estado || 'ACTIVO')}</span></div>
    </div>
  </div>

  <div class="section">Identificación</div>
  ${row('🔢', 'Serie', comp.serie)}
  ${row('🏷️', 'Tipo', comp.tipo)}
  ${row('✅', 'Verificado', comp.verificado)}

  <div class="section">Hardware</div>
  ${row('🧠', 'RAM', comp.ram)}
  ${row('💾', 'Almacenamiento', comp.rom)}
  ${row('🖥️', 'Sistema Op.', comp.so)}

  <div class="section">Asignación</div>
  ${row('👤', 'Asignado a', comp.asignado)}
  ${row('💼', 'Puesto', comp.puesto)}
  ${row('🏢', 'Departamento', comp.departamento)}
  ${row('📍', 'Ubicación', comp.ubicacion)}

  <div class="section">Compra y Garantía</div>
  ${row('📅', 'Fecha compra', comp.fechaCompra)}
  ${row('🛡️', 'Garantía', comp.garantia)}
  ${row('📄', 'Factura', comp.factura)}

  ${comp.monitor ? `<div class="section">Monitor</div>
  ${row('🖥️', 'Monitor', comp.monitor)}
  ${row('🔢', 'N/S Monitor', comp.serieMonitor)}
  ${row('🛡️', 'Garantía', comp.garantiaMonitor)}` : ''}

  ${comp.comentarios ? `<div class="section">Comentarios</div>
  <div class="row"><div class="val" style="font-size:.8rem;font-style:italic;color:#c9d1d9">${esc(comp.comentarios)}</div></div>` : ''}

  <div class="footer">TI Inventario · Sistema de Gestión</div>
</div></body></html>`);
});

// ── Tarjeta visual para Inventario general (QR scan) ─────────
app.get('/item/:id', (req, res) => {
  const db = loadData();
  const item = db && db.items && db.items.find(i => i.id === req.params.id);
  if (!item) return res.status(404).send('<h2 style="font-family:sans-serif;padding:2rem">Ítem no encontrado</h2>');
  const cat = db.categories && db.categories.find(c => c.id === item.categoryId);

  const esc = s => (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const row = (icon, label, val) => val !== undefined && val !== null && val !== ''
    ? `<div class="row"><div class="lbl">${icon} ${label}</div><div class="val">${esc(String(val))}</div></div>` : '';

  res.send(`<!DOCTYPE html><html lang="es"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(item.name)}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:system-ui,-apple-system,Arial,sans-serif;background:#0d1117;color:#e6edf3;min-height:100vh;padding:16px;display:flex;align-items:flex-start;justify-content:center}
  .card{background:#161b22;border:1px solid #30363d;border-radius:16px;padding:20px;max-width:400px;width:100%;box-shadow:0 8px 32px rgba(0,0,0,.6);margin:12px 0}
  .header{margin-bottom:18px;padding-bottom:14px;border-bottom:1px solid #30363d}
  .icon{font-size:2rem;margin-bottom:6px}
  .name{font-size:1.15rem;font-weight:800}
  .cat{font-size:.8rem;margin-top:4px;padding:2px 8px;border-radius:12px;display:inline-block;background:#161b22;border:1px solid #30363d}
  .row{display:flex;gap:10px;padding:9px 0;border-bottom:1px solid #21262d;align-items:flex-start}
  .row:last-child{border-bottom:none}
  .lbl{font-size:.72rem;color:#7d8590;min-width:90px}
  .val{font-size:.83rem}
  .stock{font-size:1.6rem;font-weight:800;color:${(item.qty || 0) > (item.minQty || 0) ? '#3fb950' : '#f85149'}}
  .footer{text-align:center;font-size:.68rem;color:#484f58;margin-top:16px;padding-top:12px;border-top:1px solid #21262d}
</style></head><body><div class="card">
  <div class="header">
    <div class="icon">${esc(cat?.icon || '📦')}</div>
    <div class="name">${esc(item.name)}</div>
    ${cat ? `<span class="cat">${esc(cat.name)}</span>` : ''}
  </div>
  <div class="row"><div class="lbl">📦 Stock</div><div class="stock">${item.qty ?? 0}</div></div>
  ${row('📍', 'Ubicación', item.location)}
  ${row('🔢', 'N/S', item.serial)}
  ${row('📅', 'Alta', item.dateAdded)}
  ${item.notes ? `<div class="row"><div class="lbl">📝 Notas</div><div class="val" style="font-style:italic">${esc(item.notes)}</div></div>` : ''}
  <div class="footer">TI Inventario · Sistema de Gestión</div>
</div></body></html>`);
});

// ── Tarjeta visual para Recursos (impresoras, wifi, etc) ─────
app.get('/recurso/:type/:id', (req, res) => {
  const db = loadData();
  const type = req.params.type;
  const item = db && db.recursos && db.recursos[type] && db.recursos[type].find(i => i.id === req.params.id);
  if (!item) return res.status(404).send('<h2 style="font-family:sans-serif;padding:2rem">Recurso no encontrado</h2>');

  const esc = s => (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const nameStr = item.nombre || item.id;
  const icons = { impresoras: '🖨️', camaras: '📹', licencias: '🔑', wifi: '📶', telefonos: '📱' };
  const icon = icons[type] || '⚙️';

  let fieldsHtml = '';
  for (const [k, v] of Object.entries(item)) {
    if (k === 'id' || k === 'nombre' || v === '' || v === null || v === undefined) continue;
    const lbl = k.charAt(0).toUpperCase() + k.slice(1);
    fieldsHtml += `<div class="row"><div class="lbl">📍 ${esc(lbl)}</div><div class="val"><strong>${esc(String(v))}</strong></div></div>`;
  }

  res.send(`<!DOCTYPE html><html lang="es"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(nameStr)}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:system-ui,-apple-system,Arial,sans-serif;background:#0d1117;color:#e6edf3;min-height:100vh;padding:16px;display:flex;align-items:flex-start;justify-content:center}
  .card{background:#161b22;border:1px solid #30363d;border-radius:16px;padding:20px;max-width:400px;width:100%;box-shadow:0 8px 32px rgba(0,0,0,.6);margin:12px 0}
  .header{margin-bottom:18px;padding-bottom:14px;border-bottom:1px solid #30363d}
  .icon{font-size:2rem;margin-bottom:6px}
  .name{font-size:1.15rem;font-weight:800}
  .cat{font-size:.8rem;color:#4f9cf9;margin-top:4px;padding:2px 8px;border-radius:12px;display:inline-block;background:#161b22;border:1px solid #30363d;text-transform:capitalize}
  .row{display:flex;gap:10px;padding:9px 0;border-bottom:1px solid #21262d;align-items:flex-start}
  .row:last-child{border-bottom:none}
  .lbl{font-size:.72rem;color:#7d8590;min-width:100px}
  .val{font-size:.83rem;word-break:break-word}
  .footer{text-align:center;font-size:.68rem;color:#484f58;margin-top:16px;padding-top:12px;border-top:1px solid #21262d}
</style></head><body><div class="card">
  <div class="header">
    <div class="icon">${icon}</div>
    <div class="name">${esc(nameStr)}</div>
    <div><span class="cat">${esc(type)}</span></div>
  </div>
  ${fieldsHtml}
  <div class="footer">TI Inventario · Sistema de Gestión</div>
</div></body></html>`);
});

// Rutas SPA: cualquier ruta desconocida devuelve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ── Start ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅  TI Inventario corriendo en http://localhost:${PORT}`);
});
