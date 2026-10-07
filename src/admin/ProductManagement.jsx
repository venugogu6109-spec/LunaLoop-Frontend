import React, { useEffect, useState } from "react";
import "./ProductManagement.css";

const API_URL = "http://localhost:8080/api/products";

const emptyProduct = {
  name: "",
  category: "",
  description: "",
  price: "",
  stock: "",
  imageUrl: "",
  active: true,
};

function ProductManagement({ onBack }) {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyProduct);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to load products");
      }

      const data = await response.json();

      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Unable to load products.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setMessage("");
  };

  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyProduct);
    setShowForm(true);
    setError("");
    setMessage("");
  };

  const openEditForm = (product) => {
    setEditingId(product.id);

    setForm({
      name: product.name || "",
      category: product.category || "",
      description: product.description || "",
      price: product.price ?? "",
      stock: product.stock ?? "",
      imageUrl: product.imageUrl || "",
      active: product.active ?? true,
    });

    setShowForm(true);
    setError("");
    setMessage("");
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyProduct);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (!form.category.trim()) {
      setError("Category is required.");
      return;
    }

    if (form.price === "" || Number(form.price) < 0) {
      setError("Enter a valid price.");
      return;
    }

    if (form.stock === "" || Number(form.stock) < 0) {
      setError("Enter a valid stock quantity.");
      return;
    }

    const productData = {
      name: form.name.trim(),
      category: form.category.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
      imageUrl: form.imageUrl.trim(),
      active: form.active,
    };

    try {
      setSaving(true);
      setError("");

      const url = editingId
        ? `${API_URL}/${editingId}`
        : API_URL;

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        throw new Error("Failed to save product");
      }

      const savedProduct = await response.json();

      if (editingId) {
        setProducts((previous) =>
          previous.map((product) =>
            product.id === editingId
              ? savedProduct
              : product
          )
        );

        setMessage("Product updated successfully.");
      } else {
        setProducts((previous) => [
          ...previous,
          savedProduct,
        ]);

        setMessage("Product added successfully.");
      }

      setForm(emptyProduct);
      setEditingId(null);
      setShowForm(false);
    } catch (err) {
      console.error(err);
      setError("Unable to save product.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const product = products.find(
      (item) => item.id === id
    );

    const confirmed = window.confirm(
      `Delete "${product?.name || "this product"}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      setProducts((previous) =>
        previous.filter((product) => product.id !== id)
      );

      setMessage("Product deleted successfully.");
      setError("");
    } catch (err) {
      console.error(err);
      setError("Unable to delete product.");
    }
  };

  const filteredProducts = products.filter((product) => {
    const searchText = search.toLowerCase();

    return (
      product.name?.toLowerCase().includes(searchText) ||
      product.category?.toLowerCase().includes(searchText)
    );
  });

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) {
      return "/products/tote-bow-hearts.jpeg";
    }

    if (imageUrl.startsWith("http")) {
      return imageUrl;
    }

    return imageUrl;
  };

  return (
    <div className="product-management">

      {/* PAGE HEADER */}

      <div className="products-page-header">

        <div className="products-heading">

          <button
            className="back-dashboard-btn"
            onClick={onBack}
          >
            ← Dashboard
          </button>

          <h1>Products</h1>

          <p>
            Manage your LunaLoop products, prices and inventory.
          </p>

        </div>

        <button
          className="add-product-btn"
          onClick={openAddForm}
        >
          + Add Product
        </button>

      </div>


      {/* MESSAGE */}

      {message && (
        <div className="success-message">
          ✓ {message}
        </div>
      )}

      {error && (
        <div className="error-message">
          ⚠ {error}
        </div>
      )}


      {/* SEARCH + SUMMARY */}

      <div className="products-toolbar">

        <div className="product-search">

          <span>⌕</span>

          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

        </div>

        <div className="product-count">
          {products.length} Products
        </div>

      </div>


      {/* ADD / EDIT FORM */}

      {showForm && (
        <div className="product-form-card">

          <div className="form-card-header">

            <div>
              <h2>
                {editingId
                  ? "Edit Product"
                  : "Add New Product"}
              </h2>

              <p>
                Enter the product details below.
              </p>
            </div>

            <button
              className="close-form-btn"
              onClick={closeForm}
            >
              ×
            </button>

          </div>


          <form onSubmit={handleSubmit}>

            <div className="form-grid">

              <div className="form-group">

                <label>Product Name *</label>

                <input
                  type="text"
                  name="name"
                  placeholder="Example: Bow & Hearts Tote"
                  value={form.name}
                  onChange={handleChange}
                />

              </div>


              <div className="form-group">

                <label>Category *</label>

                <input
                  type="text"
                  name="category"
                  placeholder="Example: Tote Bags"
                  value={form.category}
                  onChange={handleChange}
                />

              </div>


              <div className="form-group">

                <label>Price (₹) *</label>

                <input
                  type="number"
                  name="price"
                  min="0"
                  step="0.01"
                  placeholder="499"
                  value={form.price}
                  onChange={handleChange}
                />

              </div>


              <div className="form-group">

                <label>Stock *</label>

                <input
                  type="number"
                  name="stock"
                  min="0"
                  placeholder="10"
                  value={form.stock}
                  onChange={handleChange}
                />

              </div>


              <div className="form-group full-width">

                <label>Image URL</label>

                <input
                  type="text"
                  name="imageUrl"
                  placeholder="/products/product-image.jpeg"
                  value={form.imageUrl}
                  onChange={handleChange}
                />

                <small>
                  Example: /products/tote-bow-hearts.jpeg
                </small>

              </div>


              <div className="form-group full-width">

                <label>Description</label>

                <textarea
                  name="description"
                  rows="4"
                  placeholder="Describe the product..."
                  value={form.description}
                  onChange={handleChange}
                />

              </div>


              <div className="active-checkbox">

                <input
                  type="checkbox"
                  id="active"
                  checked={form.active}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      active: event.target.checked,
                    }))
                  }
                />

                <label htmlFor="active">
                  Product is active
                </label>

              </div>

            </div>


            <div className="form-actions">

              <button
                type="button"
                className="cancel-btn"
                onClick={closeForm}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="save-product-btn"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Product"
                  : "Add Product"}
              </button>

            </div>

          </form>

        </div>
      )}


      {/* PRODUCTS */}

      <div className="products-card">

        <div className="products-card-header">

          <div>
            <h2>All Products</h2>
            <p>
              {filteredProducts.length} products found
            </p>
          </div>

          <button
            className="refresh-products-btn"
            onClick={loadProducts}
          >
            ↻ Refresh
          </button>

        </div>


        {loading ? (

          <div className="products-loading">
            <div className="products-spinner"></div>
            <p>Loading products...</p>
          </div>

        ) : filteredProducts.length === 0 ? (

          <div className="no-products">

            <div>🛍️</div>

            <h3>No products found</h3>

            <p>
              Add your first LunaLoop product.
            </p>

            <button
              onClick={openAddForm}
            >
              + Add Product
            </button>

          </div>

        ) : (

          <div className="products-management-grid">

            {filteredProducts.map((product) => (

              <div
                className="management-product-card"
                key={product.id}
              >

                <div className="management-product-image">

                  <img
                    src={getImageUrl(product.imageUrl)}
                    alt={product.name}
                    onError={(event) => {
                      event.currentTarget.src =
                        "/products/tote-bow-hearts.jpeg";
                    }}
                  />

                  <span
                    className={
                      product.active
                        ? "product-status active"
                        : "product-status inactive"
                    }
                  >
                    {product.active
                      ? "Active"
                      : "Inactive"}
                  </span>

                </div>


                <div className="management-product-body">

                  <div className="product-category">
                    {product.category}
                  </div>

                  <h3>{product.name}</h3>

                  <p className="product-description">
                    {product.description ||
                      "No description available."}
                  </p>


                  <div className="management-product-details">

                    <strong>
                      ₹
                      {Number(
                        product.price || 0
                      ).toLocaleString("en-IN")}
                    </strong>

                    <span>
                      Stock: {product.stock}
                    </span>

                  </div>


                  <div className="management-product-actions">

                    <button
                      className="edit-product-btn"
                      onClick={() =>
                        openEditForm(product)
                      }
                    >
                      ✎ Edit
                    </button>

                    <button
                      className="delete-product-btn"
                      onClick={() =>
                        handleDelete(product.id)
                      }
                    >
                      🗑 Delete
                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}

export default ProductManagement;