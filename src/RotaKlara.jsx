import { useState, useEffect, useRef } from "react";

const COLORS = {
  bg: "#0A0F1E",
  surface: "#111827",
  card: "#162032",
  border: "#1E3A5F",
  accent: "#00C6FF",
  accentGlow: "#00C6FF33",
  green: "#00E5A0",
  greenGlow: "#00E5A022",
  orange: "#FF8C42",
  red: "#FF4D6D",
  yellow: "#FFD166",
  text: "#E8F0FE",
  muted: "#6B7FA3",
  white: "#FFFFFF",
};

const mockClientes = [
  { id: 1, nome: "Mercado São João", endereco: "Rua das Flores, 120", bairro: "Centro", lat: -22.998, lng: -47.510, ativo: true },
  { id: 2, nome: "Restaurante Bom Sabor", endereco: "Av. Paulista, 450", bairro: "Jardim", lat: -22.994, lng: -47.505, ativo: true },
  { id: 3, nome: "Padaria Central", endereco: "Rua XV de Novembro, 88", bairro: "Centro", lat: -23.001, lng: -47.508, ativo: true },
  { id: 4, nome: "Lanchonete do Zé", endereco: "Rua Benedito, 34", bairro: "Vila Nova", lat: -22.990, lng: -47.515, ativo: true },
  { id: 5, nome: "Supermercado Extra", endereco: "Av. Brasil, 600", bairro: "Novo Horizonte", lat: -23.005, lng: -47.500, ativo: true },
];

const mockEntregadores = [
  { id: 1, nome: "Carlos Silva", veiculo: "Moto Honda CG", status: "em_rota", lat: -22.996, lng: -47.507 },
  { id: 2, nome: "Ana Souza", veiculo: "Fiat Fiorino", status: "disponivel", lat: -22.999, lng: -47.512 },
  { id: 3, nome: "Pedro Lima", veiculo: "Moto Yamaha", status: "disponivel", lat: -23.002, lng: -47.506 },
];

const mockPedidos = [
  { id: 101, clienteId: 1, cliente: "Mercado São João", produtos: "5x Água 20L, 2x Gás 13kg", status: "pendente", entregadorId: null, hora: "08:30" },
  { id: 102, clienteId: 2, cliente: "Restaurante Bom Sabor", produtos: "3x Água 20L", status: "em_entrega", entregadorId: 1, hora: "09:00" },
  { id: 103, clienteId: 3, cliente: "Padaria Central", produtos: "1x Gás 13kg, 2x Água 20L", status: "concluido", entregadorId: 1, hora: "07:45" },
  { id: 104, clienteId: 4, cliente: "Lanchonete do Zé", produtos: "4x Água 20L", status: "pendente", entregadorId: null, hora: "10:00" },
  { id: 105, clienteId: 5, cliente: "Supermercado Extra", produtos: "10x Água 20L, 5x Gás 13kg", status: "pendente", entregadorId: null, hora: "11:30" },
  { id: 106, clienteId: 1, cliente: "Mercado São João", produtos: "2x Gás 45kg", status: "ausente", entregadorId: 2, hora: "08:00" },
];

const mockRota = [
  { ordem: 1, clienteId: 4, cliente: "Lanchonete do Zé", endereco: "Rua Benedito, 34", produtos: "4x Água 20L", distancia: "1.2 km", tempo: "8 min" },
  { ordem: 2, clienteId: 1, cliente: "Mercado São João", endereco: "Rua das Flores, 120", produtos: "5x Água 20L, 2x Gás 13kg", distancia: "2.1 km", tempo: "12 min" },
  { ordem: 3, clienteId: 5, cliente: "Supermercado Extra", endereco: "Av. Brasil, 600", produtos: "10x Água 20L, 5x Gás 13kg", distancia: "3.4 km", tempo: "15 min" },
];

// ─── MINI MAP SVG ────────────────────────────────────────────────────────────
function MiniMap({ entregadores, clientes, highlightRota }) {
  const w = 500, h = 300;
  const latMin = -23.010, latMax = -22.985, lngMin = -47.522, lngMax = -47.495;
  const toX = (lng) => ((lng - lngMin) / (lngMax - lngMin)) * w;
  const toY = (lat) => ((lat - latMax) / (latMin - latMax)) * h;

  const rotaPoints = highlightRota
    ? mockRota.map(r => {
        const c = clientes.find(c => c.id === r.clienteId);
        return c ? `${toX(c.lng)},${toY(c.lat)}` : null;
      }).filter(Boolean).join(" ")
    : "";

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ background: "#0D1B2E", borderRadius: 12, border: `1px solid ${COLORS.border}` }}>
      {/* Grid lines */}
      {[0,1,2,3,4].map(i => (
        <line key={i} x1={i*(w/4)} y1={0} x2={i*(w/4)} y2={h} stroke="#1a2a40" strokeWidth={1} />
      ))}
      {[0,1,2,3].map(i => (
        <line key={i} x1={0} y1={i*(h/3)} x2={w} y2={i*(h/3)} stroke="#1a2a40" strokeWidth={1} />
      ))}

      {/* Rota line */}
      {highlightRota && rotaPoints && (
        <polyline points={rotaPoints} fill="none" stroke={COLORS.accent} strokeWidth={2} strokeDasharray="6,3" opacity={0.7} />
      )}

      {/* Clientes */}
      {clientes.map(c => (
        <g key={c.id}>
          <circle cx={toX(c.lng)} cy={toY(c.lat)} r={8} fill={COLORS.card} stroke={COLORS.accent} strokeWidth={1.5} />
          <circle cx={toX(c.lng)} cy={toY(c.lat)} r={3} fill={COLORS.accent} />
          <text x={toX(c.lng)+11} y={toY(c.lat)+4} fill={COLORS.muted} fontSize={9} fontFamily="monospace">{c.nome.split(" ")[0]}</text>
        </g>
      ))}

      {/* Entregadores */}
      {entregadores.map(e => (
        <g key={e.id}>
          <circle cx={toX(e.lng)} cy={toY(e.lat)} r={10} fill={e.status === "em_rota" ? COLORS.green : COLORS.yellow} opacity={0.2} />
          <circle cx={toX(e.lng)} cy={toY(e.lat)} r={5} fill={e.status === "em_rota" ? COLORS.green : COLORS.yellow} />
          <text x={toX(e.lng)+13} y={toY(e.lat)+4} fill={COLORS.white} fontSize={9} fontFamily="monospace" fontWeight="bold">{e.nome.split(" ")[0]}</text>
        </g>
      ))}

      {/* Legend */}
      <g transform="translate(10,10)">
        <circle cx={6} cy={6} r={4} fill={COLORS.green} />
        <text x={14} y={10} fill={COLORS.muted} fontSize={8} fontFamily="monospace">Em rota</text>
        <circle cx={6} cy={20} r={4} fill={COLORS.yellow} />
        <text x={14} y={24} fill={COLORS.muted} fontSize={8} fontFamily="monospace">Disponível</text>
        <circle cx={6} cy={34} r={3} fill={COLORS.accent} />
        <text x={14} y={38} fill={COLORS.muted} fontSize={8} fontFamily="monospace">Cliente</text>
      </g>
    </svg>
  );
}

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
function Badge({ status }) {
  const map = {
    pendente: { label: "Pendente", color: COLORS.yellow, bg: "#FFD16622" },
    em_entrega: { label: "Em Entrega", color: COLORS.accent, bg: COLORS.accentGlow },
    concluido: { label: "Concluído", color: COLORS.green, bg: COLORS.greenGlow },
    ausente: { label: "Ausente", color: COLORS.red, bg: "#FF4D6D22" },
    em_rota: { label: "Em Rota", color: COLORS.green, bg: COLORS.greenGlow },
    disponivel: { label: "Disponível", color: COLORS.yellow, bg: "#FFD16622" },
  };
  const s = map[status] || { label: status, color: COLORS.muted, bg: "#ffffff11" };
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.color}44`,
      padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
      letterSpacing: 0.5, fontFamily: "monospace", whiteSpace: "nowrap"
    }}>{s.label}</span>
  );
}

// ─── CARD ─────────────────────────────────────────────────────────────────────
function Card({ children, style = {} }) {
  return (
    <div style={{
      background: COLORS.card, border: `1px solid ${COLORS.border}`,
      borderRadius: 14, padding: 20, ...style
    }}>{children}</div>
  );
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, color }) {
  return (
    <Card style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: color + "22", display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: 22, flexShrink: 0
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 800, color, fontFamily: "monospace", lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 4 }}>{label}</div>
      </div>
    </Card>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
function Sidebar({ current, onChange, role }) {
  const adminMenus = [
    { id: "dashboard", icon: "◈", label: "Dashboard" },
    { id: "pedidos", icon: "📦", label: "Pedidos" },
    { id: "rotas", icon: "🗺", label: "Rotas" },
    { id: "clientes", icon: "👥", label: "Clientes" },
    { id: "entregadores", icon: "🛵", label: "Entregadores" },
  ];
  const entregadorMenus = [
    { id: "minha_rota", icon: "🗺", label: "Minha Rota" },
    { id: "historico", icon: "📋", label: "Histórico" },
  ];
  const menus = role === "admin" ? adminMenus : entregadorMenus;

  return (
    <div style={{
      width: 220, background: COLORS.surface, borderRight: `1px solid ${COLORS.border}`,
      display: "flex", flexDirection: "column", padding: "24px 0", flexShrink: 0,
      position: "relative"
    }}>
      {/* Logo */}
      <div style={{ padding: "0 20px 28px" }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: COLORS.accent, letterSpacing: -1, fontFamily: "'Courier New', monospace" }}>
          ROTA<span style={{ color: COLORS.white }}>KLARA</span>
        </div>
        <div style={{ fontSize: 10, color: COLORS.muted, marginTop: 2, letterSpacing: 2 }}>
          {role === "admin" ? "ADMINISTRADOR" : "ENTREGADOR"}
        </div>
      </div>

      {menus.map(m => (
        <button key={m.id} onClick={() => onChange(m.id)} style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "12px 20px", background: current === m.id ? COLORS.accentGlow : "transparent",
          border: "none", borderLeft: current === m.id ? `3px solid ${COLORS.accent}` : "3px solid transparent",
          color: current === m.id ? COLORS.accent : COLORS.muted,
          cursor: "pointer", fontSize: 14, fontWeight: current === m.id ? 700 : 400,
          transition: "all 0.15s", textAlign: "left", width: "100%"
        }}>
          <span style={{ fontSize: 16 }}>{m.icon}</span>
          {m.label}
        </button>
      ))}

      <div style={{ marginTop: "auto", padding: "0 20px" }}>
        <div style={{ height: 1, background: COLORS.border, marginBottom: 16 }} />
        <div style={{ fontSize: 12, color: COLORS.muted }}>Águas Klaras Dist.</div>
        <div style={{ fontSize: 10, color: COLORS.border, marginTop: 2 }}>Capivari • SP</div>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ pedidos, entregadores, clientes }) {
  const total = pedidos.length;
  const concluidos = pedidos.filter(p => p.status === "concluido").length;
  const pendentes = pedidos.filter(p => p.status === "pendente").length;
  const emRota = pedidos.filter(p => p.status === "em_entrega").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: COLORS.white }}>Dashboard</h2>
        <p style={{ margin: "4px 0 0", color: COLORS.muted, fontSize: 13 }}>Visão geral das operações de hoje</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <StatCard label="Total de Pedidos" value={total} icon="📦" color={COLORS.accent} />
        <StatCard label="Concluídos" value={concluidos} icon="✅" color={COLORS.green} />
        <StatCard label="Pendentes" value={pendentes} icon="⏳" color={COLORS.yellow} />
        <StatCard label="Em Entrega" value={emRota} icon="🛵" color={COLORS.orange} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.muted, marginBottom: 14, letterSpacing: 1 }}>MAPA EM TEMPO REAL</div>
          <MiniMap entregadores={entregadores} clientes={clientes} highlightRota={false} />
        </Card>

        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.muted, marginBottom: 14, letterSpacing: 1 }}>ENTREGADORES</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {entregadores.map(e => (
              <div key={e.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 14px", background: COLORS.bg, borderRadius: 10,
                border: `1px solid ${COLORS.border}`
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: COLORS.accentGlow, display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: 16
                  }}>🧑</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.white }}>{e.nome}</div>
                    <div style={{ fontSize: 11, color: COLORS.muted }}>{e.veiculo}</div>
                  </div>
                </div>
                <Badge status={e.status} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.muted, marginBottom: 14, letterSpacing: 1 }}>PEDIDOS RECENTES</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
              {["#", "Cliente", "Produtos", "Hora", "Status"].map(h => (
                <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 11, color: COLORS.muted, fontWeight: 600, letterSpacing: 1 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pedidos.map(p => (
              <tr key={p.id} style={{ borderBottom: `1px solid ${COLORS.border}22` }}>
                <td style={{ padding: "10px 12px", color: COLORS.muted, fontSize: 12, fontFamily: "monospace" }}>#{p.id}</td>
                <td style={{ padding: "10px 12px", color: COLORS.white, fontSize: 13, fontWeight: 600 }}>{p.cliente}</td>
                <td style={{ padding: "10px 12px", color: COLORS.muted, fontSize: 12 }}>{p.produtos}</td>
                <td style={{ padding: "10px 12px", color: COLORS.muted, fontSize: 12, fontFamily: "monospace" }}>{p.hora}</td>
                <td style={{ padding: "10px 12px" }}><Badge status={p.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ─── PEDIDOS ──────────────────────────────────────────────────────────────────
function Pedidos({ pedidos, setPedidos, clientes, entregadores }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ clienteId: "", produtos: "", hora: "" });

  const handleAdd = () => {
    const cliente = clientes.find(c => c.id === parseInt(form.clienteId));
    if (!cliente || !form.produtos) return;
    const novo = {
      id: Math.max(...pedidos.map(p => p.id)) + 1,
      clienteId: cliente.id,
      cliente: cliente.nome,
      produtos: form.produtos,
      status: "pendente",
      entregadorId: null,
      hora: form.hora || "12:00"
    };
    setPedidos([...pedidos, novo]);
    setForm({ clienteId: "", produtos: "", hora: "" });
    setShowForm(false);
  };

  const updateStatus = (id, status) => {
    setPedidos(pedidos.map(p => p.id === id ? { ...p, status } : p));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: COLORS.white }}>Pedidos</h2>
          <p style={{ margin: "4px 0 0", color: COLORS.muted, fontSize: 13 }}>Gerencie todos os pedidos do dia</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{
          background: COLORS.accent, color: "#000", border: "none", borderRadius: 10,
          padding: "10px 20px", fontWeight: 800, cursor: "pointer", fontSize: 13
        }}>+ Novo Pedido</button>
      </div>

      {showForm && (
        <Card style={{ border: `1px solid ${COLORS.accent}44` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.accent, marginBottom: 16 }}>NOVO PEDIDO</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 12, alignItems: "end" }}>
            <div>
              <label style={{ fontSize: 11, color: COLORS.muted, display: "block", marginBottom: 6 }}>CLIENTE</label>
              <select value={form.clienteId} onChange={e => setForm({ ...form, clienteId: e.target.value })}
                style={{ width: "100%", background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "10px 12px", color: COLORS.white, fontSize: 13 }}>
                <option value="">Selecione...</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: COLORS.muted, display: "block", marginBottom: 6 }}>PRODUTOS</label>
              <input value={form.produtos} onChange={e => setForm({ ...form, produtos: e.target.value })}
                placeholder="Ex: 3x Água 20L" style={{ width: "100%", background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "10px 12px", color: COLORS.white, fontSize: 13, boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: COLORS.muted, display: "block", marginBottom: 6 }}>HORA</label>
              <input type="time" value={form.hora} onChange={e => setForm({ ...form, hora: e.target.value })}
                style={{ width: "100%", background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "10px 12px", color: COLORS.white, fontSize: 13, boxSizing: "border-box" }} />
            </div>
            <button onClick={handleAdd} style={{
              background: COLORS.green, color: "#000", border: "none", borderRadius: 8,
              padding: "10px 20px", fontWeight: 800, cursor: "pointer", fontSize: 13, whiteSpace: "nowrap"
            }}>Adicionar</button>
          </div>
        </Card>
      )}

      <Card>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
              {["#", "Cliente", "Endereço", "Produtos", "Hora", "Status", "Ações"].map(h => (
                <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 11, color: COLORS.muted, fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pedidos.map(p => {
              const cli = clientes.find(c => c.id === p.clienteId);
              return (
                <tr key={p.id} style={{ borderBottom: `1px solid ${COLORS.border}22` }}>
                  <td style={{ padding: "12px", color: COLORS.muted, fontSize: 12, fontFamily: "monospace" }}>#{p.id}</td>
                  <td style={{ padding: "12px", color: COLORS.white, fontWeight: 600, fontSize: 13 }}>{p.cliente}</td>
                  <td style={{ padding: "12px", color: COLORS.muted, fontSize: 12 }}>{cli?.endereco || "—"}</td>
                  <td style={{ padding: "12px", color: COLORS.muted, fontSize: 12 }}>{p.produtos}</td>
                  <td style={{ padding: "12px", color: COLORS.muted, fontSize: 12, fontFamily: "monospace" }}>{p.hora}</td>
                  <td style={{ padding: "12px" }}><Badge status={p.status} /></td>
                  <td style={{ padding: "12px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      {p.status === "pendente" && (
                        <button onClick={() => updateStatus(p.id, "em_entrega")} style={{
                          background: COLORS.accentGlow, color: COLORS.accent, border: `1px solid ${COLORS.accent}44`,
                          borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer", fontWeight: 700
                        }}>Iniciar</button>
                      )}
                      {p.status === "em_entrega" && (
                        <>
                
