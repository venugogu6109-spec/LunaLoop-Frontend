import React, { useEffect, useState } from "react";
import "./OrderManagement.css";
import OrderDetails from "./OrderDetails.jsx";

const API_URL = "http://localhost:8080/api/orders";

const STATUS_OPTIONS = [
  "PLACED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

function OrderManagement({ onBack }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to load orders");
      }

      const data = await response.json();

      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to load orders. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const updateStatus = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_URL}/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update order status");
      }

      const updatedOrder = await response.json();

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === updatedOrder.id
            ? updatedOrder
            : order
        )
      );

      // Keep opened order details synchronized
      if (
        selectedOrder &&
        selectedOrder.id === updatedOrder.id
      ) {
        setSelectedOrder(updatedOrder);
      }

      setSuccess(
        `Order #${orderId} status updated to ${newStatus}.`
      );

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to update order status. Please try again."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      String(order.id || "").includes(searchText) ||
      String(order.fullName || "")
        .toLowerCase()
        .includes(searchText) ||
      String(order.mobile || "").includes(searchText) ||
      String(order.email || "")
        .toLowerCase()
        .includes(searchText);

    const matchesStatus =
      statusFilter === "ALL" ||
      String(order.status || "").toUpperCase() ===
        statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusClass = (status) => {
    const value = String(
      status || "PLACED"
    ).toLowerCase();

    if (value === "delivered") {
      return "status-delivered";
    }

    if (value === "shipped") {
      return "status-shipped";
    }

    if (value === "cancelled") {
      return "status-cancelled";
    }

    if (value === "processing") {
      return "status-processing";
    }

    return "status-placed";
  };

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    try {
      return new Date(date).toLocaleString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    } catch {
      return "—";
    }
  };

  const formatCurrency = (amount) => {
    return `₹${Number(
      amount || 0
    ).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const totalSales = orders.reduce(
    (sum, order) =>
      sum + Number(order.totalAmount || 0),
    0
  );

  const pendingOrders = orders.filter((order) => {
    const status = String(
      order.status || ""
    ).toUpperCase();

    return (
      status === "PLACED" ||
      status === "PROCESSING"
    );
  }).length;

  const deliveredOrders = orders.filter(
    (order) =>
      String(
        order.status || ""
      ).toUpperCase() === "DELIVERED"
  ).length;

  /*
   * IMPORTANT:
   * This must come BEFORE the main return.
   */
  if (selectedOrder) {
    return (
      <OrderDetails
        order={selectedOrder}
        onBack={() => setSelectedOrder(null)}
      />
    );
  }

  return (
    <div className="order-management-page">

      {/* ================= HEADER ================= */}

      <div className="order-management-header">

        <div>

          <button
            className="orders-back-button"
            onClick={onBack}
          >
            ← Back to Dashboard
          </button>

          <h1>
            Orders Management
          </h1>

          <p>
            View and manage all LunaLoop customer orders.
          </p>

        </div>

        <button
          className="orders-refresh-button"
          onClick={loadOrders}
        >
          ↻ Refresh
        </button>

      </div>

      {/* ================= STATS ================= */}

      <div className="order-stats">

        <div className="order-stat-card">

          <div className="order-stat-icon">
            📦
          </div>

          <div>
            <span>
              Total Orders
            </span>

            <strong>
              {orders.length}
            </strong>
          </div>

        </div>

        <div className="order-stat-card">

          <div className="order-stat-icon">
            💰
          </div>

          <div>
            <span>
              Total Sales
            </span>

            <strong>
              {formatCurrency(totalSales)}
            </strong>
          </div>

        </div>

        <div className="order-stat-card">

          <div className="order-stat-icon">
            ⏳
          </div>

          <div>
            <span>
              Pending Orders
            </span>

            <strong>
              {pendingOrders}
            </strong>
          </div>

        </div>

        <div className="order-stat-card">

          <div className="order-stat-icon">
            ✅
          </div>

          <div>
            <span>
              Delivered
            </span>

            <strong>
              {deliveredOrders}
            </strong>
          </div>

        </div>

      </div>

      {/* ================= SEARCH / FILTER ================= */}

      <div className="orders-toolbar">

        <div className="orders-search">

          <span>
            🔍
          </span>

          <input
            type="text"
            placeholder="Search by order ID, customer, mobile or email..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

        <select
          className="orders-status-filter"
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >

          <option value="ALL">
            All Status
          </option>

          {STATUS_OPTIONS.map((status) => (
            <option
              key={status}
              value={status}
            >
              {status}
            </option>
          ))}

        </select>

      </div>

      {/* ================= SUCCESS ================= */}

      {success && (
        <div className="orders-success">
          ✓ {success}
        </div>
      )}

      {/* ================= ERROR ================= */}

      {error && (
        <div className="orders-error">
          ⚠ {error}
        </div>
      )}

      {/* ================= ORDERS TABLE ================= */}

      <div className="orders-table-card">

        {loading ? (

          <div className="orders-loading">

            <div className="orders-spinner"></div>

            <p>
              Loading orders...
            </p>

          </div>

        ) : filteredOrders.length === 0 ? (

          <div className="orders-empty">

            <div>
              📦
            </div>

            <h2>
              No orders found
            </h2>

            <p>
              {search ||
              statusFilter !== "ALL"
                ? "Try changing your search or filter."
                : "Customer orders will appear here."}
            </p>

          </div>

        ) : (

          <div className="orders-table-wrapper">

            <table className="orders-table">

              <thead>

                <tr>

                  <th>
                    Order
                  </th>

                  <th>
                    Customer
                  </th>

                  <th>
                    Contact
                  </th>

                  <th>
                    Delivery Address
                  </th>

                  <th>
                    Amount
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Date
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredOrders.map(
                  (order) => (

                    <tr key={order.id}>

                      {/* ORDER ID */}

                      <td>

                        <button
                          className="order-id order-id-button"
                          onClick={() =>
                            setSelectedOrder(order)
                          }
                          title="View order details"
                        >
                          #{order.id}
                        </button>

                      </td>

                      {/* CUSTOMER */}

                      <td>

                        <div className="customer-name">
                          {order.fullName || "—"}
                        </div>

                      </td>

                      {/* CONTACT */}

                      <td>

                        <div className="customer-contact">

                          <span>
                            {order.mobile || "—"}
                          </span>

                          <small>
                            {order.email || "—"}
                          </small>

                        </div>

                      </td>

                      {/* ADDRESS */}

                      <td>

                        <div className="delivery-address">

                          <span>
                            {order.address || "—"}
                          </span>

                          <small>

                            {order.city || ""}

                            {order.city &&
                            order.state
                              ? ", "
                              : ""}

                            {order.state || ""}

                            {order.pinCode
                              ? ` - ${order.pinCode}`
                              : ""}

                          </small>

                        </div>

                      </td>

                      {/* AMOUNT */}

                      <td>

                        <div className="order-amount">
                          {formatCurrency(
                            order.totalAmount
                          )}
                        </div>

                      </td>

                      {/* STATUS */}

                      <td>

                        <div className="status-control">

                          <span
                            className={`order-status ${getStatusClass(
                              order.status
                            )}`}
                          >
                            {order.status ||
                              "PLACED"}
                          </span>

                          <select
                            className="status-select"
                            value={
                              order.status ||
                              "PLACED"
                            }
                            disabled={
                              updatingId ===
                              order.id
                            }
                            onChange={(e) =>
                              updateStatus(
                                order.id,
                                e.target.value
                              )
                            }
                          >

                            {STATUS_OPTIONS.map(
                              (status) => (

                                <option
                                  key={status}
                                  value={status}
                                >
                                  {status}
                                </option>

                              )
                            )}

                          </select>

                          {updatingId ===
                            order.id && (

                            <small className="status-saving">
                              Saving...
                            </small>

                          )}

                        </div>

                      </td>

                      {/* DATE */}

                      <td>

                        <div className="order-date">
                          {formatDate(
                            order.createdAt
                          )}
                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default OrderManagement;