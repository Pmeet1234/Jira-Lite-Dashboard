import React, { useState, useEffect } from "react";
import Board from "./components/board";
import { login, register, setAuthToken, clearAuthToken } from "./services/auth";
import "./App.css";

function App() {
  const [view, setView] = useState("home");
  const [authMode, setAuthMode] = useState("login");
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [toast, setToast] = useState("");

useEffect(() => {
    // ALWAYS show home on refresh/close (manual login required)
    setView("home");
    console.log('🔄 Page refreshed/loaded → Showing Home page');
  }, []);

  const showLogin = () => {
    setAuthMode("login");
    setError("");
    setFormData({ name: "", email: "", password: "" });
  };

  const showRegister = () => {
    setAuthMode("register");
    setError("");
    setFormData({ name: "", email: "", password: "" });
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let result;
      if (authMode === "login") {
        result = await login({ email: formData.email, password: formData.password });
      } else {
        result = await register(formData);
      }

      if (authMode === "login") {
        const actualData = result.data || result;
        const { access_token, user: userData } = actualData;
        setUser(userData);
        localStorage.setItem("token", access_token);
        localStorage.setItem("user", JSON.stringify(userData));
        setAuthToken(access_token);
        setToast(`Login successful! Welcome back, ${userData.name} 🎉`);
        setTimeout(() => setToast(""), 4000);
        setView("dashboard");
        console.log('Login success, set view to dashboard', {access_token, userData});
      } else {
        // Register success: switch to login
        setError("Account created successfully! Please log in.");
        setAuthMode("login");
        setFormData({ name: "", email: "", password: "" });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setError("");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    clearAuthToken();
    setView("home");
  };

  const goToAuth = () => setView("auth");

  if (view === "dashboard" && !user) {
    setView("home");
    return null;
  }

  if (view === "auth") {
    return (
      <div className="auth-page">
        <div className="auth-overlay" />
        <button className="back-home-btn" onClick={() => setView("home")}>
          Back to Home
        </button>
        <div className="auth-container">
          <section className="auth-panel auth-image-panel">
            <div className="auth-image-content">
              <h2>{authMode === "login" ? "User Portal Login" : "Create User Account"}</h2>
              <p>
                {authMode === "login"
                  ? "Log in to manage your projects and tasks."
                  : "Create your account to get started."}
              </p>
            </div>
          </section>

          <section className="auth-panel auth-form-panel">
            <div className="auth-switcher">
              <button
                type="button"
                className={`auth-tab ${authMode === "login" ? "active" : ""}`}
                onClick={showLogin}
              >
                Login
              </button>
              <button
                type="button"
                className={`auth-tab ${authMode === "register" ? "active" : ""}`}
                onClick={showRegister}
              >
                Register
              </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form className="auth-form" onSubmit={handleSubmit}>
              {authMode === "register" && (
                <input
                  type="text"
                  name="name"
                  placeholder="Full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              )}
              <input
                type="email"
                name="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              <input
                type="password"
                name="password"
                placeholder={authMode === "register" ? "Create password" : "Password"}
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? "Loading..." : (authMode === "login" ? "Continue to Dashboard" : "Create Account")}
              </button>
            </form>
          </section>
        </div>
      </div>
    );
  }

  if (view === "dashboard") {
    return (
      <div className="dashboard-page">
        <div className="dashboard-overlay" />
        <div className="dashboard-topbar">
          <div className="role-chip">User Dashboard</div>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
        <div className="app-shell anime-theme-cartoon">
          <header className="app-header">
            <p className="app-kicker">Welcome back, {user.name}</p>
            <h1>Jira Lite Dashboard</h1>
          </header>
          <Board />
        </div>
      </div>
    );
  }

  return (
    <>
      {toast && (
        <div className="toast-container">
          <div className="toast success">
            <span>✅</span>
            {toast}
          </div>
        </div>
      )}
      <div className="home-page">
        <div className="home-overlay" />
        <div className="home-login-actions">
          <button className="user-login-btn" onClick={goToAuth}>
            Login
          </button>
        </div>

        <section className="company-details">
          <p className="company-kicker">Welcome to</p>
          <h1>Jira Lite Solutions</h1>
          <p>
            A real-world team dashboard flow to manage projects, monitor progress, and
            collaborate across departments with clarity.
          </p>
          <div className="company-highlights">
            <span>Project Tracking</span>
            <span>Team Collaboration</span>
            <span>Priority Planning</span>
          </div>
        </section>
      </div>
    </>
  );
}

export default App;
