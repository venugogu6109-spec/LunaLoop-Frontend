import React, { useEffect, useState } from "react";
import "./AdminDashboard.css";

import ProductManagement from "./ProductManagement.jsx";
import OrderManagement from "./OrderManagement.jsx";

const API_PRODUCTS = "http://localhost:8080/api/products";
const API_ORDERS = "http://localhost:8080/api/orders";

function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [productsResponse, ordersResponse] = await Promise.all([
        fetch(API_PRODUCTS),
        fetch(API_ORDERS),
      ]);

      if (!productsResponse.ok) {
        throw new Error("Failed to load products");
      }

      if (!ordersResponse.ok) {
        throw new Error("Failed to load orders");
      }

      const productsData = await productsResponse.json();
      const ordersData = await ordersResponse.json();

      setProducts(Array.isArray(productsData) ? productsData : []);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalSales = orders.reduce(
    (sum, order) => sum + Number(order.totalAmount || 0),
    0
  );

  const pendingOrders = orders.filter((order) => {
    const status = String(order.status || "").toUpperCase();

    return status === "PLACED" || status === "PENDING";
  }).length;

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) {
      return "/products/tote-bow-hearts.jpeg";
    }

    if (imageUrl.startsWith("http")) {
      return imageUrl;
    }

    return imageUrl;
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    try {
      return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "-";
    }
  };

  const menuItems = [
    {
      name: "Dashboard",
      icon: "▦",
    },
    {
      name: "Products",
      icon: "🛍",
    },
    {
      name: "Orders",
      icon: "📦",
    },
    {
      name: "Inventory",
      icon: "▤",
    },
    {
      name: "Custom Orders",
      icon: "✦",
    },
    {
      name: "Delivery",
      icon: "🚚",
    },
    {
      name: "Payments",
      icon: "₹",
    },
    {
      name: "Settings",
      icon: "⚙",
    },
  ];

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-circle"></div>
        <h3>Loading LunaLoop Dashboard...</h3>
      </div>
    );
  }

  return (
    <div className="admin-layout">

      {/* ================= SIDEBAR ================= */}

      <aside className="admin-sidebar">

        <div className="admin-logo">

          <div className="logo-symbol">
            L
          </div>

          <div>
            <h2>LunaLoop</h2>
            <span>Admin Panel</span>
          </div>

        </div>

        <div className="sidebar-title">
          MAIN MENU
        </div>

        <nav className="admin-nav">

          {menuItems.map((item) => (
            <button
              key={item.name}
              className={`nav-item ${
                activeMenu === item.name ? "active" : ""
              }`}
              onClick={() => setActiveMenu(item.name)}
            >

              <span className="nav-icon">
                {item.icon}
              </span>

              <span>
                {item.name}
              </span>

            </button>
          ))}

        </nav>

        <div className="sidebar-bottom">

          <div className="admin-help">

            <div className="help-icon">
              ?
            </div>

            <div>
              <strong>
                Need Help?
              </strong>

              <p>
                Contact LunaLoop support
              </p>
            </div>

          </div>

          <button
            className="logout-btn"
            onClick={() => {
              sessionStorage.removeItem(
                "lunaloopAdminLoggedIn"
              );

              window.location.href = "/admin";
            }}
          >

            <span>
              ↪
            </span>

            Logout

          </button>

        </div>

      </aside>

      {/* ================= MAIN ================= */}

      <main className="admin-main">

        {/* ================= TOP HEADER ================= */}

        <header className="admin-header">

          <div className="mobile-brand">

            <div className="logo-symbol">
              L
            </div>

            <strong>
              LunaLoop
            </strong>

          </div>

          <div className="admin-search">

            <span>
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search products, orders..."
            />

          </div>

          <div className="header-right">

            <button className="notification-btn">
              ♡
              <span className="notification-dot"></span>
            </button>

            <div className="admin-profile">

              <div className="profile-avatar">
                G
              </div>

              <div className="profile-info">

                <strong>
                  Admin
                </strong>

                <span>
                  Store Manager
                </span>

              </div>

              <span className="profile-arrow">
                ⌄
              </span>

            </div>

          </div>

        </header>

        {/* ==================================================
            DASHBOARD
        ================================================== */}

        {activeMenu === "Dashboard" && (

          <div className="dashboard-content">

            {/* PAGE HEADING */}

            <div className="page-heading">

              <div>

                <h1>
                  Dashboard
                </h1>

                <p>
                  Welcome back! Here's what's happening with your
                  store today.
                </p>

              </div>

              <button
                className="refresh-btn"
                onClick={fetchData}
              >
                ↻ Refresh
              </button>

            </div>

            {/* ================= STATISTICS ================= */}

            <section className="stats-grid">

              {/* PRODUCTS */}

              <div className="stat-card">

                <div className="stat-icon purple">
                  🛍
                </div>

                <div className="stat-info">

                  <span>
                    Total Products
                  </span>

                  <h2>
                    {products.length}
                  </h2>

                  <small className="positive">
                    ↑ Active products
                  </small>

                </div>

              </div>

              {/* ORDERS */}

              <div className="stat-card">

                <div className="stat-icon pink">
                  📦
                </div>

                <div className="stat-info">

                  <span>
                    Total Orders
                  </span>

                  <h2>
                    {orders.length}
                  </h2>

                  <small className="positive">
                    ↑ All orders
                  </small>

                </div>

              </div>

              {/* SALES */}

              <div className="stat-card">

                <div className="stat-icon green">
                  ₹
                </div>

                <div className="stat-info">

                  <span>
                    Total Sales
                  </span>

                  <h2>
                    ₹
                    {totalSales.toLocaleString("en-IN")}
                  </h2>

                  <small className="positive">
                    ↑ Order revenue
                  </small>

                </div>

              </div>

              {/* PENDING */}

              <div className="stat-card">

                <div className="stat-icon orange">
                  ⏳
                </div>

                <div className="stat-info">

                  <span>
                    Pending Orders
                  </span>

                  <h2>
                    {pendingOrders}
                  </h2>

                  <small className="warning">
                    Needs attention
                  </small>

                </div>

              </div>

            </section>

            {/* ================= TWO COLUMNS ================= */}

            <section className="dashboard-columns">

              {/* RECENT ORDERS */}

              <div className="dashboard-card orders-card">

                <div className="card-header">

                  <div>

                    <h3>
                      Recent Orders
                    </h3>

                    <p>
                      Latest customer orders
                    </p>

                  </div>

                  <button
                    onClick={() =>
                      setActiveMenu("Orders")
                    }
                    className="view-all"
                  >
                    View All →
                  </button>

                </div>

                <div className="orders-table">

                  <div className="table-heading">

                    <span>
                      ORDER
                    </span>

                    <span>
                      CUSTOMER
                    </span>

                    <span>
                      AMOUNT
                    </span>

                    <span>
                      STATUS
                    </span>

                  </div>

                  {orders.length === 0 ? (

                    <div className="empty-state">

                      <div>
                        📦
                      </div>

                      <p>
                        No orders yet
                      </p>

                    </div>

                  ) : (

                    orders
                      .slice()
                      .reverse()
                      .slice(0, 5)
                      .map((order) => (

                        <div
                          className="order-row"
                          key={order.id}
                        >

                          <div className="order-number">

                            <strong>
                              #{order.id}
                            </strong>

                            <span>
                              {formatDate(
                                order.createdAt
                              )}
                            </span>

                          </div>

                          <div className="customer-name">

                            {order.fullName ||
                              "Customer"}

                          </div>

                          <div className="order-amount">

                            ₹
                            {Number(
                              order.totalAmount || 0
                            ).toLocaleString("en-IN")}

                          </div>

                          <div>

                            <span
                              className={`status-badge ${String(
                                order.status ||
                                  "PLACED"
                              ).toLowerCase()}`}
                            >
                              {order.status ||
                                "PLACED"}
                            </span>

                          </div>

                        </div>

                      ))

                  )}

                </div>

              </div>

              {/* QUICK ACTIONS */}

              <div className="dashboard-card quick-card">

                <div className="card-header">

                  <div>

                    <h3>
                      Quick Actions
                    </h3>

                    <p>
                      Manage your store
                    </p>

                  </div>

                </div>

                <div className="quick-actions">

                  {/* ADD PRODUCT */}

                  <button
                    onClick={() =>
                      setActiveMenu("Products")
                    }
                    className="quick-action"
                  >

                    <div className="quick-icon purple">
                      ＋
                    </div>

                    <div>

                      <strong>
                        Add Product
                      </strong>

                      <span>
                        Create a new product
                      </span>

                    </div>

                    <b>
                      →
                    </b>

                  </button>

                  {/* ORDERS */}

                  <button
                    onClick={() =>
                      setActiveMenu("Orders")
                    }
                    className="quick-action"
                  >

                    <div className="quick-icon pink">
                      📦
                    </div>

                    <div>

                      <strong>
                        Manage Orders
                      </strong>

                      <span>
                        View customer orders
                      </span>

                    </div>

                    <b>
                      →
                    </b>

                  </button>

                  {/* INVENTORY */}

                  <button
                    onClick={() =>
                      setActiveMenu("Inventory")
                    }
                    className="quick-action"
                  >

                    <div className="quick-icon orange">
                      ▤
                    </div>

                    <div>

                      <strong>
                        Check Inventory
                      </strong>

                      <span>
                        Manage stock levels
                      </span>

                    </div>

                    <b>
                      →
                    </b>

                  </button>

                  {/* CUSTOM */}

                  <button
                    onClick={() =>
                      setActiveMenu("Custom Orders")
                    }
                    className="quick-action"
                  >

                    <div className="quick-icon green">
                      ✦
                    </div>

                    <div>

                      <strong>
                        Custom Requests
                      </strong>

                      <span>
                        View custom orders
                      </span>

                    </div>

                    <b>
                      →
                    </b>

                  </button>

                </div>

              </div>

            </section>

            {/* ================= PRODUCTS ================= */}

            <section className="dashboard-card products-section">

              <div className="card-header">

                <div>

                  <h3>
                    Products
                  </h3>

                  <p>
                    Your latest products
                  </p>

                </div>

                <button
                  onClick={() =>
                    setActiveMenu("Products")
                  }
                  className="view-all"
                >
                  Manage Products →
                </button>

              </div>

              <div className="admin-products-grid">

                {products
                  .slice(0, 4)
                  .map((product) => (

                    <div
                      className="admin-product-card"
                      key={product.id}
                    >

                      <div className="admin-product-image">

                        <img
                          src={getImageUrl(
                            product.imageUrl
                          )}
                          alt={product.name}
                          onError={(event) => {
                            event.currentTarget.src =
                              "/products/tote-bow-hearts.jpeg";
                          }}
                        />

                        <span className="product-active">
                          Active
                        </span>

                      </div>

                      <div className="admin-product-info">

                        <h4>
                          {product.name}
                        </h4>

                        <div className="product-bottom">

                          <strong>
                            ₹
                            {Number(
                              product.price || 0
                            ).toLocaleString("en-IN")}
                          </strong>

                          <span>
                            ID #{product.id}
                          </span>

                        </div>

                      </div>

                    </div>

                  ))}

                {products.length === 0 && (

                  <div className="empty-products">
                    No products found.
                  </div>

                )}

              </div>

            </section>

          </div>

        )}

        {/* ==================================================
            PRODUCTS MANAGEMENT
        ================================================== */}

        {activeMenu === "Products" && (

          <ProductManagement
            onBack={() =>
              setActiveMenu("Dashboard")
            }
          />

        )}

        {/* ==================================================
            ORDERS MANAGEMENT
        ================================================== */}

        {activeMenu === "Orders" && (

          <OrderManagement
            onBack={() =>
              setActiveMenu("Dashboard")
            }
          />

        )}

        {/* ==================================================
            OTHER SECTIONS
        ================================================== */}

        {activeMenu !== "Dashboard" &&
          activeMenu !== "Products" &&
          activeMenu !== "Orders" && (

            <div className="section-placeholder">

              <div className="placeholder-icon">

                {
                  menuItems.find(
                    (item) =>
                      item.name === activeMenu
                  )?.icon
                }

              </div>

              <h1>
                {activeMenu}
              </h1>

              <p>
                This section is ready for development.
              </p>

              <button
                onClick={() =>
                  setActiveMenu("Dashboard")
                }
              >
                ← Back to Dashboard
              </button>

            </div>

          )}

      </main>

    </div>
  );
}

export default AdminDashboard;