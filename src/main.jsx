import React, { useState } from "react";
import ReactDOM from "react-dom/client";

import App from "./App.jsx";
import AdminDashboard from "./admin/AdminDashboard.jsx";
import AdminLogin from "./admin/AdminLogin.jsx";

import "./index.css";

function AdminApp() {
  const [loggedIn, setLoggedIn] = useState(
    sessionStorage.getItem("lunaloopAdminLoggedIn") === "true"
  );

  const handleLogin = () => {
    setLoggedIn(true);
  };

  if (!loggedIn) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return <AdminDashboard />;
}

const isAdmin = window.location.pathname === "/admin";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {isAdmin ? <AdminApp /> : <App />}
  </React.StrictMode>
);