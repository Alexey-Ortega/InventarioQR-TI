/* =========================================================
   TI Inventario — app.js
   Módulos: Storage, Router, Dashboard, Inventory, Loans,
            Employees, Movements, Categories, QR, Utils
   ========================================================= */

'use strict';

// ============================================================
// STORAGE MODULE
// ============================================================
const Storage = {
  get _key() {
    const branch = sessionStorage.getItem('ti_branch') || 'main';
    return `ti_inventario_v1_${branch}`;
  },
  _serverMode: window.location.protocol !== 'file:',
  _cache: null,

  get() {
    if (this._cache) return this._cache;
    try {
      const raw = localStorage.getItem(this._key);
      this._cache = raw ? JSON.parse(raw) : this._default();
    } catch { this._cache = this._default(); }
    return this._cache;
  },

  save(data) {
    this._cache = data;
    try { localStorage.setItem(this._key, JSON.stringify(data)); } catch (_) { }
    if (this._serverMode) {
      const branch = sessionStorage.getItem('ti_branch') || 'main';
      const token = sessionStorage.getItem('ti_token') || '';
      fetch(`/api/data?branch=${branch}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(data)
      }).then(async r => {
        if (!r.ok) {
          if (r.status === 401) {
            alert('🔒 Tu sesión ha expirado o es inválida. Inicia sesión nuevamente.');
            sessionStorage.removeItem('ti_auth');
            location.reload();
          }
          console.warn('El servidor rechazó el guardado:', await r.text());
        }
      }).catch(e => console.warn('No se pudo sincronizar con el servidor:', e));
    }
  },

  async init() {
    if (!this._serverMode) {
      this._cache = this.get();
      return;
    }
    try {
      const branch = sessionStorage.getItem('ti_branch') || 'main';
      const res = await fetch(`/api/data?branch=${branch}&_=` + Date.now(), { cache: 'no-store' });
      const json = await res.json();
      if (json.ok && json.data) {
        this._cache = json.data;
        localStorage.setItem(this._key, JSON.stringify(json.data));
      } else {
        this._cache = this._default();
        this.save(this._cache);
      }
    } catch (e) {
      console.warn('Servidor no responde, usando localStorage:', e);
      this._serverMode = false;
      this._cache = this.get();
      // IMPORTANTE: NO guardar al servidor cuando hay error de conexión
    }
  },

  _default() {
    return {
      categories: [
        { id: 'cat_1', name: 'Toners', icon: '🖨️', color: '#4f9cf9' },
        { id: 'cat_2', name: 'Celulares', icon: '📱', color: '#7c5cfc' },
        { id: 'cat_3', name: 'Laptops', icon: '💻', color: '#34d399' },
        { id: 'cat_4', name: 'Cables y Accesorios', icon: '🔌', color: '#f59e0b' },
        { id: 'cat_5', name: 'Otros', icon: '📦', color: '#94a3b8' },
        { id: 'cat_6', name: 'Salas de Juntas', icon: '👥', color: '#e83e8c' },
      ],
      items: [
        {
          id: 'item_1', name: 'Toner HP 85A', categoryId: 'cat_1',
          qty: 3, minQty: 2, location: 'Bodega TI', notes: 'Compatible HP P1102w / M1210',
          serial: '', dateAdded: '2026-01-15', assignedTo: null
        },
        {
          id: 'item_2', name: 'iPhone 13 – Gerencia', categoryId: 'cat_2',
          qty: 1, minQty: 1, location: 'Préstamo', notes: 'IMEI: 356792834716283',
          serial: 'C8GXP5HQP4', dateAdded: '2025-09-01', assignedTo: null
        },
        {
          id: 'item_3', name: 'Cable HDMI 2m', categoryId: 'cat_4',
          qty: 8, minQty: 3, location: 'Bodega TI', notes: '',
          serial: '', dateAdded: '2025-11-20', assignedTo: null
        },
        {
          id: 'item_4', name: 'Toner Brother TN-760', categoryId: 'cat_1',
          qty: 1, minQty: 2, location: 'Bodega TI', notes: 'Impresora sala juntas',
          serial: '', dateAdded: '2026-02-01', assignedTo: null
        },
        {
          id: 'item_5', name: 'Laptop Dell Latitude 5520', categoryId: 'cat_3',
          qty: 2, minQty: 1, location: 'TI', notes: 'Core i5 11th, 16GB RAM',
          serial: 'DL5520X007', dateAdded: '2026-01-10', assignedTo: null
        },
        {
          id: 'item_6', name: 'Sala de Juntas 1', categoryId: 'cat_6',
          qty: 1, minQty: 1, location: 'Oficina', notes: '1 monitor o pantalla, 1 aire acondicionado',
          serial: '', dateAdded: '2026-03-06', assignedTo: null
        },
        {
          id: 'item_7', name: 'Sala de Juntas 2', categoryId: 'cat_6',
          qty: 1, minQty: 1, location: 'Oficina', notes: '1 monitor o pantalla, 1 aire acondicionado',
          serial: '', dateAdded: '2026-03-06', assignedTo: null
        },
        {
          id: 'item_8', name: 'Sala de Juntas 3', categoryId: 'cat_6',
          qty: 1, minQty: 1, location: 'Oficina', notes: '1 monitor o pantalla, 1 aire acondicionado',
          serial: '', dateAdded: '2026-03-06', assignedTo: null
        },
        {
          id: 'item_9', name: 'Sala de Juntas 4', categoryId: 'cat_6',
          qty: 1, minQty: 1, location: 'Oficina', notes: '1 monitor o pantalla, 1 aire acondicionado',
          serial: '', dateAdded: '2026-03-06', assignedTo: null
        },
      ],
      employees: [
        { id: 'emp_1', name: 'Ana García', area: 'Contabilidad', email: 'ana.garcia@empresa.com' },
        { id: 'emp_2', name: 'Luis Martínez', area: 'Ventas', email: 'luis.martinez@empresa.com' },
        { id: 'emp_3', name: 'Karla Durán', area: 'RRHH', email: 'karla.duran@empresa.com' },
      ],
      loans: [
        {
          id: 'loan_1', itemId: 'item_2', employeeId: 'emp_3',
          dateOut: '2026-01-20', dateDue: '2026-02-20',
          dateReturned: null, notes: 'Préstamo temporal'
        }
      ],
      movements: [
        { id: 'mov_1', itemId: 'item_1', type: 'in', qty: 5, date: '2026-01-15', notes: 'Compra inicial' },
        { id: 'mov_2', itemId: 'item_1', type: 'out', qty: 2, date: '2026-02-10', notes: 'Uso impresoras planta' },
        { id: 'mov_3', itemId: 'item_4', type: 'in', qty: 2, date: '2026-02-01', notes: 'Compra' },
        { id: 'mov_4', itemId: 'item_4', type: 'out', qty: 1, date: '2026-02-15', notes: 'Reemplazo sala juntas' },
      ],
      computers: [],  // Inventario de equipos de cómputo
      recursos: {}      // Módulos Recursos TI
    };
  }
};


// ============================================================
// UTILS
// ============================================================
const Utils = {
  id() { return '_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36); },
  today() { return new Date().toISOString().split('T')[0]; },
  fmt(dateStr) {
    if (!dateStr) return '—';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  },
  daysBetween(d1, d2) {
    return Math.round((new Date(d2) - new Date(d1)) / 86400000);
  },
  isOverdue(dateDue) {
    if (!dateDue) return false;
    return new Date(dateDue) < new Date();
  },
  getStockStatus(qty, minQty) {
    if (qty === 0) return 'low';
    if (qty <= minQty) return 'warn';
    return 'ok';
  },
  stockLabel(status) {
    return { ok: 'Normal', warn: 'Bajo', low: 'Agotado' }[status];
  },
  esc(str) { return String(str || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
};

// ============================================================
// TOAST
// ============================================================
function showToast(msg, type = 'info', ms = 3000) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast show ' + type;
  clearTimeout(el._timer);
  el._timer = setTimeout(() => { el.className = 'toast'; }, ms);
}

// ============================================================
// MODAL
// ============================================================
const Modal = {
  open(title, html, afterRender) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = html;
    document.getElementById('modalOverlay').classList.add('open');
    if (afterRender) afterRender();
  },
  close() {
    document.getElementById('modalOverlay').classList.remove('open');
  }
};

// ============================================================
// ROUTER
// ============================================================
const Router = {
  views: {},
  current: null,
  register(name, fn) { this.views[name] = fn; },
  navigate(view, params = {}) {
    this.current = view;
    const titles = {
      dashboard: 'Dashboard', inventory: 'Inventario',
      loans: 'Préstamos', employees: 'Empleados',
      movements: 'Movimientos', categories: 'Categorías'
    };
    document.getElementById('viewTitle').textContent = titles[view] || view;
    // Update nav
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.view === view);
    });
    // Render
    const fn = this.views[view];
    if (fn) {
      const content = document.getElementById('mainContent');
      content.innerHTML = '';
      fn(params);
    }
    // Close sidebar on mobile
    document.getElementById('sidebar').classList.remove('open');
    Modal.close();
    updateSidebarFooter();
  }
};

// ============================================================
// GLOBAL ADD BUTTON context
// ============================================================
const AddActions = {
  dashboard: () => Views.showItemForm(),
  inventory: () => Views.showItemForm(),
  loans: () => Views.showLoanForm(),
  employees: () => Views.showEmployeeForm(),
  movements: () => Views.showMovementForm(),
  categories: () => Views.showCategoryForm(),
  computers: () => Views.showComputerForm(),
};

// ============================================================
// VIEWS
// ============================================================
const Views = {};

/* ---------- DASHBOARD ---------- */
Views.dashboard = function () {
  const db = Storage.get();
  const totalItems = db.items.reduce((s, i) => s + i.qty, 0);
  const lowStock = db.items.filter(i => Utils.getStockStatus(i.qty, i.minQty) !== 'ok');
  const activeLoans = db.loans.filter(l => !l.dateReturned);
  const overdueLoans = activeLoans.filter(l => Utils.isOverdue(l.dateDue));

  const container = document.getElementById('mainContent');
  container.innerHTML = `
    <div class="fade-in">
      <div class="stats-grid">
        <div class="stat-card blue">
          <div class="stat-icon">📦</div>
          <div class="stat-value">${db.items.length}</div>
          <div class="stat-label">Tipos de ítems</div>
        </div>
        <div class="stat-card purple">
          <div class="stat-icon">🔢</div>
          <div class="stat-value">${totalItems}</div>
          <div class="stat-label">Unidades totales</div>
        </div>
        <div class="stat-card green">
          <div class="stat-icon">🤝</div>
          <div class="stat-value">${activeLoans.length}</div>
          <div class="stat-label">Préstamos activos</div>
        </div>
        <div class="stat-card ${overdueLoans.length > 0 ? 'red' : 'warn'}">
          <div class="stat-icon">${overdueLoans.length > 0 ? '🚨' : '⚠️'}</div>
          <div class="stat-value">${lowStock.length}</div>
          <div class="stat-label">Stock bajo / agotado</div>
        </div>
      </div>

      <div class="dash-grid">
        <div class="card">
          <div class="section-header">
            <div class="section-title">⚠️ Alertas de stock</div>
            <button class="btn btn-secondary btn-sm" onclick="Router.navigate('inventory')">Ver inventario</button>
          </div>
          ${lowStock.length === 0
      ? '<div class="empty-state"><div class="empty-icon">✅</div><div class="empty-title">Todo en orden</div><div class="empty-sub">No hay ítems con stock bajo</div></div>'
      : lowStock.map(item => {
        const st = Utils.getStockStatus(item.qty, item.minQty);
        const cat = db.categories.find(c => c.id === item.categoryId);
        return `<div class="alert-row ${st === 'low' ? 'danger' : ''}">
                  <span class="alert-icon">${cat ? cat.icon : '📦'}</span>
                  <span class="alert-text"><strong>${Utils.esc(item.name)}</strong><br>
                    <span class="alert-meta">${cat ? cat.name : ''} · Ubicación: ${Utils.esc(item.location || '—')}</span>
                  </span>
                  <span class="tag ${st === 'low' ? 'tag-red' : 'tag-warn'}">${item.qty} ud. ${st === 'low' ? '🔴' : '🟡'}</span>
                </div>`;
      }).join('')}
        </div>

        <div class="card">
          <div class="section-header">
            <div class="section-title">🤝 Préstamos activos</div>
            <button class="btn btn-secondary btn-sm" onclick="Router.navigate('loans')">Ver todos</button>
          </div>
          ${activeLoans.length === 0
      ? '<div class="empty-state"><div class="empty-icon">🟢</div><div class="empty-title">Sin préstamos activos</div></div>'
      : activeLoans.slice(0, 5).map(loan => {
        const item = db.items.find(i => i.id === loan.itemId);
        const emp = db.employees.find(e => e.id === loan.employeeId);
        const overdue = Utils.isOverdue(loan.dateDue);
        return `<div class="alert-row ${overdue ? 'danger' : ''}">
                  <span class="alert-icon">${overdue ? '🚨' : '📤'}</span>
                  <span class="alert-text">
                    <strong>${item ? Utils.esc(item.name) : 'Ítem eliminado'}</strong><br>
                    <span class="alert-meta">${emp ? Utils.esc(emp.name) : '—'} · Vence: ${Utils.fmt(loan.dateDue)}${overdue ? ' <span style="color:var(--danger)">VENCIDO</span>' : ''}</span>
                  </span>
                </div>`;
      }).join('')}
        </div>

        <div class="card full">
          <div class="section-header">
            <div class="section-title">📦 Inventario por categoría</div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;">
            ${db.categories.map(cat => {
        const catItems = db.items.filter(i => i.categoryId === cat.id);
        const total = catItems.reduce((s, i) => s + i.qty, 0);
        return `<div class="stat-card" style="cursor:pointer;" onclick="Router.navigate('inventory',{catId:'${cat.id}'})">
                <div style="font-size:1.8rem;margin-bottom:6px">${cat.icon}</div>
                <div style="font-size:1.4rem;font-weight:800;color:${cat.color}">${total}</div>
                <div style="font-size:0.75rem;color:var(--text-secondary);margin-top:3px">${Utils.esc(cat.name)}</div>
                <div style="font-size:0.7rem;color:var(--text-muted)">${catItems.length} tipo${catItems.length !== 1 ? 's' : ''}</div>
              </div>`;
      }).join('')}
          </div>
        </div>
      </div>
    </div>`;
};

/* ---------- INVENTORY ---------- */
Views.inventory = function (params = {}) {
  const db = Storage.get();
  const container = document.getElementById('mainContent');

  let filterCat = params.catId || '';
  let filterStatus = '';
  let search = '';
  let page = 1;
  const PER_PAGE = 10;

  function render() {
    const focusId = document.activeElement?.id;
    const focusStart = focusId && document.activeElement.tagName === 'INPUT' ? document.activeElement.selectionStart : null;

    let items = db.items.filter(item => {
      const catOk = !filterCat || item.categoryId === filterCat;
      const stOk = !filterStatus || Utils.getStockStatus(item.qty, item.minQty) === filterStatus;
      const srchOk = !search || item.name.toLowerCase().includes(search.toLowerCase());
      return catOk && stOk && srchOk;
    });

    const total = items.length;
    const pages = Math.max(1, Math.ceil(total / PER_PAGE));
    if (page > pages) page = pages;
    const slice = items.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    container.innerHTML = `
      <div class="fade-in">
        <div class="filter-bar">
          <input class="search-input" id="invSearch" placeholder="🔍  Buscar ítem..." value="${Utils.esc(search)}" />
          <select class="filter-select" id="invCat">
            <option value="">Todas las categorías</option>
            ${db.categories.map(c => `<option value="${c.id}" ${filterCat === c.id ? 'selected' : ''}>${c.icon} ${Utils.esc(c.name)}</option>`).join('')}
          </select>
          <select class="filter-select" id="invStatus">
            <option value="">Todos los estados</option>
            <option value="ok"   ${filterStatus === 'ok' ? 'selected' : ''}>Normal</option>
            <option value="warn" ${filterStatus === 'warn' ? 'selected' : ''}>Stock bajo</option>
            <option value="low"  ${filterStatus === 'low' ? 'selected' : ''}>Agotado</option>
          </select>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Ítem</th>
                <th>Categoría</th>
                <th>Stock</th>
                <th>Ubicación</th>
                <th>Agregado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${slice.length === 0
        ? `<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">📦</div><div class="empty-title">Sin resultados</div></div></td></tr>`
        : slice.map(item => {
          const cat = db.categories.find(c => c.id === item.categoryId);
          const st = Utils.getStockStatus(item.qty, item.minQty);
          return `<tr>
                      <td><strong>${Utils.esc(item.name)}</strong>${item.serial ? `<br><span style="font-size:0.72rem;color:var(--text-muted)">S/N: ${Utils.esc(item.serial)}</span>` : ''}</td>
                      <td>${cat ? `<span class="tag tag-blue"><span class="cat-dot" style="background:${cat.color}"></span>${Utils.esc(cat.name)}</span>` : '—'}</td>
                      <td>
                        <div class="stock-indicator">
                          <span class="stock-dot ${st}"></span>
                          <span>${item.qty} ud.</span>
                          <span style="font-size:0.7rem;color:var(--text-muted)">(mín. ${item.minQty})</span>
                        </div>
                      </td>
                      <td>${Utils.esc(item.location || '—')}</td>
                      <td style="color:var(--text-secondary)">${Utils.fmt(item.dateAdded)}</td>
                      <td>
                        <div style="display:flex;gap:5px;flex-wrap:wrap">
                          <button class="btn btn-secondary btn-icon btn-sm" title="Editar" onclick="Views.showItemForm('${item.id}')">✏️</button>
                          <button class="btn btn-secondary btn-icon btn-sm" title="QR" onclick="Views.showQR('${item.id}')">📷</button>
                          <button class="btn btn-secondary btn-icon btn-sm" title="Movimiento" onclick="Views.showMovementForm('${item.id}')">🔄</button>
                          <button class="btn btn-danger btn-icon btn-sm" title="Eliminar" onclick="Views.deleteItem('${item.id}')">🗑️</button>
                        </div>
                      </td>
                    </tr>`;
        }).join('')}
            </tbody>
          </table>
        </div>
        ${pages > 1 ? `<div class="pagination">
          <button class="page-btn" id="prevPage" ${page === 1 ? 'disabled' : ''}>← Ant</button>
          ${Array.from({ length: pages }, (_, i) => `<button class="page-btn ${page === i + 1 ? 'active' : ''}" onclick="invGoPage(${i + 1})">${i + 1}</button>`).join('')}
          <button class="page-btn" id="nextPage" ${page === pages ? 'disabled' : ''}>Sig →</button>
        </div>` : ''}
      </div>`;

    // Events
    document.getElementById('invSearch').addEventListener('input', e => { search = e.target.value; page = 1; render(); });
    document.getElementById('invCat').addEventListener('change', e => { filterCat = e.target.value; page = 1; render(); });
    document.getElementById('invStatus').addEventListener('change', e => { filterStatus = e.target.value; page = 1; render(); });
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    if (prevBtn) prevBtn.addEventListener('click', () => { page--; render(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { page++; render(); });

    window.invGoPage = (p) => { page = p; render(); };

    if (focusId) {
      const el = document.getElementById(focusId);
      if (el) {
        el.focus();
        if (focusStart !== null) el.setSelectionRange(focusStart, focusStart);
      }
    }
  }
  render();
};

/* ---------- ITEM FORM ---------- */
Views.showItemForm = function (itemId) {
  const db = Storage.get();
  const item = itemId ? db.items.find(i => i.id === itemId) : null;
  const title = item ? 'Editar ítem' : 'Nuevo ítem';

  const html = `
    <div class="form-grid">
      <div class="form-group form-full">
        <label class="form-label">Nombre *</label>
        <input class="form-input" id="fName" placeholder="Ej: Toner HP 85A" value="${Utils.esc(item?.name || '')}" />
      </div>
      <div class="form-group">
        <label class="form-label">Categoría *</label>
        <select class="form-select" id="fCat">
          ${db.categories.map(c => `<option value="${c.id}" ${item?.categoryId === c.id ? 'selected' : ''}>${c.icon} ${Utils.esc(c.name)}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Ubicación</label>
        <input class="form-input" id="fLoc" placeholder="Ej: Bodega TI, Piso 2" value="${Utils.esc(item?.location || '')}" />
      </div>
      <div class="form-group">
        <label class="form-label">Cantidad actual *</label>
        <input class="form-input" id="fQty" type="number" min="0" value="${item ? item.qty : 1}" />
      </div>
      <div class="form-group">
        <label class="form-label">Stock mínimo</label>
        <input class="form-input" id="fMin" type="number" min="0" value="${item ? item.minQty : 1}" />
      </div>
      <div class="form-group">
        <label class="form-label">Número de serie / Modelo</label>
        <input class="form-input" id="fSerial" placeholder="Opcional" value="${Utils.esc(item?.serial || '')}" />
      </div>
      <div class="form-group">
        <label class="form-label">Fecha de alta</label>
        <input class="form-input" id="fDate" type="date" value="${item?.dateAdded || Utils.today()}" />
      </div>
      <div class="form-group form-full">
        <label class="form-label">Notas</label>
        <textarea class="form-textarea" id="fNotes" placeholder="Modelos compatibles, observaciones...">${Utils.esc(item?.notes || '')}</textarea>
      </div>
    </div>
    <div class="form-actions">
      <button class="btn btn-secondary" onclick="Modal.close()">Cancelar</button>
      <button class="btn btn-primary" id="fSave">💾 ${item ? 'Guardar cambios' : 'Crear ítem'}</button>
    </div>`;

  Modal.open(title, html, () => {
    document.getElementById('fSave').addEventListener('click', () => {
      const name = document.getElementById('fName').value.trim();
      const catId = document.getElementById('fCat').value;
      const qty = parseInt(document.getElementById('fQty').value) || 0;
      if (!name) { showToast('El nombre es obligatorio', 'error'); return; }

      const db2 = Storage.get();
      if (item) {
        const idx = db2.items.findIndex(i => i.id === itemId);
        db2.items[idx] = {
          ...db2.items[idx], name, categoryId: catId, qty,
          minQty: parseInt(document.getElementById('fMin').value) || 0,
          location: document.getElementById('fLoc').value.trim(),
          serial: document.getElementById('fSerial').value.trim(),
          dateAdded: document.getElementById('fDate').value,
          notes: document.getElementById('fNotes').value.trim()
        };
      } else {
        db2.items.push({
          id: Utils.id(), name, categoryId: catId, qty,
          minQty: parseInt(document.getElementById('fMin').value) || 0,
          location: document.getElementById('fLoc').value.trim(),
          serial: document.getElementById('fSerial').value.trim(),
          dateAdded: document.getElementById('fDate').value,
          notes: document.getElementById('fNotes').value.trim(),
          assignedTo: null
        });
      }
      Storage.save(db2);
      Modal.close();
      showToast(item ? 'Ítem actualizado ✅' : 'Ítem creado ✅', 'success');
      if (Router.current === 'inventory') Views.inventory();
      else if (Router.current === 'dashboard') Views.dashboard();
      updateSidebarFooter();
    });
  });
};

/* ---------- DELETE ITEM ---------- */
Views.deleteItem = function (itemId) {
  if (!confirm('¿Eliminar este ítem? Esta acción no se puede deshacer.')) return;
  const db = Storage.get();
  db.items = db.items.filter(i => i.id !== itemId);
  db.loans = db.loans.filter(l => l.itemId !== itemId);
  db.movements = db.movements.filter(m => m.itemId !== itemId);
  Storage.save(db);
  showToast('Ítem eliminado', 'info');
  if (Router.current === 'inventory') Views.inventory();
  else Views.dashboard();
  updateSidebarFooter();
};

/* ---------- QR ---------- */

// Genera el HTML de la tarjeta de ítem (compacto para caber en un QR)
function buildItemCardHTML(item, cat) {
  const name = (item.name || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const catN = (cat?.name || '').replace(/</g, '&lt;');
  const catI = cat?.icon || '📦';
  const loc = (item.location || '—').replace(/</g, '&lt;');
  const sn = (item.serial || '—').replace(/</g, '&lt;');
  const notes = (item.notes || '').replace(/</g, '&lt;');
  const date = item.dateAdded ? item.dateAdded.split('-').reverse().join('/') : '—';
  const qty = item.qty ?? '—';
  const clr = cat?.color || '#4f9cf9';

  // HTML compacto (~800 chars) para que quepa en QR versión M
  return `<!DOCTYPE html><html lang=es><head><meta charset=UTF-8><meta name=viewport content="width=device-width,initial-scale=1"><title>${name}</title>` +
    `<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui,Arial;background:#0d1117;color:#e6edf3;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:16px}` +
    `.card{background:#161b22;border:1px solid #30363d;border-radius:16px;padding:24px;max-width:360px;width:100%;box-shadow:0 8px 32px rgba(0,0,0,.5)}` +
    `.top{border-left:4px solid ${clr};padding-left:12px;margin-bottom:20px}` +
    `.ico{font-size:1.6rem;margin-bottom:4px}.nm{font-size:1.15rem;font-weight:800}.ct{color:${clr};font-size:.78rem;margin-top:2px}` +
    `.row{display:flex;align-items:flex-start;gap:10px;padding:9px 0;border-bottom:1px solid #21262d}` +
    `.row:last-child{border-bottom:none}.lbl{color:#7d8590;font-size:.72rem;min-width:80px;padding-top:1px}.val{font-size:.83rem}</style></head>` +
    `<body><div class=card>` +
    `<div class=top><div class=ico>${catI}</div><div class=nm>${name}</div><div class=ct>${catN}</div></div>` +
    `<div class=row><div class=lbl>📍 Ubicación</div><div class=val>${loc}</div></div>` +
    `<div class=row><div class=lbl>🔢 Serie</div><div class=val>${sn}</div></div>` +
    `<div class=row><div class=lbl>📦 Stock</div><div class=val>${qty} ud.</div></div>` +
    `<div class=row><div class=lbl>📅 Alta</div><div class=val>${date}</div></div>` +
    (notes ? `<div class=row><div class=lbl>📝 Notas</div><div class=val>${notes}</div></div>` : '') +
    `</div></body></html>`;
}

Views.showQR = function (itemId) {
  const db = Storage.get();
  const item = db.items.find(i => i.id === itemId);
  if (!item) return;
  const cat = db.categories.find(c => c.id === item.categoryId);

  // Si corre en servidor → URL directa (abre tarjeta visual al escanear)
  // Si corre como file:// → texto plano
  const isServerMode = window.location.protocol !== 'file:';
  let qrPayload = '';
  if (cat && cat.name === 'Salas de Juntas') {
    qrPayload = isServerMode
      ? `https://wa.me/5213319953714?text=${encodeURIComponent('Hola Alex estoy en la ' + item.name + ' me ayudarías por favor')}`
      : `Soporte ${item.name}`;
  } else {
    qrPayload = isServerMode
      ? `${window.location.origin}/item/${item.id}`
      : [item.name, item.serial ? 'S/N: ' + item.serial : '', item.location || '', cat ? cat.name : '']
        .filter(Boolean).join('\n');
  }

  const html = `
    <div class="qr-wrap">
      <div style="text-align:center;margin-bottom:6px">
        <span style="font-size:0.72rem;color:var(--text-muted)">
          📱 Escanea para identificar el equipo · 🖨️ Imprime la etiqueta para ver todos los datos
        </span>
      </div>
      <div class="qr-canvas-container">
        <div id="qrContainer" style="line-height:0"></div>
      </div>
      <div class="qr-label">
        <strong>${Utils.esc(item.name)}</strong>
        ${cat ? '<br>' + Utils.esc(cat.icon) + ' ' + Utils.esc(cat.name) : ''}
        ${item.serial ? '<br>S/N: ' + Utils.esc(item.serial) : ''}
        ${item.location ? '<br>📍 ' + Utils.esc(item.location) : ''}
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center">
        <button class="btn btn-primary"   id="qrPrint"    disabled>🖨️ Imprimir etiqueta</button>
        <button class="btn btn-secondary" id="qrDownload" disabled>⬇️ Descargar QR</button>
      </div>
    </div>`;

  Modal.open(`QR — ${item.name}`, html, () => {
    const container = document.getElementById('qrContainer');
    const printBtn = document.getElementById('qrPrint');
    const downloadBtn = document.getElementById('qrDownload');

    // Payload corto = QR limpio con máxima corrección de errores (H)
    new QRCode(container, {
      text: qrPayload,
      width: 220,
      height: 220,
      colorDark: '#000000',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    });

    setTimeout(() => {
      const canvas = container.querySelector('canvas');
      if (!canvas) {
        container.innerHTML = '<p style="color:var(--danger)">Error generando QR</p>';
        return;
      }

      let qrDataURL;
      try { qrDataURL = canvas.toDataURL('image/png'); }
      catch (e) { /* canvas tainted */ }

      printBtn.disabled = false;
      downloadBtn.disabled = false;

      // ---- IMPRIMIR: etiqueta profesional QR + specs lado a lado ----
      printBtn.addEventListener('click', () => {
        const w = window.open('', '_blank', 'width=600,height=500');
        if (!w) { showToast('Permite ventanas emergentes para este sitio.', 'error', 5000); return; }

        const qrSrc = qrDataURL ? `<img src="${qrDataURL}" style="width:160px;height:160px">` : '';
        const catIcon = cat?.icon || '📦';
        const catName = cat ? Utils.esc(cat.name) : '';
        const rows = [
          ['📍 Ubicación', item.location || null],
          ['🔢 Nº serie', item.serial || null],
          ['📦 Stock', (item.qty ?? 0) + ' ud.'],
          ['📅 Alta', item.dateAdded ? item.dateAdded.split('-').reverse().join('/') : null],
        ].filter(([, v]) => v !== null);
        if (item.notes) rows.push(['📝 Notas', item.notes]);

        w.document.write(`<!DOCTYPE html><html><head><title>${Utils.esc(item.name)}</title>
                <style>
                  *{box-sizing:border-box;margin:0;padding:0}
                  body{font-family:Arial,sans-serif;background:#fff;padding:24px}
                  .wrap{display:flex;gap:20px;align-items:flex-start;border:2px solid #e0e0e0;border-radius:12px;padding:20px;max-width:540px}
                  .qr-side{flex-shrink:0;display:flex;flex-direction:column;align-items:center;gap:6px}
                  .qr-side small{font-size:8px;color:#888;text-align:center;max-width:160px}
                  .info{flex:1}
                  .tit{font-size:1rem;font-weight:800;margin-bottom:2px;color:#111}
                  .cat{font-size:.75rem;color:${cat?.color || '#4f9cf9'};margin-bottom:10px}
                  table{width:100%;border-collapse:collapse;font-size:.75rem}
                  td{padding:5px 0;border-bottom:1px solid #f0f0f0;vertical-align:top}
                  td:first-child{color:#888;width:80px;padding-right:8px}
                  tr:last-child td{border-bottom:none}
                  @media print{@page{margin:.5cm}body{padding:0}}
                </style></head><body>
                <div class="wrap">
                  <div class="qr-side">
                    ${qrSrc}
                    <small>Escanear para ver ficha del equipo</small>
                  </div>
                  <div class="info">
                    <div class="tit">${Utils.esc(item.name)}</div>
                    <div class="cat">${catIcon} ${catName}</div>
                    <table>${rows.map(([l, v]) => `<tr><td>${l}</td><td><strong>${Utils.esc(String(v))}</strong></td></tr>`).join('')}</table>
                  </div>
                </div>
                </body></html>`);
        w.document.close();
        w.focus();
        setTimeout(() => { w.print(); }, 400);
      });

      // ---- DESCARGAR: imagen del QR ----
      downloadBtn.addEventListener('click', () => {
        if (!qrDataURL) { showToast('No se pudo exportar (restricción del navegador)', 'error'); return; }
        const a = document.createElement('a');
        a.download = 'QR_' + item.name.replace(/[^a-zA-Z0-9]/g, '_') + '.png';
        a.href = qrDataURL;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      });
    }, 150);
  });
};

/* ---------- LOANS ---------- */
Views.loans = function () {
  const db = Storage.get();
  const container = document.getElementById('mainContent');

  let filter = 'active'; // all | active | returned | overdue
  function render() {
    let loans = db.loans.filter(l => {
      if (filter === 'active') return !l.dateReturned;
      if (filter === 'returned') return !!l.dateReturned;
      if (filter === 'overdue') return !l.dateReturned && Utils.isOverdue(l.dateDue);
      return true;
    });

    container.innerHTML = `
      <div class="fade-in">
        <div class="filter-bar">
          <select class="filter-select" id="loanFilter">
            <option value="all"      ${filter === 'all' ? 'selected' : ''}>Todos</option>
            <option value="active"   ${filter === 'active' ? 'selected' : ''}>Activos</option>
            <option value="returned" ${filter === 'returned' ? 'selected' : ''}>Devueltos</option>
            <option value="overdue"  ${filter === 'overdue' ? 'selected' : ''}>Vencidos</option>
          </select>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Ítem</th>
                <th>Empleado</th>
                <th>Salida</th>
                <th>Vencimiento</th>
                <th>Estado</th>
                <th>Notas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${loans.length === 0
        ? `<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">🤝</div><div class="empty-title">Sin préstamos</div></div></td></tr>`
        : loans.map(loan => {
          const item = db.items.find(i => i.id === loan.itemId);
          const emp = db.employees.find(e => e.id === loan.employeeId);
          const overdue = !loan.dateReturned && Utils.isOverdue(loan.dateDue);
          const statusClass = loan.dateReturned ? 'returned' : overdue ? 'overdue' : 'active';
          const statusLabel = loan.dateReturned ? '✅ Devuelto' : overdue ? '🚨 Vencido' : '📤 Activo';
          return `<tr>
                      <td><strong>${item ? Utils.esc(item.name) : '<em>Eliminado</em>'}</strong></td>
                      <td>${emp ? Utils.esc(emp.name) + '<br><span style="font-size:0.72rem;color:var(--text-muted)">' + Utils.esc(emp.area) + '</span>' : '—'}</td>
                      <td>${Utils.fmt(loan.dateOut)}</td>
                      <td>${Utils.fmt(loan.dateDue)}</td>
                      <td><span class="loan-status ${statusClass}">${statusLabel}</span></td>
                      <td style="color:var(--text-secondary);font-size:0.78rem">${Utils.esc(loan.notes || '—')}</td>
                      <td>
                        <div style="display:flex;gap:5px">
                          ${!loan.dateReturned ? `<button class="btn btn-success btn-sm" onclick="Views.returnLoan('${loan.id}')">✅ Devolver</button>` : ''}
                          <button class="btn btn-danger btn-icon btn-sm" onclick="Views.deleteLoan('${loan.id}')">🗑️</button>
                        </div>
                      </td>
                    </tr>`;
        }).join('')}
            </tbody>
          </table>
        </div>
      </div>`;

    document.getElementById('loanFilter').addEventListener('change', e => { filter = e.target.value; render(); });
  }
  render();
};

/* ---------- LOAN FORM ---------- */
Views.showLoanForm = function (preItemId) {
  const db = Storage.get();
  if (db.employees.length === 0) { showToast('Primero registra empleados', 'error'); return; }

  const html = `
    <div class="form-grid">
      <div class="form-group form-full">
        <label class="form-label">Ítem a prestar *</label>
        <select class="form-select" id="lItem">
          <option value="">Seleccionar...</option>
          ${db.items.map(i => `<option value="${i.id}" ${preItemId === i.id ? 'selected' : ''}>${Utils.esc(i.name)} (stock: ${i.qty})</option>`).join('')}
        </select>
      </div>
      <div class="form-group form-full">
        <label class="form-label">Empleado *</label>
        <select class="form-select" id="lEmp">
          <option value="">Seleccionar...</option>
          ${db.employees.map(e => `<option value="${e.id}">${Utils.esc(e.name)} — ${Utils.esc(e.area)}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Fecha de salida</label>
        <input class="form-input" id="lDateOut" type="date" value="${Utils.today()}" />
      </div>
      <div class="form-group">
        <label class="form-label">Fecha de devolución esperada</label>
        <input class="form-input" id="lDateDue" type="date" value="" />
      </div>
      <div class="form-group form-full">
        <label class="form-label">Notas</label>
        <textarea class="form-textarea" id="lNotes" placeholder="Motivo, condición del equipo..."></textarea>
      </div>
    </div>
    <div class="form-actions">
      <button class="btn btn-secondary" onclick="Modal.close()">Cancelar</button>
      <button class="btn btn-primary" id="lSave">📤 Registrar préstamo</button>
    </div>`;

  Modal.open('Nuevo préstamo', html, () => {
    document.getElementById('lSave').addEventListener('click', () => {
      const itemId = document.getElementById('lItem').value;
      const empId = document.getElementById('lEmp').value;
      if (!itemId || !empId) { showToast('Selecciona ítem y empleado', 'error'); return; }
      const db2 = Storage.get();
      const item = db2.items.find(i => i.id === itemId);
      if (!item || item.qty < 1) { showToast('Sin stock disponible', 'error'); return; }
      db2.loans.push({
        id: Utils.id(), itemId, employeeId: empId,
        dateOut: document.getElementById('lDateOut').value,
        dateDue: document.getElementById('lDateDue').value || null,
        dateReturned: null,
        notes: document.getElementById('lNotes').value.trim()
      });
      // Descontar del stock
      item.qty -= 1;
      db2.movements.unshift({ id: Utils.id(), itemId, type: 'loan', qty: 1, date: Utils.today(), notes: `Préstamo a ${db2.employees.find(e => e.id === empId)?.name}` });
      Storage.save(db2);
      Modal.close();
      showToast('Préstamo registrado 📤', 'success');
      Views.loans();
      updateLoansBadge();
    });
  });
};

Views.returnLoan = function (loanId) {
  if (!confirm('¿Marcar como devuelto?')) return;
  const db = Storage.get();
  const loan = db.loans.find(l => l.id === loanId);
  if (!loan) return;
  loan.dateReturned = Utils.today();
  // Devolver al stock
  const item = db.items.find(i => i.id === loan.itemId);
  if (item) {
    item.qty += 1;
    db.movements.unshift({ id: Utils.id(), itemId: item.id, type: 'ret', qty: 1, date: Utils.today(), notes: `Devolución de préstamo` });
  }
  Storage.save(db);
  showToast('Devuelto y stock actualizado ✅', 'success');
  Views.loans();
  updateLoansBadge();
};

Views.deleteLoan = function (loanId) {
  if (!confirm('¿Eliminar este préstamo?')) return;
  const db = Storage.get();
  db.loans = db.loans.filter(l => l.id !== loanId);
  Storage.save(db);
  showToast('Préstamo eliminado', 'info');
  Views.loans();
  updateLoansBadge();
};

/* ---------- EMPLOYEES ---------- */
Views.employees = function () {
  const db = Storage.get();
  const container = document.getElementById('mainContent');

  function render() {
    container.innerHTML = `
      <div class="fade-in">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Área</th>
                <th>Email</th>
                <th>Préstamos activos</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${db.employees.length === 0
        ? `<tr><td colspan="5"><div class="empty-state"><div class="empty-icon">👤</div><div class="empty-title">Sin empleados registrados</div></div></td></tr>`
        : db.employees.map(emp => {
          const activeLoans = db.loans.filter(l => l.employeeId === emp.id && !l.dateReturned).length;
          return `<tr>
                      <td><strong>${Utils.esc(emp.name)}</strong></td>
                      <td>${Utils.esc(emp.area)}</td>
                      <td style="color:var(--text-secondary)">${Utils.esc(emp.email || '—')}</td>
                      <td>${activeLoans > 0 ? `<span class="tag tag-blue">${activeLoans} activo${activeLoans > 1 ? 's' : ''}</span>` : '<span class="tag tag-gray">Ninguno</span>'}</td>
                      <td>
                        <div style="display:flex;gap:5px">
                          <button class="btn btn-secondary btn-icon btn-sm" onclick="Views.showEmployeeForm('${emp.id}')">✏️</button>
                          <button class="btn btn-danger btn-icon btn-sm" onclick="Views.deleteEmployee('${emp.id}')">🗑️</button>
                        </div>
                      </td>
                    </tr>`;
        }).join('')}
            </tbody>
          </table>
        </div>
      </div>`;
  }
  render();
};

Views.showEmployeeForm = function (empId) {
  const db = Storage.get();
  const emp = empId ? db.employees.find(e => e.id === empId) : null;

  const html = `
    <div class="form-grid">
      <div class="form-group form-full">
        <label class="form-label">Nombre completo *</label>
        <input class="form-input" id="eName" value="${Utils.esc(emp?.name || '')}" placeholder="Ej: Juan Pérez" />
      </div>
      <div class="form-group">
        <label class="form-label">Área / Departamento</label>
        <input class="form-input" id="eArea" value="${Utils.esc(emp?.area || '')}" placeholder="Ej: Contabilidad" />
      </div>
      <div class="form-group">
        <label class="form-label">Correo electrónico</label>
        <input class="form-input" id="eEmail" type="email" value="${Utils.esc(emp?.email || '')}" placeholder="usuario@empresa.com" />
      </div>
    </div>
    <div class="form-actions">
      <button class="btn btn-secondary" onclick="Modal.close()">Cancelar</button>
      <button class="btn btn-primary" id="eSave">💾 ${emp ? 'Guardar' : 'Crear empleado'}</button>
    </div>`;

  Modal.open(emp ? 'Editar empleado' : 'Nuevo empleado', html, () => {
    document.getElementById('eSave').addEventListener('click', () => {
      const name = document.getElementById('eName').value.trim();
      if (!name) { showToast('El nombre es obligatorio', 'error'); return; }
      const db2 = Storage.get();
      if (emp) {
        const idx = db2.employees.findIndex(e => e.id === empId);
        db2.employees[idx] = { ...db2.employees[idx], name, area: document.getElementById('eArea').value.trim(), email: document.getElementById('eEmail').value.trim() };
      } else {
        db2.employees.push({ id: Utils.id(), name, area: document.getElementById('eArea').value.trim(), email: document.getElementById('eEmail').value.trim() });
      }
      Storage.save(db2);
      Modal.close();
      showToast(emp ? 'Empleado actualizado ✅' : 'Empleado creado ✅', 'success');
      Views.employees();
    });
  });
};

Views.deleteEmployee = function (empId) {
  const db = Storage.get();
  const hasLoans = db.loans.some(l => l.employeeId === empId && !l.dateReturned);
  if (hasLoans) { showToast('Empleado tiene préstamos activos. Devuelve primero.', 'error'); return; }
  if (!confirm('¿Eliminar empleado?')) return;
  db.employees = db.employees.filter(e => e.id !== empId);
  Storage.save(db);
  showToast('Empleado eliminado', 'info');
  Views.employees();
};

/* ---------- MOVEMENTS ---------- */
Views.movements = function () {
  const db = Storage.get();
  const container = document.getElementById('mainContent');
  const typeLabels = { in: '📥 Entrada', out: '📤 Salida', loan: '🤝 Préstamo', ret: '↩️ Devolución' };
  const typeColors = { in: 'in', out: 'out', loan: 'loan', ret: 'ret' };

  const sorted = [...db.movements].sort((a, b) => b.date.localeCompare(a.date));

  container.innerHTML = `
    <div class="fade-in">
      ${sorted.length === 0
      ? '<div class="empty-state"><div class="empty-icon">📋</div><div class="empty-title">Sin movimientos registrados</div></div>'
      : `<div class="card"><div class="timeline">
          ${sorted.map(mov => {
        const item = db.items.find(i => i.id === mov.itemId);
        return `<div class="timeline-item">
              <div class="timeline-dot ${typeColors[mov.type] || 'in'}"></div>
              <div class="timeline-body">
                <div class="timeline-title">${typeLabels[mov.type] || mov.type} · ${mov.qty} ud. — ${item ? Utils.esc(item.name) : '<em>Ítem eliminado</em>'}</div>
                <div class="timeline-sub">${Utils.fmt(mov.date)}${mov.notes ? ' · ' + Utils.esc(mov.notes) : ''}</div>
              </div>
            </div>`;
      }).join('')}
        </div></div>`}
    </div>`;
};

/* ---------- MOVEMENT FORM ---------- */
Views.showMovementForm = function (preItemId) {
  const db = Storage.get();
  const html = `
    <div class="form-grid">
      <div class="form-group form-full">
        <label class="form-label">Ítem *</label>
        <select class="form-select" id="mItem">
          ${db.items.map(i => `<option value="${i.id}" ${preItemId === i.id ? 'selected' : ''}>${Utils.esc(i.name)}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Tipo *</label>
        <select class="form-select" id="mType">
          <option value="in">📥 Entrada</option>
          <option value="out">📤 Salida</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Cantidad *</label>
        <input class="form-input" id="mQty" type="number" min="1" value="1" />
      </div>
      <div class="form-group">
        <label class="form-label">Fecha</label>
        <input class="form-input" id="mDate" type="date" value="${Utils.today()}" />
      </div>
      <div class="form-group form-full">
        <label class="form-label">Notas</label>
        <input class="form-input" id="mNotes" placeholder="Ej: Compra orden #123" />
      </div>
    </div>
    <div class="form-actions">
      <button class="btn btn-secondary" onclick="Modal.close()">Cancelar</button>
      <button class="btn btn-primary" id="mSave">💾 Registrar</button>
    </div>`;

  Modal.open('Registrar movimiento', html, () => {
    document.getElementById('mSave').addEventListener('click', () => {
      const itemId = document.getElementById('mItem').value;
      const type = document.getElementById('mType').value;
      const qty = parseInt(document.getElementById('mQty').value) || 0;
      if (!itemId || qty < 1) { showToast('Datos inválidos', 'error'); return; }
      const db2 = Storage.get();
      const item = db2.items.find(i => i.id === itemId);
      if (!item) return;
      if (type === 'out' && item.qty < qty) { showToast(`Stock insuficiente (disponible: ${item.qty})`, 'error'); return; }
      item.qty += type === 'in' ? qty : -qty;
      db2.movements.unshift({ id: Utils.id(), itemId, type, qty, date: document.getElementById('mDate').value, notes: document.getElementById('mNotes').value.trim() });
      Storage.save(db2);
      Modal.close();
      showToast('Movimiento registrado ✅', 'success');
      if (Router.current === 'movements') Views.movements();
      else if (Router.current === 'inventory') Views.inventory();
    });
  });
};

/* ---------- CATEGORIES ---------- */
Views.categories = function () {
  const db = Storage.get();
  const container = document.getElementById('mainContent');

  function render() {
    container.innerHTML = `
      <div class="fade-in">
        <div class="card">
          <div class="section-header">
            <div class="section-title">🏷️ Categorías actuales</div>
          </div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr><th>Categoría</th><th>Ítems</th><th>Color</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                ${db.categories.map(cat => {
      const count = db.items.filter(i => i.categoryId === cat.id).length;
      return `<tr>
                    <td><span style="font-size:1.2rem">${cat.icon}</span> <strong>${Utils.esc(cat.name)}</strong></td>
                    <td>${count} ítem${count !== 1 ? 's' : ''}</td>
                    <td><span style="display:inline-block;width:20px;height:20px;border-radius:50%;background:${cat.color};vertical-align:middle"></span></td>
                    <td>
                      <div style="display:flex;gap:5px">
                        <button class="btn btn-secondary btn-sm" onclick="Views.showCategoryForm('${cat.id}')">✏️ Editar</button>
                        ${count === 0 ? `<button class="btn btn-danger btn-sm" onclick="Views.deleteCategory('${cat.id}')">🗑️</button>` : ''}
                      </div>
                    </td>
                  </tr>`;
    }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>`;
  }
  render();
};

Views.showCategoryForm = function (catId) {
  const db = Storage.get();
  const cat = catId ? db.categories.find(c => c.id === catId) : null;
  const colors = ['#4f9cf9', '#7c5cfc', '#34d399', '#f59e0b', '#f87171', '#e879f9', '#22d3ee', '#94a3b8'];

  const html = `
    <div class="form-grid">
      <div class="form-group">
        <label class="form-label">Nombre *</label>
        <input class="form-input" id="cName" value="${Utils.esc(cat?.name || '')}" placeholder="Ej: Monitores" />
      </div>
      <div class="form-group">
        <label class="form-label">Ícono (emoji)</label>
        <input class="form-input" id="cIcon" value="${Utils.esc(cat?.icon || '📦')}" maxlength="2" />
      </div>
      <div class="form-group form-full">
        <label class="form-label">Color</label>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px" id="colorPicker">
          ${colors.map(col => `<div class="color-opt" data-color="${col}" style="width:28px;height:28px;border-radius:50%;background:${col};cursor:pointer;border:3px solid ${cat?.color === col ? '#fff' : 'transparent'};transition:border 0.15s" onclick="selectColor('${col}')"></div>`).join('')}
        </div>
        <input type="hidden" id="cColor" value="${cat?.color || colors[0]}" />
      </div>
    </div>
    <div class="form-actions">
      <button class="btn btn-secondary" onclick="Modal.close()">Cancelar</button>
      <button class="btn btn-primary" id="cSave">💾 ${cat ? 'Guardar' : 'Crear categoría'}</button>
    </div>`;

  Modal.open(cat ? 'Editar categoría' : 'Nueva categoría', html, () => {
    window.selectColor = (col) => {
      document.getElementById('cColor').value = col;
      document.querySelectorAll('.color-opt').forEach(el => {
        el.style.borderColor = el.dataset.color === col ? '#fff' : 'transparent';
      });
    };
    document.getElementById('cSave').addEventListener('click', () => {
      const name = document.getElementById('cName').value.trim();
      if (!name) { showToast('El nombre es obligatorio', 'error'); return; }
      const db2 = Storage.get();
      if (cat) {
        const idx = db2.categories.findIndex(c => c.id === catId);
        db2.categories[idx] = { ...db2.categories[idx], name, icon: document.getElementById('cIcon').value.trim() || '📦', color: document.getElementById('cColor').value };
      } else {
        db2.categories.push({ id: Utils.id(), name, icon: document.getElementById('cIcon').value.trim() || '📦', color: document.getElementById('cColor').value });
      }
      Storage.save(db2);
      Modal.close();
      showToast(cat ? 'Categoría actualizada ✅' : 'Categoría creada ✅', 'success');
      Views.categories();
      updateSidebarFooter();
    });
  });
};

Views.deleteCategory = function (catId) {
  if (!confirm('¿Eliminar esta categoría?')) return;
  const db = Storage.get();
  db.categories = db.categories.filter(c => c.id !== catId);
  Storage.save(db);
  showToast('Categoría eliminada', 'info');
  Views.categories();
  updateSidebarFooter();
};

// ============================================================
// COMPUTERS MODULE — Equipos de Cómputo
// ============================================================
const COMPUTER_STATUS = {
  ACTIVO: { label: 'Activo', cls: 'status-active' },
  BAJA: { label: 'Baja', cls: 'status-low' },
  PERDIDO: { label: 'Perdido', cls: 'status-out' },
  ROBADA: { label: 'Robada', cls: 'status-out' },
};

Views.computers = function () {
  const db = Storage.get();
  if (!db.computers) { db.computers = []; Storage.save(db); }
  const container = document.getElementById('mainContent');
  let search = '', filterStatus = 'all';

  function render() {
    const focusId = document.activeElement?.id;
    const focusStart = focusId && document.activeElement.tagName === 'INPUT' ? document.activeElement.selectionStart : null;

    const list = db.computers.filter(c => {
      const q = search.toLowerCase();
      const matchSearch = !q || [c.idNum, c.marca, c.modelo, c.serie,
      c.asignado, c.departamento, c.hostname, c.puesto]
        .some(f => f && f.toLowerCase().includes(q));
      const matchStatus = filterStatus === 'all' || c.estado === filterStatus;
      return matchSearch && matchStatus;
    });

    container.innerHTML = `
        <div class="fade-in">
          <div class="filter-bar" style="flex-wrap:wrap;gap:10px">
            <input class="search-input" id="compSearch" type="text"
              placeholder="🔍 Buscar equipo, serie, usuario..." value="${Utils.esc(search)}"
              style="flex:1;min-width:220px">
            <select class="filter-select" id="compStatus">
              <option value="all"    ${filterStatus === 'all' ? 'selected' : ''}>Todos los estados</option>
              <option value="ACTIVO" ${filterStatus === 'ACTIVO' ? 'selected' : ''}>Activo</option>
              <option value="BAJA"   ${filterStatus === 'BAJA' ? 'selected' : ''}>Baja</option>
              <option value="PERDIDO"${filterStatus === 'PERDIDO' ? 'selected' : ''}>Perdido</option>
              <option value="ROBADA" ${filterStatus === 'ROBADA' ? 'selected' : ''}>Robada</option>
            </select>
            <button class="btn btn-secondary" id="batchPrintBtn"
              style="display:none" onclick="Views._printBatchQR()">🖨️ Imprimir QR (<span id="selectedCount">0</span>)</button>
          </div>
          <div class="table-wrap">
            <table>
              <thead><tr>
                <th><input type="checkbox" id="compSelectAll" title="Seleccionar todo"></th>
                <th>#</th><th>Tipo</th><th>Marca / Modelo</th><th>Nº Serie</th>
                <th>Specs</th><th>SO</th><th>Hostname</th>
                <th>Asignado / Puesto</th><th>Depto / Ubicación</th>
                <th>Estado</th><th>Acciones</th>
              </tr></thead>
              <tbody>
              ${list.length === 0
        ? `<tr><td colspan="12" style="text-align:center;color:var(--text-muted);padding:40px">
                    ${db.computers.length === 0
          ? '🖥️ Sin equipos registrados. Presiona <strong>+ Agregar</strong> para empezar.'
          : 'Sin resultados para los filtros actuales.'}
                   </td></tr>`
        : list.map(c => {
          const st = COMPUTER_STATUS[c.estado] || { label: c.estado || '—', cls: '' };
          const hasHistory = c.assignmentHistory && c.assignmentHistory.length > 0;
          return `<tr>
                       <td><input type="checkbox" class="comp-chk" data-id="${c.id}"></td>
                       <td style="color:var(--text-muted);font-size:.75rem">${Utils.esc(c.idNum || '—')}</td>
                       <td>${Utils.esc(c.tipo || '—')}</td>
                       <td><strong>${Utils.esc(c.marca || '')}</strong>
                         <br><span style="font-size:.75rem;color:var(--text-muted)">${Utils.esc(c.modelo || '')}</span></td>
                       <td style="font-family:monospace;font-size:.78rem">${Utils.esc(c.serie || '—')}</td>
                       <td style="font-size:.75rem">${c.ram ? Utils.esc(c.ram) + ' RAM' : ''}${c.rom ? '<br>' + Utils.esc(c.rom) + ' ROM' : ''}</td>
                       <td style="font-size:.75rem">${Utils.esc(c.so || '—')}</td>
                       <td style="font-family:monospace;font-size:.75rem">${Utils.esc(c.hostname || '—')}</td>
                       <td>${Utils.esc(c.asignado || '—')}${c.puesto ? '<br><span style="font-size:.72rem;color:var(--text-muted)">' + Utils.esc(c.puesto) + '</span>' : ''}</td>
                       <td style="font-size:.75rem">${Utils.esc(c.departamento || '—')}${c.ubicacion ? '<br>📍 ' + Utils.esc(c.ubicacion) : ''}</td>
                       <td><span class="stock-badge ${st.cls}">${st.label}</span></td>
                       <td>
                         <div class="action-btns">
                           <button class="btn-icon" title="Ver QR"      onclick="Views.showComputerQR('${c.id}')">🔲</button>
                           <button class="btn-icon" title="Historial"    onclick="Views.showComputerHistory('${c.id}')" style="position:relative">
                             📋${hasHistory ? '<span style="position:absolute;top:-3px;right:-3px;background:var(--accent);color:#fff;border-radius:50%;font-size:.55rem;padding:1px 3px;line-height:1">' + c.assignmentHistory.length + '</span>' : ''}
                           </button>
                           <button class="btn-icon" title="Editar"       onclick="Views.showComputerForm('${c.id}')">✏️</button>
                           <button class="btn-icon danger" title="Eliminar" onclick="Views.deleteComputer('${c.id}')">🗑️</button>
                         </div>
                       </td>
                     </tr>`;
        }).join('')}
              </tbody>
            </table>
          </div>
          <div style="margin-top:10px;color:var(--text-muted);font-size:.78rem">
            ${list.length} equipo${list.length !== 1 ? 's' : ''}
            · ${db.computers.filter(c => c.estado === 'ACTIVO').length} activos
            · ${db.computers.filter(c => c.estado === 'BAJA').length} bajas
            · ${db.computers.filter(c => c.estado === 'PERDIDO' || c.estado === 'ROBADA').length} perdidos/robados
          </div>
        </div>`;

    // Listeners de búsqueda/filtro
    document.getElementById('compSearch').addEventListener('input', e => { search = e.target.value; render(); });
    document.getElementById('compStatus').addEventListener('change', e => { filterStatus = e.target.value; render(); });

    // Checkboxes — batch print
    const allChk = document.getElementById('compSelectAll');
    const batchBtn = document.getElementById('batchPrintBtn');
    const countEl = document.getElementById('selectedCount');

    function updateBatchBtn() {
      const checked = document.querySelectorAll('.comp-chk:checked');
      batchBtn.style.display = checked.length > 0 ? '' : 'none';
      countEl.textContent = checked.length;
      allChk.indeterminate = checked.length > 0 && checked.length < document.querySelectorAll('.comp-chk').length;
      allChk.checked = checked.length > 0 && checked.length === document.querySelectorAll('.comp-chk').length;
    }
    allChk.addEventListener('change', () => {
      document.querySelectorAll('.comp-chk').forEach(c => c.checked = allChk.checked);
      updateBatchBtn();
    });
    document.querySelectorAll('.comp-chk').forEach(c => c.addEventListener('change', updateBatchBtn));

    // Guardar referencia a la lista actual para el batch print
    Views._lastComputerList = list;
    Views._printBatchQR = () => {
      const ids = [...document.querySelectorAll('.comp-chk:checked')].map(c => c.dataset.id);
      const comps = ids.map(id => db.computers.find(c => c.id === id)).filter(Boolean);
      if (!comps.length) return;
      const isServer = window.location.protocol !== 'file:';
      const origin = window.location.origin;
      const win = window.open('', '_blank', 'width=800,height=700');
      const labels = comps.map(c => {
        const sender = (c.asignado ? c.asignado.split(' ')[0] : c.puesto) || c.hostname || c.serie || c.id;
        const msg = encodeURIComponent('Hola Alex soy ' + sender + ' me ayudarías por favor');
        const url = isServer ? 'https://wa.me/5213319953714?text=' + msg : (c.hostname || c.serie);
        return `<div class="label" id="lbl-${c.id}">
          <div class="qr" id="qr-${c.id}"></div>
          <div class="info">
            <div class="name">${c.hostname || c.serie}</div>
            <div class="sub">${c.marca || ''} ${c.modelo || ''}</div>
            <div class="sub mono">${c.serie || ''}</div>
            <div class="sub">${c.asignado || ''}</div>
          </div>
        </div>`;
      }).join('');
      win.document.write(`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
        <title>Etiquetas QR — TI Inventario</title>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"><\/script>
        <style>
          *{box-sizing:border-box;margin:0;padding:0}
          body{font-family:system-ui,Arial;background:#fff;padding:16px}
          h2{font-size:.9rem;color:#555;margin-bottom:12px;border-bottom:1px solid #ddd;padding-bottom:8px}
          .grid{display:flex;flex-wrap:wrap;gap:12px}
          .label{display:flex;align-items:center;gap:10px;border:1px solid #ccc;border-radius:8px;padding:10px;width:340px;break-inside:avoid}
          .qr canvas,.qr img{width:90px!important;height:90px!important}
          .info{flex:1;overflow:hidden}
          .name{font-weight:800;font-size:.88rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
          .sub{font-size:.72rem;color:#555;margin-top:2px}
          .mono{font-family:monospace}
          @media print{body{padding:0}h2{display:none}.grid{gap:8px}}
        </style></head><body>
        <h2>🖨️ Etiquetas QR — ${comps.length} equipo${comps.length !== 1 ? 's' : ''} · TI Inventario</h2>
        <div class="grid">${labels}</div>
        <script>
          const comps=${JSON.stringify(comps.map(c => {
        const sender = (c.asignado ? c.asignado.split(' ')[0] : c.puesto) || c.hostname || c.serie || c.id;
        return { id: c.id, url: isServer ? 'https://wa.me/5213319953714?text=' + encodeURIComponent('Hola Alex soy ' + sender + ' me ayudarías por favor') : c.hostname || c.serie };
      }))};
        <\/script>
        <script>
          const isServer='${isServer ? '1' : '0'}' === '1';
          const origin='${isServer ? origin : ''}';
          function renderAll() {
            ${comps.map(c => {
        const sender = (c.asignado ? c.asignado.split(' ')[0] : c.puesto) || c.hostname || c.serie || c.id;
        const msg = encodeURIComponent('Hola Alex soy ' + sender + ' me ayudarías por favor');
        const url = isServer ? 'https://wa.me/5213319953714?text=' + msg : (c.hostname || c.serie);
        return `new QRCode(document.getElementById('qr-${c.id}'),{text:${JSON.stringify(url)},width:90,height:90,correctLevel:QRCode.CorrectLevel.M});`;
      }).join('\n            ')}
            setTimeout(()=>window.print(),800);
          }
          if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',renderAll); else renderAll();
        </script>
      </body></html>`);
      win.document.close();
    };

    if (focusId) {
      const el = document.getElementById(focusId);
      if (el) {
        el.focus();
        if (focusStart !== null) el.setSelectionRange(focusStart, focusStart);
      }
    }
  }
  render();
};

Views.showComputerForm = function (computerId) {
  const db = Storage.get();
  if (!db.computers) db.computers = [];
  const comp = computerId ? db.computers.find(c => c.id === computerId) : null;
  const f = comp || {};
  const title = comp ? `Editar — ${comp.hostname || comp.serie}` : 'Nuevo Equipo de Cómputo';

  const fi = (id, label, ph, val) =>
    `<div class="form-group"><label>${label}</label>
         <input type="text" id="${id}" value="${Utils.esc(val || '')}" placeholder="${ph}"></div>`;

  const html = `
    <div class="form-grid" style="grid-template-columns:1fr 1fr">
      ${fi('fIdNum', '# Inventario', '14', f.idNum)}
      <div class="form-group"><label>Tipo</label>
        <select id="fTipo">
          <option value="Laptop"    ${f.tipo === 'Laptop' ? 'selected' : ''}>Laptop</option>
          <option value="Escritorio"${f.tipo === 'Escritorio' ? 'selected' : ''}>Escritorio</option>
          <option value="Otro"      ${f.tipo === 'Otro' ? 'selected' : ''}>Otro</option>
        </select></div>
      ${fi('fMarca', 'Marca', 'HP, Lenovo…', f.marca)}
      ${fi('fModelo', 'Modelo', 'ProBook 440 G9', f.modelo)}
      ${fi('fSerie', 'Nº de Serie *', '5CD2250R0M', f.serie)}
      ${fi('fHostname', 'Hostname / Nombre equipo', 'CH4-AINIGUEZ', f.hostname)}
      ${fi('fRam', 'RAM', '8 GB', f.ram)}
      ${fi('fRom', 'Almacenamiento', '256 GB', f.rom)}
      <div class="form-group" style="grid-column:1/-1">
        <label>Sistema Operativo</label>
        <input type="text" id="fSo" value="${Utils.esc(f.so || '')}" placeholder="Windows 11 Pro">
      </div>
      ${fi('fAsignado', 'Asignado a', 'Nombre completo', f.asignado)}
      ${fi('fPuesto', 'Puesto', 'Auxiliar contable', f.puesto)}
      ${fi('fDepartamento', 'Departamento', 'Administración', f.departamento)}
      ${fi('fUbicacion', 'Ubicación', 'La Luna / El Salto', f.ubicacion)}
      ${fi('fFechaCompra', 'Fecha de compra', '24/06/2022', f.fechaCompra)}
      ${fi('fGarantia', 'Garantía', '26/06/2023 o S/G', f.garantia)}
      ${fi('fFactura', 'Factura', 'F23677', f.factura)}
      ${fi('fMonitor', 'Monitor (marca)', 'GHIA / HP / LG', f.monitor)}
      ${fi('fSerieMonitor', 'Nº Serie Monitor', 'S24171810653M1323', f.serieMonitor)}
      ${fi('fGarantiaMonitor', 'Garantía Monitor', 'S/G o fecha', f.garantiaMonitor)}
      <div class="form-group"><label>Estado</label>
        <select id="fEstado">
          <option value="ACTIVO"  ${(f.estado || 'ACTIVO') === 'ACTIVO' ? 'selected' : ''}>Activo</option>
          <option value="BAJA"    ${f.estado === 'BAJA' ? 'selected' : ''}>Baja</option>
          <option value="PERDIDO" ${f.estado === 'PERDIDO' ? 'selected' : ''}>Perdido</option>
          <option value="ROBADA"  ${f.estado === 'ROBADA' ? 'selected' : ''}>Robada</option>
        </select></div>
      <div class="form-group"><label>Verificado</label>
        <select id="fVerificado">
          <option value=""   ${!f.verificado ? 'selected' : ''}>—</option>
          <option value="SI" ${f.verificado === 'SI' ? 'selected' : ''}>Sí</option>
          <option value="NO" ${f.verificado === 'NO' ? 'selected' : ''}>No</option>
        </select></div>
      <div class="form-group" style="grid-column:1/-1">
        <label>Comentarios</label>
        <textarea id="fComentarios" rows="3" placeholder="Notas, actualizaciones de hardware, accesorios…">${Utils.esc(f.comentarios || '')}</textarea>
      </div>
      <div style="grid-column:1/-1;display:flex;justify-content:flex-end;gap:10px;margin-top:8px">
        <button class="btn btn-secondary" onclick="Modal.close()">Cancelar</button>
        <button class="btn btn-primary" id="saveCompBtn">💾 Guardar equipo</button>
      </div>
    </div>`;

  Modal.open(title, html, () => {
    document.getElementById('saveCompBtn').addEventListener('click', () => {
      const serie = document.getElementById('fSerie').value.trim();
      if (!serie) { showToast('El número de serie es obligatorio', 'error'); return; }
      const record = {
        id: comp ? comp.id : Utils.id(),
        idNum: document.getElementById('fIdNum').value.trim(),
        tipo: document.getElementById('fTipo').value,
        marca: document.getElementById('fMarca').value.trim(),
        modelo: document.getElementById('fModelo').value.trim(),
        serie,
        hostname: document.getElementById('fHostname').value.trim(),
        ram: document.getElementById('fRam').value.trim(),
        rom: document.getElementById('fRom').value.trim(),
        so: document.getElementById('fSo').value.trim(),
        asignado: document.getElementById('fAsignado').value.trim(),
        puesto: document.getElementById('fPuesto').value.trim(),
        departamento: document.getElementById('fDepartamento').value.trim(),
        ubicacion: document.getElementById('fUbicacion').value.trim(),
        fechaCompra: document.getElementById('fFechaCompra').value.trim(),
        garantia: document.getElementById('fGarantia').value.trim(),
        factura: document.getElementById('fFactura').value.trim(),
        monitor: document.getElementById('fMonitor').value.trim(),
        serieMonitor: document.getElementById('fSerieMonitor').value.trim(),
        garantiaMonitor: document.getElementById('fGarantiaMonitor').value.trim(),
        estado: document.getElementById('fEstado').value,
        verificado: document.getElementById('fVerificado').value,
        comentarios: document.getElementById('fComentarios').value.trim(),
      };
      if (comp) {
        // Detectar cambio de asignación y registrar en historial
        if (!record.assignmentHistory) record.assignmentHistory = comp.assignmentHistory || [];
        if (comp.asignado !== record.asignado || comp.puesto !== record.puesto) {
          record.assignmentHistory.push({
            fecha: new Date().toISOString(),
            de: comp.asignado || '—',
            puestoDe: comp.puesto || '—',
            a: record.asignado || '—',
            puestoA: record.puesto || '—',
          });
        }
        db.computers[db.computers.findIndex(c => c.id === comp.id)] = record;
        showToast('Equipo actualizado ✅', 'success');
      } else {
        record.assignmentHistory = [];
        db.computers.push(record);
        showToast('Equipo registrado ✅', 'success');
      }
      Storage.save(db);
      Modal.close();
      Views.computers();
    });
  });
};

Views.deleteComputer = function (id) {
  if (!confirm('¿Eliminar este equipo del inventario?')) return;
  const db = Storage.get();
  db.computers = db.computers.filter(c => c.id !== id);
  Storage.save(db);
  showToast('Equipo eliminado', 'info');
  Views.computers();
};

Views.showComputerHistory = function (id) {
  const db = Storage.get();
  const comp = db.computers.find(c => c.id === id);
  if (!comp) return;
  const hist = comp.assignmentHistory || [];

  const fmt = iso => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
        + ' ' + d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    } catch { return iso; }
  };

  const timelineHTML = hist.length === 0
    ? `<div style="text-align:center;color:var(--text-muted);padding:32px">
        📋 Sin cambios de asignación registrados.<br>
        <small>Los cambios futuros aparecerán aquí al guardar el equipo.</small>
       </div>`
    : [...hist].reverse().map((h, i) => `
      <div style="display:flex;gap:14px;padding:12px 0;border-bottom:1px solid var(--border)">
        <div style="flex-shrink:0;text-align:center;width:32px">
          <div style="width:32px;height:32px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;font-size:1rem">🔄</div>
          ${i < hist.length - 1 ? '<div style="width:2px;background:var(--border);margin:4px auto 0;height:100%"></div>' : ''}
        </div>
        <div style="flex:1">
          <div style="font-size:.72rem;color:var(--text-muted);margin-bottom:4px">${fmt(h.fecha)}</div>
          <div style="font-size:.82rem">
            <span style="color:var(--danger)">${Utils.esc(h.de)}</span>
            ${h.puestoDe ? '<span style="color:var(--text-muted);font-size:.72rem"> (' + Utils.esc(h.puestoDe) + ')</span>' : ''}
          </div>
          <div style="color:var(--text-muted);font-size:.78rem;margin:2px 0">↓ reasignado a</div>
          <div style="font-size:.82rem">
            <span style="color:var(--success, #3fb950)">${Utils.esc(h.a)}</span>
            ${h.puestoA ? '<span style="color:var(--text-muted);font-size:.72rem"> (' + Utils.esc(h.puestoA) + ')</span>' : ''}
          </div>
        </div>
      </div>`).join('');

  Modal.open(
    `📋 Historial — ${comp.hostname || comp.serie}`,
    `<div style="max-height:60vh;overflow-y:auto;padding-right:4px">${timelineHTML}</div>
     <div style="margin-top:12px;font-size:.72rem;color:var(--text-muted);text-align:center">
       ${hist.length} cambio${hist.length !== 1 ? 's' : ''} de asignación registrado${hist.length !== 1 ? 's' : ''}
     </div>`
  );
};

Views.showComputerQR = function (id) {
  const db = Storage.get();
  const comp = db.computers.find(c => c.id === id);
  if (!comp) return;

  // Si corre en servidor → URL directa (abre tarjeta visual al escanear)
  // Si corre como file:// local → texto plano como fallback
  const isServer = window.location.protocol !== 'file:';
  const sender = (comp.asignado ? comp.asignado.split(' ')[0] : comp.puesto) || comp.hostname || comp.serie || comp.id;
  const qrPayload = isServer
    ? `https://wa.me/5213319953714?text=${encodeURIComponent('Hola Alex soy ' + sender + ' me ayudarías por favor')}`
    : [comp.hostname, 'S/N: ' + comp.serie, (comp.marca || '') + ' ' + (comp.modelo || '')]
      .filter(Boolean).join('\n');

  const esc = s => (s || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const html = `
    <div class="qr-wrap">
      <div style="text-align:center;margin-bottom:6px">
        <span style="font-size:0.72rem;color:var(--text-muted)">
          📱 Escanea para identificar el equipo · 🖨️ Imprime la etiqueta para ver todas las specs
        </span>
      </div>
      <div class="qr-canvas-container">
        <div id="qrContainer" style="line-height:0"></div>
      </div>
      <div class="qr-label">
        <strong>${esc(comp.hostname || comp.serie)}</strong>
        ${comp.marca ? '<br>🖥️ ' + esc(comp.marca) + ' ' + esc(comp.modelo || '') : ''}
        ${comp.asignado ? '<br>👤 ' + esc(comp.asignado) : ''}
        ${comp.departamento ? '<br>🏢 ' + esc(comp.departamento) : ''}
        ${comp.ubicacion ? '<br>📍 ' + esc(comp.ubicacion) : ''}
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center">
        <button class="btn btn-primary"   id="qrPrint"    disabled>🖨️ Imprimir etiqueta</button>
        <button class="btn btn-secondary" id="qrDownload" disabled>⬇️ Descargar QR</button>
      </div>
    </div>`;

  Modal.open(`QR — ${comp.hostname || comp.serie}`, html, () => {
    const container = document.getElementById('qrContainer');
    const printBtn = document.getElementById('qrPrint');
    const downloadBtn = document.getElementById('qrDownload');

    new QRCode(container, {
      text: qrPayload,
      width: 220, height: 220,
      colorDark: '#000000', colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.M
    });

    setTimeout(() => {
      const canvas = container.querySelector('canvas');
      const img = container.querySelector('img');
      if (!canvas && !img) {
        container.innerHTML = '<p style="color:var(--danger)">Error generando QR</p>';
        return;
      }
      // qrcodejs crea un canvas (interno) y un img (visible).
      // Preferimos img.src ya que es el resultado final pintado.
      const dataURL = (img && img.src && img.src.length > 100)
        ? img.src
        : (canvas ? canvas.toDataURL('image/png') : '');
      printBtn.disabled = false;
      downloadBtn.disabled = false;

      // ── Descargar ────────────────────────────────────────────
      downloadBtn.addEventListener('click', () => {
        const a = document.createElement('a');
        a.href = dataURL;
        a.download = `QR-${comp.hostname || comp.serie}.png`;
        a.click();
      });

      // ── Imprimir etiqueta ────────────────────────────────────
      printBtn.addEventListener('click', () => {
        const win = window.open('', '_blank', 'width=520,height=680');
        win.document.write(`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
          <title>Etiqueta — ${esc(comp.hostname || comp.serie)}</title>
          <style>
            *{box-sizing:border-box;margin:0;padding:0}
            body{font-family:system-ui,Arial,sans-serif;padding:20px;color:#111;max-width:480px;margin:0 auto}
            .header{display:flex;align-items:center;gap:16px;margin-bottom:16px;padding-bottom:12px;border-bottom:2px solid #000}
            .qr-img{width:120px;height:120px;flex-shrink:0}
            .title{font-size:1.1rem;font-weight:800;line-height:1.2}
            .sub{font-size:.78rem;color:#555;margin-top:4px}
            .specs{width:100%;border-collapse:collapse;font-size:.8rem}
            .specs td{padding:5px 8px;border-bottom:1px solid #ddd;vertical-align:top}
            .specs td:first-child{font-weight:600;width:130px;color:#444}
            .status{display:inline-block;padding:2px 10px;border-radius:20px;font-size:.75rem;font-weight:700;border:1px solid #000}
            @media print{body{padding:10px}button{display:none}}
          </style></head><body>
          <div class="header">
            <img class="qr-img" src="${dataURL}" alt="QR">
            <div>
              <div class="title">🖥️ ${esc(comp.hostname || comp.serie)}</div>
              <div class="sub">${esc(comp.marca || '')} ${esc(comp.modelo || '')}</div>
              <div class="sub" style="margin-top:6px">
                <span class="status">${esc(comp.estado || 'ACTIVO')}</span>
              </div>
            </div>
          </div>
          <table class="specs">
            <tr><td>Nº de Serie</td><td>${esc(comp.serie || '—')}</td></tr>
            <tr><td>Tipo</td><td>${esc(comp.tipo || '—')}</td></tr>
            <tr><td>RAM</td><td>${esc(comp.ram || '—')}</td></tr>
            <tr><td>Almacenamiento</td><td>${esc(comp.rom || '—')}</td></tr>
            <tr><td>Sistema Op.</td><td>${esc(comp.so || '—')}</td></tr>
            <tr><td>Asignado a</td><td>${esc(comp.asignado || '—')}</td></tr>
            <tr><td>Puesto</td><td>${esc(comp.puesto || '—')}</td></tr>
            <tr><td>Departamento</td><td>${esc(comp.departamento || '—')}</td></tr>
            <tr><td>Ubicación</td><td>${esc(comp.ubicacion || '—')}</td></tr>
            <tr><td>Fecha compra</td><td>${esc(comp.fechaCompra || '—')}</td></tr>
            <tr><td>Garantía</td><td>${esc(comp.garantia || '—')}</td></tr>
            <tr><td>Monitor</td><td>${esc(comp.monitor || '—')}${comp.serieMonitor ? ' / ' + esc(comp.serieMonitor) : ''}</td></tr>
            ${comp.comentarios ? `<tr><td>Comentarios</td><td>${esc(comp.comentarios)}</td></tr>` : ''}
          </table>
          <script>window.onload=()=>{window.print();}<\/script>
        </body></html>`);
        win.document.close();
      });
    }, 300);
  });
};

// ============================================================
// HELPERS
// ============================================================
function updateSidebarFooter() {
  const db = Storage.get();
  const totalEl = document.getElementById('totalItemsFooter');
  const catEl = document.getElementById('totalCatsFooter');
  if (totalEl) totalEl.textContent = db.items.length;
  if (catEl) catEl.textContent = db.categories.length;
}

function updateLoansBadge() {
  const db = Storage.get();
  const active = db.loans.filter(l => !l.dateReturned).length;
  const badge = document.getElementById('loansActiveBadge');
  if (!badge) return;
  if (active > 0) { badge.style.display = 'inline-block'; badge.textContent = active; }
  else { badge.style.display = 'none'; }
}

// ============================================================
// RECURSOS TI — Motor genérico de módulos
// ============================================================
const RECURSOS_SCHEMA = {
  wifi: {
    label: 'WiFi', icon: '📶', fields: [
      { key: 'nombre', label: 'Red / Ubicación', type: 'text', required: true },
      { key: 'ip', label: 'IP Router', type: 'text' },
      { key: 'usuario', label: 'Usuario', type: 'text' },
      { key: 'notas', label: 'Notas', type: 'textarea' },
    ]
  },
  impresoras: {
    label: 'Impresoras', icon: '🖨️', fields: [
      { key: 'nombre', label: 'Nombre', type: 'text', required: true },
      { key: 'ubicacion', label: 'Ubicación', type: 'text' },
      { key: 'ip', label: 'IP', type: 'text' },
      { key: 'modelo', label: 'Modelo', type: 'text' },
      { key: 'usuario', label: 'Usuario', type: 'text' },
      { key: 'password', label: 'Contraseña', type: 'password' },
      { key: 'toner', label: 'Toner', type: 'text' },
      { key: 'notas', label: 'Notas', type: 'textarea' },
    ]
  },
  wallpaper: {
    label: 'Wallpaper', icon: '🖼️', fields: [
      { key: 'nombre', label: 'Nombre', type: 'text', required: true },
      { key: 'ruta', label: 'Ruta / URL', type: 'text' },
      { key: 'usuario', label: 'Usuario', type: 'text' },
      { key: 'notas', label: 'Notas', type: 'textarea' },
    ]
  },

  proveedores: {
    label: 'Proveedores', icon: '🏢', fields: [
      { key: 'empresa', label: 'Empresa', type: 'text', required: true },
      { key: 'telefono', label: 'Teléfono', type: 'text' },
      { key: 'contacto', label: 'Contacto', type: 'text' },
      { key: 'servicios', label: 'Servicios', type: 'text' },
      { key: 'notas', label: 'Notas', type: 'textarea' },
    ]
  },
  glpi: {
    label: 'GLPI Guía', icon: '📋', fields: [
      { key: 'analista', label: 'Analista', type: 'text', required: true },
      { key: 'empresa', label: 'Empresa', type: 'text' },
      { key: 'area', label: 'Área / Módulo', type: 'text' },
      { key: 'email', label: 'Email', type: 'text' },
      { key: 'notas', label: 'Notas', type: 'textarea' },
    ]
  },
  camaras: {
    label: 'Cámaras', icon: '📷', fields: [
      { key: 'nombre', label: 'Sistema / Cámara', type: 'text', required: true },
      { key: 'ubicacion', label: 'Ubicación', type: 'text' },
      { key: 'ip', label: 'IP', type: 'text' },
      { key: 'usuario', label: 'Usuario', type: 'text' },
      { key: 'app', label: 'App / Sistema', type: 'text' },
      { key: 'notas', label: 'Notas', type: 'textarea' },
    ]
  },
  office: {
    label: 'Office', icon: '💼', fields: [
      { key: 'usuario', label: 'Usuario', type: 'text', required: true },
      { key: 'codigo', label: 'Código', type: 'text' },
      { key: 'notas', label: 'Notas', type: 'textarea' },
    ]
  },
  vlan: {
    label: 'VLAN', icon: '🌐', fields: [
      { key: 'red', label: 'Red / IP', type: 'text', required: true },
      { key: 'descripcion', label: 'Descripción', type: 'text' },
      { key: 'notas', label: 'Notas', type: 'textarea' },
    ]
  },
  appsCh4: {
    label: 'Apps CH4', icon: '📱', fields: [
      { key: 'nombre', label: 'App', type: 'text', required: true },
      { key: 'url', label: 'URL', type: 'text' },
      { key: 'usuario', label: 'Usuario', type: 'text' },
      { key: 'password', label: 'Contraseña', type: 'password' },
      { key: 'notas', label: 'Notas', type: 'textarea' },
    ]
  },
  servidores: {
    label: 'Servidores', icon: '🖥️', fields: [
      { key: 'hostname', label: 'Hostname', type: 'text', required: true },
      { key: 'ip', label: 'IP', type: 'text' },
      { key: 'funcion', label: 'Función', type: 'text' },
      { key: 'usuario', label: 'Usuario', type: 'text' },
      { key: 'password', label: 'Contraseña', type: 'password' },
      { key: 'notas', label: 'Notas', type: 'textarea' },
    ]
  },
  paginaCh4: {
    label: 'Página CH4', icon: '🌍', fields: [
      { key: 'nombre', label: 'Nombre', type: 'text', required: true },
      { key: 'tipo', label: 'Tipo', type: 'text' },
      { key: 'url', label: 'URL', type: 'text' },
      { key: 'usuario', label: 'Usuario', type: 'text' },
      { key: 'password', label: 'Contraseña', type: 'password' },
      { key: 'notas', label: 'Notas', type: 'textarea' },
    ]
  },
  vpn: {
    label: 'VPN', icon: '🔒', fields: [
      { key: 'servidor', label: 'Servidor', type: 'text', required: true },
      { key: 'usuario', label: 'Usuario', type: 'text' },
      { key: 'password', label: 'Contraseña', type: 'password' },
      { key: 'notas', label: 'Notas', type: 'textarea' },
    ]
  },
  anydesk: {
    label: 'AnyDesk', icon: '🖱️', fields: [
      { key: 'nombre', label: 'Nombre', type: 'text', required: true },
      { key: 'ubicacion', label: 'Ubicación', type: 'text' },
      { key: 'codigo_any', label: 'Código AnyDesk', type: 'text' },
      { key: 'pass_any', label: 'Pass AnyDesk', type: 'password' },
      { key: 'codigo_rust', label: 'Código RustDesk', type: 'text' },
      { key: 'pass_rust', label: 'Pass RustDesk', type: 'password' },
    ]
  },
};

Views.recurso = function (type) {
  const schema = RECURSOS_SCHEMA[type];
  if (!schema) return;
  const db = Storage.get();
  if (!db.recursos) db.recursos = {};
  if (!db.recursos[type]) db.recursos[type] = [];
  const items = db.recursos[type];
  const tableCols = schema.fields.filter(f => f.type !== 'textarea').slice(0, 5);

  document.getElementById('viewTitle').textContent = `${schema.icon} ${schema.label}`;
  document.getElementById('mainContent').innerHTML = `
    <div class="content fade-in">
      <div class="filter-bar">
        <input class="search-input" id="recursoSearch" placeholder="🔍 Buscar..." oninput="Views._debouncedSearch('${type}', this.value)">
      </div>
      <div class="table-wrap">
        <table id="recursoTable">
          <thead><tr>
            ${tableCols.map(f => `<th>${f.label}</th>`).join('')}
            <th>Acciones</th>
          </tr></thead>
          <tbody id="recursoBody">${Views._recursoRows(type, items, tableCols)}</tbody>
        </table>
      </div>
      <div style="margin-top:10px;font-size:.78rem;color:var(--text-muted)">${items.length} registro${items.length !== 1 ? 's' : ''}</div>
    </div>`;
};

Views._recursoRows = function (type, items, tableCols) {
  if (items.length === 0) return `<tr><td colspan="${tableCols.length + 1}">
    <div class="empty-state"><div class="empty-icon">📭</div>
    <div class="empty-title">Sin registros</div>
    <div class="empty-sub">Haz clic en &quot;+ Agregar&quot; para añadir el primero</div></div>
  </td></tr>`;
  return items.map(item => `
    <tr class="fade-in">
      ${tableCols.map(f => `<td>${f.type === 'password'
    ? `<span class="pwd-val" style="display:none">${Utils.esc(item[f.key] || '')}</span>
             <span class="pwd-mask">••••••••</span>
             <button class="btn btn-secondary btn-icon" style="padding:2px 6px;font-size:.75rem" onclick="var p=this.parentNode;var m=p.querySelector('.pwd-mask');var v=p.querySelector('.pwd-val');if(m.style.display==='none'){m.style.display='';v.style.display='none';this.textContent='👁️';}else{m.style.display='none';v.style.display='';this.textContent='🙈';}">👁️</button>`
    : f.key === 'url' && item[f.key]
      ? `<a href="${Utils.esc(item[f.key])}" target="_blank" style="color:var(--accent)">${Utils.esc(item[f.key]).slice(0, 40)}</a>`
      : Utils.esc(item[f.key] || '—')
    }</td>`).join('')}
      <td><div class="action-btns">
        <button class="btn btn-secondary btn-icon btn-sm" title="Editar" onclick="Views.recursoForm('${type}','${item.id}')">✏️</button>
        ${type === 'impresoras' ? `<button class="btn btn-secondary btn-icon btn-sm" title="QR" onclick="Views.showRecursoQR('${type}','${item.id}')">📷</button>` : ''}
        <button class="btn btn-danger btn-icon btn-sm" title="Eliminar" onclick="Views.deleteRecurso('${type}','${item.id}')">🗑️</button>
      </div></td>
    </tr>`).join('');
};

Views._filterRecursoTable = function (type, q) {
  const schema = RECURSOS_SCHEMA[type];
  const db = Storage.get();
  const all = db.recursos?.[type] || [];
  const filtered = q ? all.filter(item => Object.values(item).some(v => String(v).toLowerCase().includes(q.toLowerCase()))) : all;
  const tableCols = schema.fields.filter(f => f.type !== 'textarea').slice(0, 5);
  document.getElementById('recursoBody').innerHTML = Views._recursoRows(type, filtered, tableCols);
};

Views._searchTimer = null;
Views._debouncedSearch = function (type, value) {
  clearTimeout(Views._searchTimer);
  Views._searchTimer = setTimeout(() => Views._filterRecursoTable(type, value), 350);
};

Views.recursoForm = function (type, id) {
  const schema = RECURSOS_SCHEMA[type];
  const db = Storage.get();
  if (!db.recursos) db.recursos = {};
  if (!db.recursos[type]) db.recursos[type] = [];
  const item = id ? db.recursos[type].find(x => x.id === id) : null;

  const formFields = schema.fields.map(f => `
    <div class="form-group${f.type === 'textarea' ? ' form-full' : ''}">
      <label class="form-label">${f.label}${f.required ? ' *' : ''}</label>
      ${f.type === 'textarea'
      ? `<textarea id="rf_${f.key}" class="form-textarea">${Utils.esc(item?.[f.key] || '')}</textarea>`
      : f.type === 'password'
        ? `<div style="display:flex;gap:6px">
               <input id="rf_${f.key}" type="password" class="form-input" value="${Utils.esc(item?.[f.key] || '')}" style="flex:1">
               <button type="button" class="btn btn-secondary btn-sm" onclick="const i=document.getElementById('rf_${f.key}');i.type=i.type==='password'?'text':'password'">👁️</button>
             </div>`
        : `<input id="rf_${f.key}" type="text" class="form-input" value="${Utils.esc(item?.[f.key] || '')}">`
    }
    </div>`).join('');

  Modal.open(
    `${schema.icon} ${item ? 'Editar' : 'Nuevo'} — ${schema.label}`,
    `<form class="form-grid" onsubmit="return false">
      ${formFields}
      <div class="form-actions form-full">
        <button class="btn btn-secondary" onclick="Modal.close()">Cancelar</button>
        <button class="btn btn-primary" id="recursoSave">💾 Guardar</button>
      </div>
    </form>`,
    () => {
      document.getElementById('recursoSave').addEventListener('click', () => {
        const record = { id: item?.id || Utils.id() };
        for (const f of schema.fields) {
          const el = document.getElementById('rf_' + f.key);
          record[f.key] = el ? el.value.trim() : '';
        }
        const req = schema.fields.find(f => f.required);
        if (req && !record[req.key]) { showToast(`El campo "${req.label}" es requerido`, 'error'); return; }
        if (!db.recursos[type]) db.recursos[type] = [];
        if (item) {
          db.recursos[type][db.recursos[type].findIndex(x => x.id === item.id)] = record;
          showToast(`${schema.label} actualizado ✅`, 'success');
        } else {
          db.recursos[type].push(record);
          showToast(`${schema.label} registrado ✅`, 'success');
        }
        Storage.save(db);
        Modal.close();
        Views.recurso(type);
      });
    }
  );
};

Views.deleteRecurso = function (type, id) {
  const schema = RECURSOS_SCHEMA[type];
  if (!confirm(`¿Eliminar este registro de ${schema.label}?`)) return;
  const db = Storage.get();
  db.recursos[type] = (db.recursos[type] || []).filter(x => x.id !== id);
  Storage.save(db);
  showToast('Registro eliminado', 'info');
  Views.recurso(type);
};

/* ---------- RECURSOS QR ---------- */
Views.showRecursoQR = function (type, itemId) {
  const schema = RECURSOS_SCHEMA[type];
  const db = Storage.get();
  if (!db.recursos?.[type]) return;
  const item = db.recursos[type].find(i => i.id === itemId);
  if (!item) return;

  const isServerMode = window.location.protocol !== 'file:';
  // Genera payload. Si es servidor, asume que existirá una ruta, si es local, concatena data.
  const qrPayload = isServerMode
    ? `${window.location.origin}/recurso/${type}/${item.id}`
    : [item.nombre || item.id, item.ip, item.ubicacion, schema.label].filter(Boolean).join('\\n');

  const html = `
    <div class="qr-wrap">
      <div style="text-align:center;margin-bottom:6px">
        <span style="font-size:0.72rem;color:var(--text-muted)">
          📱 Escanea para identificar · 🖨️ Imprime la etiqueta para ver todos los datos
        </span>
      </div>
      <div class="qr-canvas-container">
        <div id="qrContainer" style="line-height:0"></div>
      </div>
      <div class="qr-label">
        <strong>${Utils.esc(item.nombre || item.id)}</strong>
        <br>${Utils.esc(schema.icon)} ${Utils.esc(schema.label)}
        ${item.ip ? '<br>IP: ' + Utils.esc(item.ip) : ''}
        ${item.ubicacion ? '<br>📍 ' + Utils.esc(item.ubicacion) : ''}
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center">
        <button class="btn btn-primary"   id="qrPrint"    disabled>🖨️ Imprimir etiqueta</button>
        <button class="btn btn-secondary" id="qrDownload" disabled>⬇️ Descargar QR</button>
      </div>
    </div>`;

  Modal.open(`QR — ${item.nombre || schema.label}`, html, () => {
    const container = document.getElementById('qrContainer');
    const printBtn = document.getElementById('qrPrint');
    const downloadBtn = document.getElementById('qrDownload');

    new QRCode(container, {
      text: qrPayload,
      width: 220,
      height: 220,
      colorDark: '#000000',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    });

    setTimeout(() => {
      const canvas = container.querySelector('canvas');
      if (!canvas) {
        container.innerHTML = '<p style="color:var(--danger)">Error generando QR</p>';
        return;
      }

      let qrDataURL;
      try { qrDataURL = canvas.toDataURL('image/png'); }
      catch (e) { }

      printBtn.disabled = false;
      downloadBtn.disabled = false;

      printBtn.addEventListener('click', () => {
        const w = window.open('', '_blank', 'width=600,height=500');
        if (!w) { showToast('Permite ventanas emergentes para este sitio.', 'error', 5000); return; }

        const qrSrc = qrDataURL ? `<img src="${qrDataURL}" style="width:160px;height:160px">` : '';
        const rows = schema.fields.filter(f => f.type !== 'textarea').map(f => {
          return ['📍 ' + f.label, item[f.key] || null];
        }).filter(([, v]) => v !== null);

        w.document.write(`<!DOCTYPE html><html><head><title>${Utils.esc(item.nombre || schema.label)}</title>
                <style>
                  *{box-sizing:border-box;margin:0;padding:0}
                  body{font-family:Arial,sans-serif;background:#fff;padding:24px}
                  .wrap{display:flex;gap:20px;align-items:flex-start;border:2px solid #e0e0e0;border-radius:12px;padding:20px;max-width:540px}
                  .qr-side{flex-shrink:0;display:flex;flex-direction:column;align-items:center;gap:6px}
                  .qr-side small{font-size:8px;color:#888;text-align:center;max-width:160px}
                  .info{flex:1}
                  .tit{font-size:1rem;font-weight:800;margin-bottom:2px;color:#111}
                  .cat{font-size:.75rem;color:#4f9cf9;margin-bottom:10px}
                  table{width:100%;border-collapse:collapse;font-size:.75rem}
                  td{padding:5px 0;border-bottom:1px solid #f0f0f0;vertical-align:top}
                  td:first-child{color:#888;width:80px;padding-right:8px}
                  tr:last-child td{border-bottom:none}
                  @media print{@page{margin:.5cm}body{padding:0}}
                </style></head><body>
                <div class="wrap">
                  <div class="qr-side">
                    ${qrSrc}
                    <small>Escanear para ver detalles</small>
                  </div>
                  <div class="info">
                    <div class="tit">${Utils.esc(item.nombre || schema.label)}</div>
                    <div class="cat">${Utils.esc(schema.icon)} ${Utils.esc(schema.label)}</div>
                    <table>${rows.map(([l, v]) => `<tr><td>${l}</td><td><strong>${Utils.esc(String(v))}</strong></td></tr>`).join('')}</table>
                  </div>
                </div>
                </body></html>`);
        w.document.close();
        w.focus();
        setTimeout(() => { w.print(); }, 400);
      });

      downloadBtn.addEventListener('click', () => {
        if (!qrDataURL) { showToast('No se pudo exportar', 'error'); return; }
        const a = document.createElement('a');
        a.download = 'QR_' + (item.nombre || type).replace(/[^a-zA-Z0-9]/g, '_') + '.png';
        a.href = qrDataURL;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      });
    }, 150);
  });
};

// ============================================================
// AUTH
// ============================================================
// ============================================================
// AUTH
// ============================================================

function setupLogin() {
  const ov = document.getElementById('loginOverlay');
  const err = document.getElementById('loginErr');
  ov.style.display = 'flex';
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const u = document.getElementById('loginUser').value.trim();
    const p = document.getElementById('loginPass').value;
    const b = document.getElementById('loginBranch').value;

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: u, pass: p })
      });
      const data = await res.json();

      if (data.ok) {
        sessionStorage.setItem('ti_auth', '1');
        sessionStorage.setItem('ti_token', data.token);
        sessionStorage.setItem('ti_user', data.user);
        sessionStorage.setItem('ti_branch', b);
        ov.style.display = 'none';
        err.style.display = 'none';
        await initApp();
      } else {
        err.textContent = '❌ ' + (data.error || 'Credenciales incorrectas');
        err.style.display = 'block';
        document.getElementById('loginPass').value = '';
      }
    } catch (ex) {
      err.textContent = '❌ Error de conexión al servidor';
      err.style.display = 'block';
      console.error(ex);
    }
  });
}

// ============================================================
// INIT
// ============================================================
async function init() {
  if (!sessionStorage.getItem('ti_auth') || (Storage._serverMode && !sessionStorage.getItem('ti_token'))) {
    sessionStorage.removeItem('ti_auth'); // clear legacy
    sessionStorage.removeItem('ti_user');
    setupLogin();
    return;
  }
  await initApp();
}

async function initApp() {
  // Cargar datos desde servidor (o localStorage si es local)
  await Storage.init();

  const branch = sessionStorage.getItem('ti_branch');
  const branchNameElement = document.getElementById('sidebarBranchName');
  if (branchNameElement) {
    if (branch === 'alberta') {
      branchNameElement.textContent = 'Corporativo Alberta';
    } else if (branch === 'salto') {
      branchNameElement.textContent = 'Planta El Salto';
    } else {
      branchNameElement.textContent = 'Corporativo La luna';
    }
  }

  // Register views
  Router.register('dashboard', Views.dashboard);
  Router.register('inventory', Views.inventory);
  Router.register('loans', Views.loans);
  Router.register('employees', Views.employees);
  Router.register('movements', Views.movements);
  Router.register('categories', Views.categories);
  Router.register('computers', Views.computers);
  // Recursos TI
  Object.keys(RECURSOS_SCHEMA).forEach(t => Router.register(t, () => Views.recurso(t)));

  // AddActions para Recursos TI
  Object.keys(RECURSOS_SCHEMA).forEach(t => { AddActions[t] = () => Views.recursoForm(t); });

  // Nav links
  document.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      Router.navigate(el.dataset.view);
    });
  });

  // Mobile sidebar toggle
  document.getElementById('menuBtn').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });
  document.getElementById('sidebarToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.remove('open');
  });

  // Modal close
  document.getElementById('modalClose').addEventListener('click', Modal.close);
  document.getElementById('modalOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modalOverlay')) Modal.close();
  });

  // Global add button
  document.getElementById('globalAddBtn').addEventListener('click', () => {
    const action = AddActions[Router.current];
    if (action) action();
  });

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', () => {
    if (confirm('¿Cerrar sesión?')) {
      sessionStorage.removeItem('ti_auth');
      sessionStorage.removeItem('ti_token');
      sessionStorage.removeItem('ti_user');
      location.reload();
    }
  });

  // Initial render
  Router.navigate('dashboard');
  updateSidebarFooter();
  updateLoansBadge();
}

document.addEventListener('DOMContentLoaded', init);
