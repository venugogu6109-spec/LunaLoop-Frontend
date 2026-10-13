import { useState } from "react";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");

  async function addProduct(event) {
    event.preventDefault();
    setMessage("Adding product...");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("category", category);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("stock", stock);

    if (image) {
      formData.append("image", image);
    }

    try {
      const response = await fetch(
        "http://localhost:8080/api/products/with-image",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.text();

      if (!response.ok) {
        throw new Error(result || "Could not add product");
      }

      setMessage("Product added successfully!");
      setName("");
      setCategory("");
      setDescription("");
      setPrice("");
      setStock("");
      setImage(null);
      event.target.reset();
    } catch (error) {
      setMessage("Error: " + error.message);
    }
  }

  return (
    <main className="admin-dashboard">
      <h1>LunaLoop Admin Dashboard</h1>
      <p>Add a new product to your store.</p>

      <form onSubmit={addProduct} className="admin-product-form">
        <label>Product Name</label>
        <input value={name} onChange={e => setName(e.target.value)} required />

        <label>Category</label>
        <input value={category} onChange={e => setCategory(e.target.value)} required />

        <label>Description</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
        />

        <label>Price (₹)</label>
        <input type="number" min="0.01" step="0.01" value={price}
          onChange={e => setPrice(e.target.value)} required />

        <label>Stock</label>
        <input type="number" min="0" step="1" value={stock}
          onChange={e => setStock(e.target.value)} required />

        <label>Product Image</label>
        <input type="file" accept="image/png,image/jpeg,image/webp"
          onChange={e => setImage(e.target.files[0] || null)} required />

        <button type="submit">Add Product</button>
        <p>{message}</p>
      </form>
    </main>
  );
}