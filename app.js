const STORAGE_KEY = "sole-demo-state-v1";
const LOGO_URL =
  "https://static.wixstatic.com/media/bc50f0_f32f54744d164a4c95cdcdc127e1077f~mv2.png/v1/fill/w_206,h_54,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/logotipo_enpolex.png";

function clone(value) {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function readStorage(key) {
  try {
    return window.localStorage ? window.localStorage.getItem(key) : null;
  } catch {
    return null;
  }
}

function writeStorage(key, value) {
  try {
    if (window.localStorage) window.localStorage.setItem(key, value);
  } catch {
    /* La app tambien debe funcionar abierta como archivo local. */
  }
}

function makeId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  return `evt-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const seedState = {
  userRole: null,
  selectedOrderId: "PED-1048",
  selectedDriverId: "DRV-01",
  adminTab: "analysis",
  offline: false,
  syncQueue: [],
  orders: [
    {
      id: "PED-1048",
      client: "Constructora Andina",
      address: "Av. Colón 4210, Córdoba",
      zone: "Norte",
      priority: "Alta",
      packages: 8,
      weight: "140 kg",
      status: "assigned",
      driverId: "DRV-01",
      vehicleId: "VH-12",
      eta: "10:25",
      proof: null,
      issue: null,
      coords: { x: 24, y: 32 },
      events: [
        { at: "08:10", text: "Pedido disponible para despacho" },
        { at: "08:32", text: "Asignado a ruta Norte 01" },
      ],
    },
    {
      id: "PED-1051",
      client: "Heladería Glaciar",
      address: "Bv. Los Alemanes 3180, Córdoba",
      zone: "Norte",
      priority: "Media",
      packages: 4,
      weight: "52 kg",
      status: "route",
      driverId: "DRV-01",
      vehicleId: "VH-12",
      eta: "11:05",
      proof: null,
      issue: null,
      coords: { x: 47, y: 23 },
      events: [
        { at: "08:14", text: "Pedido disponible para despacho" },
        { at: "08:35", text: "Asignado a ruta Norte 01" },
        { at: "09:05", text: "Ruta iniciada por el chofer" },
      ],
    },
    {
      id: "PED-1055",
      client: "Distribuidora Sierras",
      address: "Monseñor Pablo Cabrera 5421, Córdoba",
      zone: "Norte",
      priority: "Media",
      packages: 11,
      weight: "220 kg",
      status: "pending",
      driverId: null,
      vehicleId: null,
      eta: "Sin asignar",
      proof: null,
      issue: null,
      coords: { x: 63, y: 39 },
      events: [{ at: "08:20", text: "Pedido disponible para despacho" }],
    },
    {
      id: "PED-1060",
      client: "Obra Nueva Italia",
      address: "Roma 1260, Córdoba",
      zone: "Este",
      priority: "Alta",
      packages: 16,
      weight: "310 kg",
      status: "pending",
      driverId: null,
      vehicleId: null,
      eta: "Sin asignar",
      proof: null,
      issue: null,
      coords: { x: 78, y: 56 },
      events: [{ at: "08:44", text: "Pedido disponible para despacho" }],
    },
    {
      id: "PED-1063",
      client: "Mercado Integral",
      address: "Ruta 20 Km 9, Córdoba",
      zone: "Oeste",
      priority: "Baja",
      packages: 6,
      weight: "84 kg",
      status: "issue",
      driverId: "DRV-02",
      vehicleId: "VH-07",
      eta: "Demorado",
      proof: null,
      issue: "Cliente solicita reprogramación",
      coords: { x: 16, y: 69 },
      events: [
        { at: "08:45", text: "Asignado a ruta Oeste 02" },
        { at: "10:12", text: "Incidencia reportada: cliente solicita reprogramación" },
      ],
    },
    {
      id: "PED-1067",
      client: "EPS Center",
      address: "San Jerónimo 2200, Córdoba",
      zone: "Centro",
      priority: "Media",
      packages: 5,
      weight: "66 kg",
      status: "delivered",
      driverId: "DRV-03",
      vehicleId: "VH-03",
      eta: "Entregado",
      proof: "Foto de remito y firma",
      issue: null,
      coords: { x: 52, y: 72 },
      events: [
        { at: "09:22", text: "Ruta iniciada por el chofer" },
        { at: "09:58", text: "Entrega confirmada con evidencia digital" },
      ],
    },
  ],
  drivers: [
    {
      id: "DRV-01",
      name: "Martín Ferreyra",
      vehicleId: "VH-12",
      route: "Norte 01",
      status: "En ruta",
      phone: "351 555 0182",
      location: { x: 40, y: 28 },
    },
    {
      id: "DRV-02",
      name: "Carla Moyano",
      vehicleId: "VH-07",
      route: "Oeste 02",
      status: "Con incidencia",
      phone: "351 555 0134",
      location: { x: 16, y: 69 },
    },
    {
      id: "DRV-03",
      name: "Diego Torres",
      vehicleId: "VH-03",
      route: "Centro 03",
      status: "Disponible",
      phone: "351 555 0110",
      location: { x: 52, y: 72 },
    },
  ],
  vehicles: [
    { id: "VH-12", plate: "AB 482 QL", type: "Camión mediano", capacity: "900 kg" },
    { id: "VH-07", plate: "AC 119 KD", type: "Camioneta", capacity: "450 kg" },
    { id: "VH-03", plate: "AA 921 FC", type: "Camión liviano", capacity: "650 kg" },
  ],
};

let state = loadState();
let signatureCanvasBound = false;

function loadState() {
  const saved = readStorage(STORAGE_KEY);
  if (!saved) return clone(seedState);
  try {
    return { ...clone(seedState), ...JSON.parse(saved) };
  } catch {
    return clone(seedState);
  }
}

function saveState() {
  writeStorage(STORAGE_KEY, JSON.stringify(state));
}

function resetState() {
  state = clone(seedState);
  saveState();
  render();
  toast("Datos de la demo reiniciados");
}

function setRole(role) {
  state.userRole = role;
  saveState();
  render();
}

function logout() {
  state.userRole = null;
  saveState();
  render();
}

function nowTime() {
  return new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}

function statusLabel(status) {
  return {
    pending: "Pendiente",
    assigned: "Asignado",
    route: "En ruta",
    delivered: "Entregado",
    issue: "Incidencia",
    sync: "Pendiente sync",
  }[status] || status;
}

function statusClass(status) {
  return {
    pending: "pending",
    assigned: "assigned",
    route: "route",
    delivered: "delivered",
    issue: "issue",
    sync: "sync",
  }[status] || "pending";
}

function driverById(id) {
  return state.drivers.find((driver) => driver.id === id);
}

function vehicleById(id) {
  return state.vehicles.find((vehicle) => vehicle.id === id);
}

function addEvent(order, text) {
  const last = order.events[order.events.length - 1];
  if (last && last.text === text) return;
  order.events.push({ at: nowTime(), text });
}

function selectedDriver() {
  return driverById(state.selectedDriverId) || state.drivers[0];
}

function selectedOrder() {
  return state.orders.find((order) => order.id === state.selectedOrderId) || state.orders[0];
}

function routeOrders(driverId = state.selectedDriverId) {
  return state.orders
    .filter((order) => order.driverId === driverId)
    .sort((a, b) => a.coords.x - b.coords.x);
}

function metrics() {
  const total = state.orders.length;
  const delivered = state.orders.filter((o) => o.status === "delivered").length;
  const issues = state.orders.filter((o) => o.status === "issue").length;
  const pending = state.orders.filter((o) => o.status === "pending").length;
  const inRoute = state.orders.filter((o) => o.status === "route" || o.status === "assigned").length;
  return { total, delivered, issues, pending, inRoute };
}

function render() {
  signatureCanvasBound = false;
  const app = document.querySelector("#app");
  if (!state.userRole) {
    app.innerHTML = shell(renderLanding(), "");
    return;
  }
  app.innerHTML = shell(state.userRole === "admin" ? renderAdmin() : renderDriver(), renderSessionActions());
  if (state.userRole === "driver") bindSignatureCanvas();
}

function shell(content, actions) {
  return `
    <div class="app-shell">
      <header class="topbar">
        <div class="brand-lockup">
          <img class="brand-logo" src="${LOGO_URL}" alt="Enpolex" />
          <div>
            <p class="brand-name">SOLE</p>
            <p class="brand-subtitle">Sistema de Optimización Logística Enpolex</p>
          </div>
        </div>
        <div class="session-actions">${actions}</div>
      </header>
      ${content}
    </div>
  `;
}

function renderSessionActions() {
  const role = state.userRole === "admin" ? "Administrador" : "Chofer";
  const sync = state.syncQueue.length;
  return `
    <span class="pill"><span class="dot ${state.offline ? "warn" : ""}"></span>${state.offline ? "Offline" : "Online"}</span>
    ${sync ? `<span class="pill"><span class="dot warn"></span>${sync} cambios pendientes</span>` : ""}
    <span class="pill">${role}</span>
    <button class="btn ghost" onclick="logout()">Salir</button>
  `;
}

function renderLanding() {
  return `
    <main class="landing">
      <section class="landing-copy">
        <h1>SOLE</h1>
        <p class="product-kicker">Sistema de Optimización Logística</p>
        <p class="product-subtitle">Gestión de entregas para administración y choferes.</p>
      </section>
      <section class="role-panel">
        <h2>Ingresar</h2>
        <button class="role-card" onclick="setRole('admin')">
          <div class="role-icon">AD</div>
          <div>
            <strong>Admin</strong>
            <span>Gestión logística, pedidos, choferes y análisis de entregas.</span>
          </div>
          <strong class="arrow">→</strong>
        </button>
        <button class="role-card driver" onclick="setRole('driver')">
          <div class="role-icon">CH</div>
          <div>
            <strong>Chofer</strong>
            <span>Ruta diaria, paradas, confirmación de entrega, evidencia e incidencias.</span>
          </div>
          <strong class="arrow">→</strong>
        </button>
      </section>
    </main>
  `;
}

function renderAdmin() {
  const m = metrics();
  return `
    <main class="main">
      <div class="section-header">
        <div>
          <h2>Panel administrativo</h2>
          <p>Gestión de pedidos, asignación de choferes y análisis operativo de entregas.</p>
        </div>
        <div class="toolbar">
          <button class="btn ghost" onclick="resetState()">Reiniciar demo</button>
        </div>
      </div>
      ${renderAdminTabs()}
      <section class="kpi-grid">
        <div class="kpi"><span>Total pedidos</span><strong>${m.total}</strong></div>
        <div class="kpi"><span>En operación</span><strong>${m.inRoute}</strong></div>
        <div class="kpi"><span>Entregados</span><strong>${m.delivered}</strong></div>
        <div class="kpi"><span>Incidencias</span><strong>${m.issues}</strong></div>
      </section>
      ${renderAdminTabContent()}
    </main>
  `;
}

function renderAdminTabs() {
  const tabs = [
    ["analysis", "Análisis de entregas"],
    ["orders", "Pedidos"],
    ["drivers", "Choferes"],
  ];
  return `
    <nav class="tabs" aria-label="Secciones de administración">
      ${tabs
        .map(
          ([id, label]) =>
            `<button class="tab ${state.adminTab === id ? "active" : ""}" onclick="setAdminTab('${id}')">${label}</button>`,
        )
        .join("")}
    </nav>
  `;
}

function renderAdminTabContent() {
  if (state.adminTab === "orders") return renderAdminOrdersView();
  if (state.adminTab === "drivers") return renderDriversView();
  return renderAnalysisView();
}

function renderAnalysisView() {
  const byStatus = ["pending", "assigned", "route", "delivered", "issue"].map((status) => {
    const count = state.orders.filter((order) => order.status === status).length;
    return { status, count, pct: Math.round((count / state.orders.length) * 100) };
  });
  const byDriver = state.drivers.map((driver) => {
    const orders = routeOrders(driver.id);
    const delivered = orders.filter((order) => order.status === "delivered").length;
    const issues = orders.filter((order) => order.status === "issue").length;
    return { driver, total: orders.length, delivered, issues };
  });
  return `
    <section class="grid analysis-grid">
      <div class="panel">
        <div class="panel-head">
          <h3>Estado de entregas</h3>
          <span class="pill">Día operativo</span>
        </div>
        <div class="panel-body">
          <div class="status-bars">
            ${byStatus
              .map(
                (item) => `
                  <div class="status-bar-row">
                    <div class="item-row">
                      <strong>${statusLabel(item.status)}</strong>
                      <span>${item.count} pedidos</span>
                    </div>
                    <div class="bar"><div style="width:${item.pct}%"></div></div>
                  </div>
                `,
              )
              .join("")}
          </div>
        </div>
      </div>
      <div class="panel">
        <div class="panel-head">
          <h3>Rendimiento por chofer</h3>
          <span class="pill">${state.drivers.length} choferes</span>
        </div>
        <div class="panel-body">
          <table class="data-table">
            <thead>
              <tr>
                <th>Chofer</th>
                <th>Ruta</th>
                <th>Pedidos</th>
                <th>Entregados</th>
                <th>Incidencias</th>
              </tr>
            </thead>
            <tbody>
              ${byDriver
                .map(
                  (row) => `
                    <tr>
                      <td>${row.driver.name}</td>
                      <td>${row.driver.route}</td>
                      <td>${row.total}</td>
                      <td>${row.delivered}</td>
                      <td>${row.issues}</td>
                    </tr>
                  `,
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `;
}

function renderAdminOrdersView() {
  return `
    <section class="grid admin-orders-grid">
      ${renderOrdersPanel()}
      ${renderAdminSidePanel()}
    </section>
  `;
}

function renderDriversView() {
  return `
    <section class="panel">
      <div class="panel-head">
        <h3>Choferes y vehículos</h3>
        <span class="pill">${state.drivers.length} activos</span>
      </div>
      <div class="panel-body">
        <table class="data-table">
          <thead>
            <tr>
              <th>Chofer</th>
              <th>Teléfono</th>
              <th>Ruta</th>
              <th>Vehículo</th>
              <th>Estado</th>
              <th>Pedidos asignados</th>
            </tr>
          </thead>
          <tbody>
            ${state.drivers
              .map((driver) => {
                const vehicle = vehicleById(driver.vehicleId);
                return `
                  <tr>
                    <td>${driver.name}</td>
                    <td>${driver.phone}</td>
                    <td>${driver.route}</td>
                    <td>${vehicle ? `${vehicle.plate} · ${vehicle.type}` : driver.vehicleId}</td>
                    <td>${driver.status}</td>
                    <td>${routeOrders(driver.id).length}</td>
                  </tr>
                `;
              })
              .join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderOrdersPanel() {
  return `
    <div class="panel">
      <div class="panel-head">
        <h3>Pedidos del día</h3>
        <span class="pill">${metrics().pending} pendientes</span>
      </div>
      <div class="panel-body">
        <table class="data-table orders-table">
          <thead>
            <tr>
              <th>Pedido</th>
              <th>Cliente</th>
              <th>Paquete</th>
              <th>Zona</th>
              <th>Estado</th>
              <th>Chofer</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${state.orders.map(renderOrderRow).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderOrderRow(order) {
  const active = order.id === state.selectedOrderId ? "active" : "";
  return `
    <tr class="${active}" onclick="selectOrder('${order.id}')">
      <td><strong>${order.id}</strong><br /><span>${order.priority}</span></td>
      <td>${order.client}<br /><span>${order.address}</span></td>
      <td>${order.packages} bultos<br /><span>${order.weight}</span></td>
      <td>${order.zone}</td>
      <td><span class="status ${statusClass(order.status)}">${statusLabel(order.status)}</span></td>
      <td onclick="event.stopPropagation()">
        <select class="table-select" onchange="assignOrderToDriver('${order.id}', this.value)">
          <option value="">Sin asignar</option>
          ${state.drivers
            .map(
              (driver) =>
                `<option value="${driver.id}" ${driver.id === order.driverId ? "selected" : ""}>${driver.name}</option>`,
            )
            .join("")}
        </select>
      </td>
      <td><button class="btn ghost table-btn" onclick="event.stopPropagation(); selectOrder('${order.id}')">Ver</button></td>
    </tr>
  `;
}

function renderOrderCard(order) {
  const active = order.id === state.selectedOrderId ? "active" : "";
  const driver = order.driverId ? driverById(order.driverId) : null;
  return `
    <article class="order-card ${active}" onclick="selectOrder('${order.id}')">
      <div class="item-row">
        <div>
          <h4 class="item-title">${order.id} · ${order.client}</h4>
          <p class="item-subtitle">${order.address}</p>
        </div>
        <span class="status ${statusClass(order.status)}">${statusLabel(order.status)}</span>
      </div>
      <p class="item-subtitle">Zona ${order.zone} · ${order.packages} bultos · ${order.weight}</p>
      <p class="item-subtitle">${driver ? `Chofer: ${driver.name}` : "Sin chofer asignado"} · ETA: ${order.eta}</p>
      <div class="field compact-field" onclick="event.stopPropagation()">
        <label>Asignar chofer</label>
        <select onchange="assignOrderToDriver('${order.id}', this.value)">
          <option value="">Sin asignar</option>
          ${state.drivers
            .map(
              (item) =>
                `<option value="${item.id}" ${item.id === order.driverId ? "selected" : ""}>${item.name} · ${item.route}</option>`,
            )
            .join("")}
        </select>
      </div>
      <div class="mini-actions">
        ${
          order.status === "pending"
            ? `<button class="btn primary" onclick="event.stopPropagation(); assignOrder('${order.id}')">Asignar</button>`
            : ""
        }
        ${
          order.status !== "delivered"
            ? `<button class="btn ghost" onclick="event.stopPropagation(); markIssue('${order.id}')">Incidencia</button>`
            : ""
        }
      </div>
    </article>
  `;
}

function renderAdminSidePanel() {
  const order = selectedOrder();
  const driver = order.driverId ? driverById(order.driverId) : null;
  const vehicle = order.vehicleId ? vehicleById(order.vehicleId) : null;
  return `
    <div class="panel">
      <div class="panel-head">
        <h3>Detalle del paquete</h3>
        <span class="status ${statusClass(order.status)}">${statusLabel(order.status)}</span>
      </div>
      <div class="panel-body">
        <div class="detail-grid">
          <div class="detail"><span>Pedido</span><strong>${order.id}</strong></div>
          <div class="detail"><span>Prioridad</span><strong>${order.priority}</strong></div>
          <div class="detail"><span>Cliente</span><strong>${order.client}</strong></div>
          <div class="detail"><span>Zona</span><strong>${order.zone}</strong></div>
          <div class="detail"><span>Bultos</span><strong>${order.packages}</strong></div>
          <div class="detail"><span>Peso</span><strong>${order.weight}</strong></div>
          <div class="detail"><span>Chofer</span><strong>${driver ? driver.name : "Sin asignar"}</strong></div>
          <div class="detail"><span>Vehículo</span><strong>${vehicle ? vehicle.plate : "Sin asignar"}</strong></div>
        </div>
        <div class="field" style="margin-top:14px;">
          <label>Dirección</label>
          <input value="${order.address}" readonly />
        </div>
        <div class="field">
          <label>Observación operativa</label>
          <textarea readonly>${order.issue || order.proof || "Sin observaciones registradas"}</textarea>
        </div>
        <div class="mini-actions">
          <button class="btn primary" onclick="assignOrder('${order.id}')">Asignar a ${selectedDriver().name.split(" ")[0]}</button>
          <button class="btn warn" onclick="advanceOrder('${order.id}')">Avanzar estado</button>
        </div>
        ${renderEventsTable(order.events)}
      </div>
    </div>
  `;
}

function renderDriver() {
  const driver = selectedDriver();
  const orders = routeOrders(driver.id);
  const delivered = orders.filter((order) => order.status === "delivered").length;
  const progress = orders.length ? Math.round((delivered / orders.length) * 100) : 0;
  const activeOrder = orders.find((order) => order.status === "route") || orders.find((order) => order.status === "assigned") || orders[0];
  if (activeOrder) state.selectedOrderId = activeOrder.id;
  return `
    <main class="main driver-shell">
      <div class="section-header">
        <div>
          <h2>App del chofer</h2>
          <p>Ruta diaria, paradas, evidencia digital, incidencias y sincronización de campo.</p>
        </div>
        <div class="toolbar">
          <button class="btn ${state.offline ? "warn" : "ghost"}" onclick="toggleOffline()">${state.offline ? "Volver online" : "Simular offline"}</button>
          <button class="btn primary" onclick="syncPending()">Sincronizar</button>
        </div>
      </div>
      <section class="grid driver-grid">
        <div class="panel driver-route-panel">
          <div class="driver-hero">
            <div>
              <p class="eyebrow">Ruta asignada</p>
              <h2>${driver.route}</h2>
              <p>${driver.name} · ${driver.vehicleId} · ${driver.status}</p>
            </div>
            <span class="pill">${delivered}/${orders.length} entregas</span>
          </div>
          <div class="panel-body">
            <div class="item-row">
              <strong>${progress}% completado</strong>
              <span class="pill">${state.offline ? "Cambios locales" : "Sincronizado"}</span>
            </div>
            <div class="route-progress" style="margin-top:10px;"><div style="width:${progress}%"></div></div>
            <div class="list driver-stop-list">
              ${orders.length ? orders.map(renderStopCard).join("") : `<div class="empty">No hay ruta asignada para este chofer.</div>`}
            </div>
            ${orders.length ? renderDriverRouteMap(driver, orders) : ""}
          </div>
        </div>
        ${renderDriverActionPanel(activeOrder)}
      </section>
    </main>
  `;
}

function renderDriverRouteMap(driver, orders) {
  const polyline = orders.map((order) => `${order.coords.x},${order.coords.y}`).join(" ");
  return `
    <div class="driver-map-block">
      <div class="item-row">
        <strong>Mapa de ruta</strong>
        <span class="pill">${driver.route}</span>
      </div>
      <div class="map-panel driver-map">
        <svg class="route-line" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline points="${polyline}" fill="none" stroke="#00a6cf" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="2 1"></polyline>
        </svg>
        ${orders
          .map((order, index) => {
            const current = order.status === "route" || order.id === state.selectedOrderId ? "current" : "";
            const done = order.status === "delivered" ? "done" : "";
            const issue = order.status === "issue" ? "issue" : "";
            return `<button class="map-stop ${current} ${done} ${issue}" style="left:${order.coords.x}%;top:${order.coords.y}%;" onclick="selectOrder('${order.id}')" title="${order.client}">${index + 1}</button>`;
          })
          .join("")}
        <div class="truck" style="left:${driver.location.x}%;top:${driver.location.y}%;" title="Unidad ${driver.vehicleId}">▣</div>
      </div>
    </div>
  `;
}

function renderStopCard(order) {
  const active = order.id === state.selectedOrderId ? "active" : "";
  return `
    <article class="stop-card ${active}" onclick="selectOrder('${order.id}')">
      <div class="item-row">
        <div>
          <h4 class="item-title">${order.client}</h4>
          <p class="item-subtitle">${order.address}</p>
        </div>
        <span class="status ${statusClass(order.status)}">${statusLabel(order.status)}</span>
      </div>
      <p class="item-subtitle">${order.id} · ${order.packages} bultos · ETA ${order.eta}</p>
    </article>
  `;
}

function renderDriverActionPanel(activeOrder) {
  const order = selectedOrder();
  if (!activeOrder && !order) {
    return `<div class="panel"><div class="panel-body"><div class="empty">Sin entregas para operar.</div></div></div>`;
  }
  const target = order.driverId === state.selectedDriverId ? order : activeOrder;
  return `
    <div class="panel">
      <div class="panel-head">
        <h3>Entrega seleccionada</h3>
        <span class="status ${statusClass(target.status)}">${statusLabel(target.status)}</span>
      </div>
      <div class="panel-body">
        <div class="detail-grid">
          <div class="detail"><span>Pedido</span><strong>${target.id}</strong></div>
          <div class="detail"><span>Bultos</span><strong>${target.packages}</strong></div>
          <div class="detail"><span>Cliente</span><strong>${target.client}</strong></div>
          <div class="detail"><span>Prioridad</span><strong>${target.priority}</strong></div>
        </div>
        <div class="field" style="margin-top:14px;">
          <label>Dirección</label>
          <input value="${target.address}" readonly />
        </div>
        <div class="mini-actions">
          <button class="btn primary" onclick="driverStartRoute('${target.id}')">Iniciar / llegar</button>
          <button class="btn dark" onclick="driverDeliver('${target.id}')">Confirmar entrega</button>
          <button class="btn danger" onclick="driverIssue('${target.id}')">Reportar incidencia</button>
        </div>
        <div class="field" style="margin-top:16px;">
          <label>Evidencia digital</label>
          <select id="proofType">
            <option>Foto del remito firmado</option>
            <option>Firma digital del receptor</option>
            <option>Foto de mercadería entregada</option>
          </select>
        </div>
        <canvas id="signatureCanvas" class="signature"></canvas>
        <div class="field" style="margin-top:12px;">
          <label>Comentario</label>
          <textarea id="driverComment" placeholder="Observaciones de entrega o incidencia">${target.issue || ""}</textarea>
        </div>
        ${renderEventsTable(target.events)}
      </div>
    </div>
  `;
}

function renderEventsTable(events) {
  const rows = events
    .slice()
    .reverse()
    .map(
      (event) => `
        <tr>
          <td>${event.at}</td>
          <td>${event.text}</td>
        </tr>
      `,
    )
    .join("");
  return `
    <div class="events-table-wrap">
      <table class="events-table">
        <thead>
          <tr>
            <th>Hora</th>
            <th>Evento</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function selectOrder(id) {
  state.selectedOrderId = id;
  saveState();
  render();
}

function setAdminTab(tab) {
  state.adminTab = tab;
  saveState();
  render();
}

function selectDriver(id) {
  state.selectedDriverId = id;
  saveState();
  render();
}

function assignOrder(orderId) {
  assignOrderToDriver(orderId, state.selectedDriverId);
}

function assignOrderToDriver(orderId, driverId) {
  const order = state.orders.find((item) => item.id === orderId);
  const driver = driverById(driverId);
  if (!order) return;
  if (!driver) {
    order.driverId = null;
    order.vehicleId = null;
    order.status = "pending";
    order.eta = "Sin asignar";
    addEvent(order, "Asignación de chofer removida");
    saveState();
    render();
    toast(`${order.id} quedó sin chofer asignado`);
    return;
  }
  order.driverId = driver.id;
  order.vehicleId = driver.vehicleId;
  order.status = order.status === "pending" ? "assigned" : order.status;
  order.eta = estimateEta(order);
  addEvent(order, `Asignado a ${driver.route}`);
  state.selectedOrderId = order.id;
  saveState();
  render();
  toast(`${order.id} asignado a ${driver.name}`);
}

function assignPendingToSelectedDriver() {
  const pending = state.orders.filter((order) => order.status === "pending");
  pending.forEach((order) => assignOrder(order.id));
  if (!pending.length) toast("No quedan pedidos pendientes para asignar");
}

function estimateEta(order) {
  const base = 10 + Math.round(order.coords.x / 8);
  const minutes = String((order.coords.y * 2) % 60).padStart(2, "0");
  return `${base}:${minutes}`;
}

function optimizeRoute() {
  const driver = selectedDriver();
  const orders = routeOrders(driver.id);
  if (!orders.length) {
    toast("El chofer no tiene pedidos asignados");
    return;
  }
  orders.forEach((order, index) => {
    order.eta = `${10 + index}:${String(15 + index * 12).padStart(2, "0")}`;
    addEvent(order, "Secuencia de paradas recalculada");
  });
  const first = orders[0];
  driver.location = { x: Math.max(12, first.coords.x - 7), y: Math.max(12, first.coords.y - 4) };
  saveState();
  render();
  toast("Ruta ordenada por proximidad y zona");
}

function advanceOrder(orderId) {
  const order = state.orders.find((item) => item.id === orderId);
  if (!order) return;
  if (order.status === "pending") assignOrder(orderId);
  else if (order.status === "assigned") {
    order.status = "route";
    addEvent(order, "Ruta iniciada por el chofer");
  } else if (order.status === "route") {
    order.status = "delivered";
    order.proof = "Evidencia digital registrada";
    addEvent(order, "Entrega confirmada con evidencia digital");
  }
  updateDriverLocation(order);
  saveState();
  render();
}

function markIssue(orderId) {
  const order = state.orders.find((item) => item.id === orderId);
  if (!order) return;
  order.status = "issue";
  order.issue = "Incidencia registrada desde administración";
  addEvent(order, order.issue);
  saveState();
  render();
  toast("Incidencia registrada");
}

function driverStartRoute(orderId) {
  const order = state.orders.find((item) => item.id === orderId);
  if (!order) return;
  queueOrApply(() => {
    order.status = "route";
    addEvent(order, "Chofer inició trayecto hacia la parada");
    updateDriverLocation(order);
  }, `Inicio/llegada registrada para ${order.id}`);
}

function driverDeliver(orderId) {
  const order = state.orders.find((item) => item.id === orderId);
  if (!order) return;
  const proofType = document.querySelector("#proofType")?.value || "Evidencia digital";
  const comment = document.querySelector("#driverComment")?.value?.trim();
  queueOrApply(() => {
    order.status = "delivered";
    order.proof = comment ? `${proofType}: ${comment}` : proofType;
    order.issue = null;
    order.eta = "Entregado";
    addEvent(order, `Entrega confirmada. ${order.proof}`);
    updateDriverLocation(order);
  }, `Entrega ${order.id} confirmada`);
}

function driverIssue(orderId) {
  const order = state.orders.find((item) => item.id === orderId);
  if (!order) return;
  const comment =
    document.querySelector("#driverComment")?.value?.trim() ||
    "No se pudo completar la entrega. Requiere revisión del coordinador.";
  queueOrApply(() => {
    order.status = "issue";
    order.issue = comment;
    order.eta = "Demorado";
    addEvent(order, `Incidencia reportada: ${comment}`);
    updateDriverLocation(order);
  }, `Incidencia registrada en ${order.id}`);
}

function updateDriverLocation(order) {
  const driver = driverById(order.driverId);
  if (driver) driver.location = { ...order.coords };
}

function queueOrApply(operation, message) {
  if (state.offline) {
    operation();
    state.syncQueue.push({ id: makeId(), message, createdAt: nowTime() });
    const order = selectedOrder();
    if (order) {
      addEvent(order, `Guardado offline: ${message}`);
    }
    saveState();
    render();
    toast("Cambio guardado localmente. Queda pendiente de sincronización.");
    return;
  }
  operation();
  saveState();
  render();
  toast(message);
}

function toggleOffline() {
  state.offline = !state.offline;
  saveState();
  render();
  toast(state.offline ? "Modo offline activado" : "Conexión restablecida");
}

function syncPending() {
  if (!state.syncQueue.length) {
    toast("No hay cambios pendientes");
    return;
  }
  const count = state.syncQueue.length;
  state.syncQueue = [];
  state.offline = false;
  saveState();
  render();
  toast(`${count} cambios sincronizados`);
}

function bindSignatureCanvas() {
  const canvas = document.querySelector("#signatureCanvas");
  if (!canvas || signatureCanvasBound) return;
  signatureCanvasBound = true;
  const ctx = canvas.getContext("2d");
  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    ctx.strokeStyle = "#17212b";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
  };
  resize();
  let drawing = false;
  const point = (event) => {
    const rect = canvas.getBoundingClientRect();
    const touch = event.touches?.[0];
    return {
      x: (touch?.clientX ?? event.clientX) - rect.left,
      y: (touch?.clientY ?? event.clientY) - rect.top,
    };
  };
  const start = (event) => {
    drawing = true;
    const p = point(event);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  };
  const move = (event) => {
    if (!drawing) return;
    event.preventDefault();
    const p = point(event);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  };
  const end = () => {
    drawing = false;
  };
  canvas.addEventListener("mousedown", start);
  canvas.addEventListener("mousemove", move);
  window.addEventListener("mouseup", end);
  canvas.addEventListener("touchstart", start, { passive: true });
  canvas.addEventListener("touchmove", move, { passive: false });
  canvas.addEventListener("touchend", end);
}

function toast(message) {
  const old = document.querySelector(".toast");
  if (old) old.remove();
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = message;
  document.body.appendChild(el);
  window.setTimeout(() => el.remove(), 2800);
}

render();
