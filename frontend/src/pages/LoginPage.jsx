import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import rollCallLogo from "../images/RollCall.png";

export default function LoginPage() {
  const navigate = useNavigate();

  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);
    const username = formData.get("username")?.trim();
    const password = formData.get("password");

    if (!username || !password) {
      setError("Please enter your username and password.");
      return;
    }

    /*
      Temporary login behavior.

      When your backend is ready, send the username and password
      to the backend and only set isLoggedIn when it approves them.
    */
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("username", username);

    navigate("/events", { replace: true });
  }

  return (
    <main className="auth-page">
      <img src={rollCallLogo} alt="RollCall" className="rollcall-logo" />
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
          <button type="submit">Log In</button>
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