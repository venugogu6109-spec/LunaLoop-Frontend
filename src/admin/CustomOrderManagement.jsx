import React, { useEffect, useState } from "react";
import "./CustomOrderManagement.css";

const API_URL = "http://localhost:8080/api/custom-orders";

function CustomOrderManagement({ onBack }) {
  const [customOrders, setCustomOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [message, setMessage] = useState("");

  const loadCustomOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Unable to load custom orders.");
      }

      const data = await response.json();
      setCustomOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load custom orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomOrders();
  }, []);

  const updateField = (id, field, value) => {
    setCustomOrders((previous) =>
      previous.map((order) =>
        order.id === id ? { ...order, [field]: value } : order
      )
    );
  };

  const saveOrder = async (order) => {
    try {
      setSavingId(order.id);
      setError("");
      setMessage("");

      const response = await fetch(`${API_URL}/${order.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: order.status,
          adminNotes: order.adminNotes || "",
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to update this custom order.");
      }

      const updatedOrder = await response.json();

      setCustomOrders((previous) =>
        previous.map((item) =>
          item.id === updatedOrder.id ? updatedOrder : item
        )
      );

      setMessage(`Custom order #${order.id} updated successfully.`);
    } catch (err) {
      setError(err.message || "Failed to update custom order.");
    } finally {
      setSavingId(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "—";

    return parsed.toLocaleString("en-IN");
  };

  return (
    <div className="custom-orders-page">
      <div className="custom-orders-header">
        <div>
          <p className="custom-orders-eyebrow">LUNALOOP ADMIN</p>
          <h1>Custom Orders</h1>
          <p>Review customer ideas and manage custom requests.</p>
        </div>

        <button
          className="custom-orders-refresh"
          onClick={loadCustomOrders}
          disabled={loading}
        >
          {loading ? "Loading..." : "↻ Refresh"}
        </button>
      </div>

      <div className="custom-orders-summary">
        <div className="custom-orders-stat">
          <span>Total Requests</span>
          <strong>{customOrders.length}</strong>
        </div>

        <div className="custom-orders-stat">
          <span>New Requests</span>
          <strong>
            {customOrders.filter((order) => order.status === "NEW").length}
          </strong>
        </div>

        <div className="custom-orders-stat">
          <span>In Progress</span>
          <strong>
            {
              customOrders.filter((order) => order.status === "IN_PROGRESS")
                .length
            }
          </strong>
        </div>
      </div>

      {error && <div className="custom-orders-error">{error}</div>}
      {message && <div className="custom-orders-success">{message}</div>}

      {loading ? (
        <div className="custom-orders-empty">Loading custom orders...</div>
      ) : customOrders.length === 0 ? (
        <div className="custom-orders-empty">
          <div className="custom-orders-empty-icon">✦</div>
          <h2>No custom orders yet</h2>
          <p>Customer requests will appear here after they submit them.</p>
          <button onClick={loadCustomOrders}>Check Again</button>
        </div>
      ) : (
        <div className="custom-orders-list">
          {customOrders.map((order) => (
            <article className="custom-order-card" key={order.id}>
              <div className="custom-order-card-header">
                <div>
                  <span className="custom-order-number">
                    REQUEST #{order.id}
                  </span>
                  <h2>{order.productType}</h2>
                </div>

                <span
                  className={`custom-order-status ${String(
                    order.status || "NEW"
                  )
                    .toLowerCase()
                    .replaceAll("_", "-")}`}
                >
                  {String(order.status || "NEW").replaceAll("_", " ")}
                </span>
              </div>

              <div className="custom-order-details">
                <div>
                  <span>Customer</span>
                  <strong>{order.customerName}</strong>
                </div>

                <div>
                  <span>Mobile</span>
                  <strong>{order.mobile}</strong>
                </div>

                <div>
                  <span>Email</span>
                  <strong>{order.email || "Not provided"}</strong>
                </div>

                <div>
                  <span>Budget</span>
                  <strong>
                    {order.budget != null
                      ? `₹${Number(order.budget).toLocaleString("en-IN")}`
                      : "Not specified"}
                  </strong>
                </div>

                <div className="custom-order-description">
                  <span>Customer's requirements</span>
                  <p>{order.description}</p>
                </div>

                <div>
                  <span>Submitted</span>
                  <strong>{formatDate(order.createdAt)}</strong>
                </div>
              </div>

              <div className="custom-order-edit">
                <label>
                  Update Status
                  <select
                    value={order.status || "NEW"}
                    onChange={(event) =>
                      updateField(order.id, "status", event.target.value)
                    }
                  >
                    <option value="NEW">New</option>
                    <option value="REVIEWING">Reviewing</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </label>

                <label>
                  Admin Notes
                  <textarea
                    rows="3"
                    value={order.adminNotes || ""}
                    placeholder="Add a price estimate, material details, or follow-up notes..."
                    onChange={(event) =>
                      updateField(order.id, "adminNotes", event.target.value)
                    }
                  />
                </label>

                <button
                  className="custom-order-save"
                  onClick={() => saveOrder(order)}
                  disabled={savingId !== null}
                >
                  {savingId === order.id ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {onBack && (
        <button className="custom-orders-back" onClick={onBack}>
          ← Back to Dashboard
        </button>
      )}
    </div>
  );
}

export default CustomOrderManagement;