import { useNavigate } from "react-router-dom";

export default function SignupPage() {
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();

    // Later, send the form data to your backend here.
    navigate("/login");
  }

  return (
    <main className="auth-page">
      <h1>Sign Up</h1>

      <form onSubmit={handleSubmit}>
        <label htmlFor="fname">First name</label>
        <input id="fname" name="fname" type="text" required />

        <label htmlFor="lname">Last name</label>
        <input id="lname" name="lname" type="text" required />

        <label htmlFor="location">Location</label>
        <input id="location" name="location" type="text" />

        <label htmlFor="age">Age</label>
        <input id="age" name="age" type="number" min="18" max="99" />

        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required />

        <label htmlFor="signup-username">Username</label>
        <input
          id="signup-username"
          name="username"
          type="text"
          required
        />

        <label htmlFor="signup-password">Password</label>
        <input
          id="signup-password"
          name="password"
          type="password"
          required
        />

        <fieldset>
          <legend>What is your skating level?</legend>

          {["beginner", "intermediate", "skilled", "expert"].map((level) => (
            <label key={level}>
              <input type="radio" name="skateLevel" value={level} />
              {level}
            </label>
          ))}
        </fieldset>

        <fieldset>
          <legend>What types of skating interest you?</legend>

          {["jam-skating", "soul-skating", "speed-skating", "freestyle"].map(
            (type) => (
              <label key={type}>
                <input type="checkbox" name="skatingTypes" value={type} />
                {type}
              </label>
            ),
          )}
        </fieldset>

        <button type="submit">Sign Up</button>
      </form>
    </main>
  );
}