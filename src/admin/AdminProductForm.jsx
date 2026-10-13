
import React, { useState } from "react";
import "./AdminDashboard.css";

const API_BASE = "http://localhost:8080";

const categories = [
  "Tote Bags",
  "Crochet",
  "Pipe-Cleaner Crafts",
  "Keychains",
  "Jewellery",
  "Hair Accessories",
  "Gifts & Hampers",
  "Other Handmade Products",
];

export default function AdminProductForm({ onProductAdded, onBack }) {
  const [form, setForm] = useState({
    name: "",
    category: "Tote Bags",
    description: "",
    price: "",
    stock: "",
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    setImage(file || null);
    setPreview(file ? URL.createObjectURL(file) : "");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!form.name.trim()) {
      setError("Please enter the product name.");
      return;
    }

    if (!form.description.trim()) {
      setError("Please enter the product description.");
      return;
    }

    if (!Number.isFinite(Number(form.price)) || Number(form.price) <= 0) {
      setError("Enter a valid price greater than zero.");
      return;
    }

    if (
      form.stock === "" ||
      !Number.isInteger(Number(form.stock)) ||
      Number(form.stock) < 0
    ) {
      setError("Enter a valid stock quantity (zero or greater).");
      return;
    }

    if (image && !image.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    const data = new FormData();
    data.append("name", form.name.trim());
    data.append("category", form.category);
    data.append("description", form.description.trim());
    data.append("price", String(Number(form.price)));
    data.append("stock", String(Number(form.stock)));

    if (image) {
      data.append("image", image);
    }

    try {
      setSubmitting(true);

      const response = await fetch(`${API_BASE}/api/products/with-image`, {
        method: "POST",
        body: data,
      });

      if (!response.ok) {
        const responseText = await response.text();
        throw new Error(
          responseText || `Server returned status ${response.status}.`
        );
      }

      setMessage("Product added successfully!");

      setForm({
        name: "",
        category: "Tote Bags",
        description: "",
        price: "",
        stock: "",
      });

      setImage(null);
      setPreview("");

      if (onProductAdded) {
        onProductAdded();
      }
    } catch (err) {
      setError(
        `Could not add product: ${err.message}. Check that the backend is running and supports POST /api/products/with-image.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-content">
      <div className="admin-page-heading">
        <div>
          <p className="admin-eyebrow">PRODUCT CATALOG</p>
          <h1>Add Product</h1>
          <p>Add a handmade product to your LunaLoop store.</p>
        </div>

        <button
          type="button"
          className="admin-secondary-button"
          onClick={onBack}
        >
          Back to Products
        </button>
      </div>

      <section className="admin-panel">
        {message && (
          <div className="admin-success-message">{message}</div>
        )}

        {error && <div className="admin-error">{error}</div>}

        <form onSubmit={handleSubmit} className="admin-product-form">
          <div className="admin-form-grid">
            <div className="admin-form-field">
              <label htmlFor="product-name">Product Name *</label>
              <input
                id="product-name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Bow & Hearts Tote"
                required
              />
            </div>

            <div className="admin-form-field">
              <label htmlFor="product-category">Category *</label>
              <select
                id="product-category"
                name="category"
                value={form.category}
                onChange={handleChange}
                required
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-form-field">
              <label htmlFor="product-price">Price (₹) *</label>
              <input
                id="product-price"
                name="price"
                type="number"
                min="0.01"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                placeholder="e.g. 299"
                required
              />
            </div>

            <div className="admin-form-field">
              <label htmlFor="product-stock">Stock Quantity *</label>
              <input
                id="product-stock"
                name="stock"
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={handleChange}
                placeholder="e.g. 10"
                required
              />
            </div>

            <div className="admin-form-field admin-form-full">
              <label htmlFor="product-description">Description *</label>
              <textarea
                id="product-description"
                name="description"
                rows="4"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the materials, design and features..."
                required
              />
            </div>

            <div className="admin-form-field admin-form-full">
              <label htmlFor="product-image">Product Image</label>
              <input
                id="product-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              <p className="admin-form-help">
                Choose a photo of your handmade product.
              </p>

              {preview && (
                <div className="admin-image-preview">
                  <img src={preview} alt="Selected product preview" />
                  <button
                    type="button"
                    className="admin-secondary-button"
                    onClick={() => {
                      setImage(null);
                      setPreview("");
                    }}
                  >
                    Remove Image
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="admin-form-actions">
            <button
              type="button"
              className="admin-secondary-button"
              onClick={onBack}
              disabled={submitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="admin-primary-button"
              disabled={submitting}
            >
              {submitting ? "Adding Product..." : "Add Product"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
