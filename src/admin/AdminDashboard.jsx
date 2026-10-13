import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./AdminDashboard.css";

const API_PRODUCTS = "http://localhost:8080/api/products";
const API_ORDERS = "http://localhost:8080/api/orders";

const MENU = [
  ["Dashboard", "⌂"],
  ["Products", "▧"],
  ["Add Product", "+"],
  ["Orders", "▤"],
  ["Inventory", "▣"],
  ["Custom Orders", "✿"],
  ["Delivery", "↗"],
  ["Payments", "₹"],
  ["Customers", "♙"],
  ["Analytics", "▥"],
  ["Settings", "⚙"],
];

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const dateLabel = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const statusClass = (value) =>
  String(value || "pending").toLowerCase().replace(/[^a-z0-9]+/g, "-");

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [productResponse, orderResponse] = await Promise.all([
        fetch(API_PRODUCTS),
        fetch(API_ORDERS),
      ]);
      if (!productResponse.ok) throw new Error("Products API returned " + productResponse.status);
      if (!orderResponse.ok) throw new Error("Orders API returned " + orderResponse.status);
      const [productData, orderData] = await Promise.all([
        productResponse.json(),
        orderResponse.json(),
      ]);
      setProducts(Array.isArray(productData) ? productData : []);
      setOrders(Array.isArray(orderData) ? orderData : []);
      setLastUpdated(new Date());
    } catch (e) {
      console.error("LunaLoop admin load failed:", e);
      setError("Could not load store data. Check that Spring Boot is running on port 8080.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const activeProducts = products.filter((p) => p.active !== false);
  const lowStock = products.filter((p) => Number(p.stock ?? 0) <= 5);
  const revenue = orders
    .filter((o) => !["CANCELLED", "REJECTED", "FAILED"].includes(String(o.status || "").toUpperCase()))
    .reduce((sum, o) => sum + Number(o.totalAmount ?? o.total ?? 0), 0);
  const pendingCount = orders.filter((o) =>
    ["PLACED", "PENDING", "PROCESSING"].includes(String(o.status || "").toUpperCase())
  ).length;

  const filteredProducts = useMemo(() => products.filter((p) =>
    `${p.name || ""} ${p.category || ""}`.toLowerCase().includes(search.toLowerCase())
  ), [products, search]);

  const filteredOrders = useMemo(() => orders.filter((o) =>
    `${o.id ?? ""} ${o.customerName ?? o.customer?.name ?? ""} ${o.status ?? ""}`
      .toLowerCase().includes(search.toLowerCase())
  ), [orders, search]);

  const categories = useMemo(() => {
    const counts = {};
    products.forEach((p) => {
      const name = p.category || "Other";
      counts[name] = (counts[name] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [products]);

  const orderTrend = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const key = d.toDateString();
      const count = orders.filter((o) => {
        const raw = o.createdAt || o.orderDate || o.date;
        return raw && new Date(raw).toDateString() === key;
      }).length;
      days.push({ label: d.toLocaleDateString("en-IN", { month: "short", day: "2-digit" }), count });
    }
    return days;
  }, [orders]);

  const chartPoints = (() => {
    const max = Math.max(4, ...orderTrend.map((d) => d.count));
    return orderTrend.map((d, i) => ({
      ...d,
      x: 28 + i * 92,
      y: 118 - (d.count / max) * 92,
    }));
  })();
  const chartLine = chartPoints.map((p) => `${p.x},${p.y}`).join(" ");
  const chartArea = `28,128 ${chartLine} 580,128`;

  const openMenu = (name) => {
    if (name === "Add Product") {
      window.location.href = "/admin/add-product";
      return;
    }
    setActiveMenu(name);
    setSearch("");
  };

  const customerName = (order) =>
    order.customerName || order.customer?.name || order.userName || "Customer";
  const orderDate = (order) => order.createdAt || order.orderDate || order.date;

  return (
    <div className="ll-admin">
      <aside className="ll-sidebar">
        <a className="ll-brand" href="/" aria-label="LunaLoop customer store">
          <span className="ll-brand-mark">☾</span>
          <span><strong>LunaLoop</strong><small>HANDMADE WITH LOVE</small></span>
        </a>

        <div className="ll-menu-label">WORKSPACE</div>
        <nav className="ll-nav" aria-label="Admin navigation">
          {MENU.map(([name, icon]) => (
            <button key={name} className={`ll-nav-item ${activeMenu === name ? "is-active" : ""}`}
              onClick={() => openMenu(name)}>
              <span className="ll-nav-icon">{icon}</span><span>{name}</span>
              {name === "Orders" && pendingCount > 0 && <span className="ll-nav-count">{pendingCount}</span>}
            </button>
          ))}
        </nav>

        <div className="ll-sidebar-spacer" />
        <div className="ll-help-card">
          <span className="ll-help-icon">♡</span>
          <strong>Need a little help?</strong>
          <p>Manage your handmade store with confidence.</p>
          <a href="mailto:hello@lunaloop.store">Contact support</a>
        </div>
        <a className="ll-store-link" href="/">↗ <span>Back to customer store</span></a>
      </aside>

      <main className="ll-main">
        <header className="ll-topbar">
          <div className="ll-mobile-brand"><span className="ll-brand-mark">☾</span><strong>LunaLoop</strong></div>
          <label className="ll-search">
            <span>⌕</span>
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products, orders..." aria-label="Search products and orders" />
            {search && <button type="button" onClick={() => setSearch("")} aria-label="Clear search">×</button>}
          </label>
          <div className="ll-top-actions">
            <button className="ll-icon-button" onClick={loadData} title="Refresh data" aria-label="Refresh data">↻</button>
            <div className="ll-profile-avatar">L</div>
            <div className="ll-profile-copy"><strong>LunaLoop Admin</strong><span>Store administrator</span></div>
          </div>
        </header>

        <div className="ll-page">
          <div className="ll-page-heading">
            <div>
              <p className="ll-eyebrow">YOUR STORE AT A GLANCE</p>
              <h1>{activeMenu}</h1>
              <p className="ll-subtitle">Welcome back! Here's what's happening at LunaLoop.</p>
            </div>
            <div className="ll-heading-actions">
              <span className="ll-date-chip">◷ {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}` : "Store overview"}</span>
              <button className="ll-primary-button" onClick={() => openMenu("Add Product")}>＋ Add Product</button>
            </div>
          </div>

          {error && <div className="ll-error" role="alert"><span>{error}</span><button onClick={loadData}>Retry</button></div>}

          {activeMenu === "Dashboard" && (
            <>
              <section className="ll-stat-grid">
                <article className="ll-stat-card"><div className="ll-stat-icon purple">▧</div><div><span>Total Products</span><strong>{loading ? "…" : products.length}</strong><small>{activeProducts.length} active in your catalog</small></div><span className="ll-stat-watermark">▧</span></article>
                <article className="ll-stat-card"><div className="ll-stat-icon pink">▤</div><div><span>Total Orders</span><strong>{loading ? "…" : orders.length}</strong><small>{pendingCount} need attention</small></div><span className="ll-stat-watermark">▤</span></article>
                <article className="ll-stat-card"><div className="ll-stat-icon orange">₹</div><div><span>Order Value</span><strong>{loading ? "…" : money(revenue)}</strong><small>Excludes cancelled and failed</small></div><span className="ll-stat-watermark">₹</span></article>
                <article className="ll-stat-card"><div className="ll-stat-icon green">◇</div><div><span>Low Stock Items</span><strong>{loading ? "…" : lowStock.length}</strong><small>Products with 5 or fewer items</small></div><span className="ll-stat-watermark">◇</span></article>
              </section>

              <section className="ll-analytics-grid">
                <article className="ll-panel ll-trend-panel">
                  <div className="ll-panel-heading"><div><h2>Order overview</h2><p>Orders received over the last 7 days</p></div><span className="ll-soft-chip">Last 7 days</span></div>
                  <div className="ll-chart-wrap">
                    <div className="ll-chart-y"><span>4</span><span>3</span><span>2</span><span>1</span><span>0</span></div>
                    <svg className="ll-line-chart" viewBox="0 0 610 145" role="img" aria-label="Order count trend for the last seven days" preserveAspectRatio="none">
                      {[25,48,71,94,117].map((y) => <line key={y} x1="28" y1={y} x2="580" y2={y} className="ll-grid-line" />)}
                      {[28,120,212,304,396,488,580].map((x) => <line key={x} x1={x} y1="20" x2={x} y2="128" className="ll-grid-line vertical" />)}
                      <polygon points={chartArea} className="ll-chart-area" />
                      <polyline points={chartLine} className="ll-chart-line" />
                      {chartPoints.map((p) => <circle key={p.label} cx={p.x} cy={p.y} r="3.5" className="ll-chart-dot"><title>{p.label}: {p.count} orders</title></circle>)}
                    </svg>
                  </div>
                  <div className="ll-chart-labels">{orderTrend.map((d) => <span key={d.label}>{d.label}</span>)}</div>
                </article>

                <article className="ll-panel ll-category-panel">
                  <div className="ll-panel-heading"><div><h2>Product categories</h2><p>Your catalog by category</p></div></div>
                  <div className="ll-category-content">
                    <div className="ll-donut" style={{"--category-count": Math.max(products.length, 1)}}><div><strong>{products.length}</strong><span>Products</span></div></div>
                    <div className="ll-category-legend">
                      {categories.length ? categories.slice(0, 5).map(([name, count], i) => <div key={name}><i className={`ll-legend-dot dot-${i % 4}`} /><span>{name}</span><strong>{count}</strong></div>) : <p>No categories yet</p>}
                    </div>
                  </div>
                </article>
              </section>

              <section className="ll-bottom-grid">
                <article className="ll-panel">
                  <div className="ll-panel-heading"><div><h2>Recent orders</h2><p>Your latest customer orders</p></div><button className="ll-text-button" onClick={() => setActiveMenu("Orders")}>View all →</button></div>
                  <div className="ll-table-scroll">
                    <table className="ll-table">
                      <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
                      <tbody>
                        {orders.slice().sort((a,b) => Number(b.id || 0) - Number(a.id || 0)).slice(0,5).map((o) => <tr key={o.id}><td><strong>#{o.id ?? "—"}</strong></td><td>{customerName(o)}</td><td className="ll-price">{money(o.totalAmount ?? o.total)}</td><td><span className={`ll-status ${statusClass(o.status)}`}>{o.status || "Pending"}</span></td><td>{dateLabel(orderDate(o))}</td></tr>)}
                        {!loading && orders.length === 0 && <tr><td colSpan="5" className="ll-empty">No orders yet.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </article>

                <article className="ll-panel">
                  <div className="ll-panel-heading"><div><h2>Recent products</h2><p>Manage your handmade collection</p></div><button className="ll-text-button" onClick={() => setActiveMenu("Products")}>View all →</button></div>
                  <div className="ll-table-scroll">
                    <table className="ll-table ll-product-table">
                      <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th></tr></thead>
                      <tbody>
                        {filteredProducts.slice(0,5).map((p) => <tr key={p.id ?? p.name}><td><div className="ll-product-cell"><img src={p.imageUrl?.startsWith("http") ? p.imageUrl : p.imageUrl ? `http://localhost:8080${p.imageUrl}` : ""} alt="" onError={(e) => { e.currentTarget.style.visibility = "hidden"; }} /><span><strong>{p.name}</strong><small>{p.active === false ? "Inactive" : "Active"}</small></span></div></td><td>{p.category || "Other"}</td><td className="ll-price">{money(p.price)}</td><td>{p.stock ?? 0}</td></tr>)}
                        {!loading && filteredProducts.length === 0 && <tr><td colSpan="4" className="ll-empty">No products match your search.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </article>
              </section>
            </>
          )}

          {activeMenu === "Products" && <section className="ll-panel ll-list-panel"><div className="ll-panel-heading"><div><h2>All products</h2><p>Products in your LunaLoop catalog</p></div><button className="ll-primary-button" onClick={() => openMenu("Add Product")}>＋ Add Product</button></div><div className="ll-table-scroll"><table className="ll-table"><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th></tr></thead><tbody>{filteredProducts.map((p) => <tr key={p.id ?? p.name}><td>{p.name}</td><td>{p.category || "Other"}</td><td>{money(p.price)}</td><td>{p.stock ?? 0}</td><td><span className={`ll-status ${p.active === false ? "cancelled" : "delivered"}`}>{p.active === false ? "Inactive" : "Active"}</span></td></tr>)}</tbody></table></div></section>}

          {activeMenu === "Orders" && <section className="ll-panel ll-list-panel"><div className="ll-panel-heading"><div><h2>All orders</h2><p>Track incoming orders and their current status</p></div></div><div className="ll-table-scroll"><table className="ll-table"><thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr></thead><tbody>{filteredOrders.map((o) => <tr key={o.id}><td>#{o.id ?? "—"}</td><td>{customerName(o)}</td><td>{money(o.totalAmount ?? o.total)}</td><td><span className={`ll-status ${statusClass(o.status)}`}>{o.status || "Pending"}</span></td><td>{dateLabel(orderDate(o))}</td></tr>)}</tbody></table></div></section>}

          {activeMenu === "Inventory" && <section className="ll-panel ll-list-panel"><div className="ll-panel-heading"><div><h2>Inventory</h2><p>Monitor stock levels across your products</p></div></div><div className="ll-table-scroll"><table className="ll-table"><thead><tr><th>Product</th><th>Stock</th><th>Inventory status</th></tr></thead><tbody>{filteredProducts.map((p) => <tr key={p.id ?? p.name}><td>{p.name}</td><td>{p.stock ?? 0}</td><td><span className={`ll-status ${Number(p.stock ?? 0) <= 5 ? "pending" : "delivered"}`}>{Number(p.stock ?? 0) <= 5 ? "Low stock" : "In stock"}</span></td></tr>)}</tbody></table></div></section>}

          {!["Dashboard", "Products", "Orders", "Inventory"].includes(activeMenu) && (
            <section className="ll-panel ll-coming-soon"><span className="ll-coming-icon">✿</span><h2>{activeMenu}</h2><p>This section is ready for the next integration step. Your current products and orders remain unchanged.</p>{activeMenu === "Add Product" && <button className="ll-primary-button" onClick={() => { window.location.href = "/admin/add-product"; }}>Open product form →</button>}<button className="ll-secondary-button" onClick={() => setActiveMenu("Dashboard")}>Back to dashboard</button></section>
          )}
          <footer className="ll-footer">LunaLoop Admin · Handmade with love <span>{loading ? "Loading store data…" : `${products.length} products · ${orders.length} orders`}</span></footer>
        </div>
      </main>
    </div>
  );
}
