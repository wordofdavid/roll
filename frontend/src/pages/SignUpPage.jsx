import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function SignupPage() {
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    const account = {
      username: formData.get("username")?.trim(),
      email: formData.get("email")?.trim(),
      password: formData.get("password"),
      firstName: formData.get("fname")?.trim(),
      lastName: formData.get("lname")?.trim(),
      location: formData.get("location")?.trim(),
      age: formData.get("age"),
      skateLevel: formData.get("skateLevel"),
    };

    try {
      const response = await fetch("http://localhost:3000/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(account),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Unable to create account.");
        return;
      }

      navigate("/login", { replace: true });
    } catch {
      setError(
        "Cannot connect to the backend. Make sure the backend server is running.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <h1>RollCall</h1>
      <h2>Create an Account</h2>

      {error && (
        <p className="auth-error" role="alert">
          {error}
        </p>
      )}

      <form className="auth-form" onSubmit={handleSubmit}>
        <label htmlFor="fname">First name</label>
        <input
          id="fname"
          name="fname"
          type="text"
          autoComplete="given-name"
          required
        />

        <label htmlFor="lname">Last name</label>
        <input
          id="lname"
          name="lname"
          type="text"
          autoComplete="family-name"
          required
        />

        <label htmlFor="location">Location</label>
        <input
          id="location"
          name="location"
          type="text"
          autoComplete="address-level2"
        />

        <label htmlFor="age">Age</label>
        <input
          id="age"
          name="age"
          type="number"
          min="18"
          max="99"
          required
        />

        <label htmlFor="signup-email">Email</label>
        <input
          id="signup-email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />

        <label htmlFor="signup-username">Username</label>
        <input
          id="signup-username"
          name="username"
          type="text"
          autoComplete="username"
          required
        />

        <label htmlFor="signup-password">
          Password (at least 8 characters)
        </label>
        <input
          id="signup-password"
          name="password"
          type="password"
          minLength="8"
          autoComplete="new-password"
          required
        />

        <fieldset>
          <legend>What is your skating level?</legend>

          {["beginner", "intermediate", "skilled", "expert"].map(
            (level) => (
              <label key={level}>
                <input
                  type="radio"
                  name="skateLevel"
                  value={level}
                  required
                />
                {level}
              </label>
            ),
          )}
        </fieldset>

        <fieldset>
          <legend>
            What types of skating do you know or want to learn?
          </legend>

          {[
            "jam-skating",
            "soul-skating",
            "speed-skating",
            "freestyle",
          ].map((type) => (
            <label key={type}>
              <input
                type="checkbox"
                name="skatingTypes"
                value={type}
              />
              {type}
            </label>
          ))}
        </fieldset>

        <button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </form>

      <p>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </main>
  );
}
