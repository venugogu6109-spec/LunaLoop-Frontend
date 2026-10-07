import React from "react";
import "./OrderDetails.css";

function OrderDetails({ order, onBack }) {
  if (!order) {
    return (
      <div className="order-details-page">
        <div className="order-details-empty">
          <div className="order-details-empty-icon">📦</div>
          <h2>Order not found</h2>
          <p>The selected order could not be loaded.</p>

          <button onClick={onBack}>
            ← Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (date) => {
    if (!date) return "—";

    try {
      return new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "—";
    }
  };

  const getStatusClass = (status) => {
    const value = String(status || "PLACED").toLowerCase();

    if (value === "delivered") return "details-status-delivered";
    if (value === "shipped") return "details-status-shipped";
    if (value === "processing") return "details-status-processing";
    if (value === "cancelled") return "details-status-cancelled";

    return "details-status-placed";
  };

  return (
    <div className="order-details-page">

      {/* HEADER */}

      <div className="order-details-header">

        <div>
          <button
            className="order-details-back"
            onClick={onBack}
          >
            ← Back to Orders
          </button>

          <h1>
            Order #{order.id}
          </h1>

          <p>
            Complete order information
          </p>
        </div>

        <div
          className={`details-status ${getStatusClass(
            order.status
          )}`}
        >
          {order.status || "PLACED"}
        </div>

      </div>

      {/* MAIN GRID */}

      <div className="order-details-grid">

        {/* CUSTOMER */}

        <div className="details-card">

          <div className="details-card-title">
            <span className="details-title-icon">
              👤
            </span>

            <div>
              <h3>Customer Information</h3>
              <p>Customer contact details</p>
            </div>
          </div>

          <div className="details-info-grid">

            <div className="details-info-item">
              <span>Full Name</span>
              <strong>
                {order.fullName || "—"}
              </strong>
            </div>

            <div className="details-info-item">
              <span>Mobile Number</span>
              <strong>
                {order.mobile || "—"}
              </strong>
            </div>

            <div className="details-info-item details-full-width">
              <span>Email Address</span>
              <strong>
                {order.email || "—"}
              </strong>
            </div>

          </div>

        </div>

        {/* ORDER INFORMATION */}

        <div className="details-card">

          <div className="details-card-title">
            <span className="details-title-icon">
              📦
            </span>

            <div>
              <h3>Order Information</h3>
              <p>Order summary</p>
            </div>
          </div>

          <div className="details-info-grid">

            <div className="details-info-item">
              <span>Order ID</span>
              <strong>
                #{order.id}
              </strong>
            </div>

            <div className="details-info-item">
              <span>Order Date</span>
              <strong>
                {formatDate(order.createdAt)}
              </strong>
            </div>

            <div className="details-info-item">
              <span>Order Status</span>
              <strong>
                {order.status || "PLACED"}
              </strong>
            </div>

          </div>

        </div>

        {/* DELIVERY ADDRESS */}

        <div className="details-card details-full-card">

          <div className="details-card-title">
            <span className="details-title-icon">
              📍
            </span>

            <div>
              <h3>Delivery Address</h3>
              <p>Customer delivery location</p>
            </div>
          </div>

          <div className="address-box">

            <strong>
              {order.fullName || "Customer"}
            </strong>

            <p>
              {order.address || "—"}
            </p>

            <p>
              {order.city || ""}
              {order.city && order.state ? ", " : ""}
              {order.state || ""}
            </p>

            <p>
              PIN Code: {order.pinCode || "—"}
            </p>

            <p>
              Mobile: {order.mobile || "—"}
            </p>

          </div>

        </div>

        {/* PAYMENT / AMOUNT */}

        <div className="details-card details-full-card">

          <div className="details-card-title">

            <span className="details-title-icon">
              ₹
            </span>

            <div>
              <h3>Order Amount</h3>
              <p>Payment summary</p>
            </div>

          </div>

          <div className="amount-summary">

            <div className="amount-row">
              <span>Subtotal</span>

              <strong>
                {formatCurrency(order.subtotal)}
              </strong>
            </div>

            <div className="amount-row">
              <span>Delivery Charge</span>

              <strong>
                {formatCurrency(order.deliveryCharge)}
              </strong>
            </div>

            <div className="amount-divider"></div>

            <div className="amount-row amount-total">
              <span>Total Amount</span>

              <strong>
                {formatCurrency(order.totalAmount)}
              </strong>
            </div>

          </div>

        </div>

      </div>

      {/* FOOTER */}

      <div className="order-details-footer">

        <button
          className="order-details-back-bottom"
          onClick={onBack}
        >
          ← Back to Orders
        </button>

      </div>

    </div>
  );
}

export default OrderDetails;