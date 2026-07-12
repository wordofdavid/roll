import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    const username = formData.get("username")?.trim();
    const password = formData.get("password");

    try {
      const response = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Login failed.");
        return;
      }

      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("username", result.user.username);

      navigate("/events", { replace: true });
    } catch {
      setError("Cannot connect to the backend.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <h1>RollCall</h1>
      <h2>Log In</h2>

      {error && (
        <p className="auth-error" role="alert">
          {error}
        </p>
      )}

      <form className="auth-form" onSubmit={handleSubmit}>
        <label htmlFor="login-username">Username</label>
        <input
          id="login-username"
          name="username"
          type="text"
          autoComplete="username"
          required
        />

        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />

        <div className="auth-buttons">
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </button>

          <button type="reset" onClick={() => setError("")}>
            Reset
          </button>
        </div>
      </form>

      <p>
        Don&apos;t have an account? <Link to="/signup">Sign up</Link>
      </p>
    </main>
  );
}