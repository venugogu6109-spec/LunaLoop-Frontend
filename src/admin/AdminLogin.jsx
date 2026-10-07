import React, { useState } from "react";
import "./AdminLogin.css";

function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (event) => {
    event.preventDefault();

    if (username === "admin" && password === "LunaLoop@2026") {
      sessionStorage.setItem("lunaloopAdminLoggedIn", "true");
      onLogin();
    } else {
      setError("Invalid username or password.");
    }
  };

  return (
    <div className="admin-login-page">

      <div className="admin-login-card">

        <div className="login-logo">
          L
        </div>

        <h1>LunaLoop</h1>
        <p className="login-subtitle">
          Admin Panel
        </p>

        <div className="login-welcome">
          <h2>Welcome Back 👋</h2>
          <p>Sign in to manage your LunaLoop store.</p>
        </div>

        <form onSubmit={handleLogin}>

          <label>
            Username
          </label>

          <input
            type="text"
            placeholder="Enter admin username"
            value={username}
            onChange={(event) => {
              setUsername(event.target.value);
              setError("");
            }}
            autoComplete="username"
          />

          <label>
            Password
          </label>

          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setError("");
            }}
            autoComplete="current-password"
          />

          {error && (
            <div className="login-error">
              ⚠ {error}
            </div>
          )}

          <button
            type="submit"
            className="admin-login-button"
          >
            Login to Dashboard →
          </button>

        </form>

        <div className="login-footer">
          <span>🔒</span>
          <span>Authorized LunaLoop administrators only</span>
        </div>

      </div>

    </div>
  );
}

export default AdminLogin;