import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateEventPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const newEvent = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("http://localhost:3000/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newEvent),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.message || "Could not create the event.");
        return;
      }
      navigate("/events", { replace: true });
    } catch {
      setError("Cannot connect to the backend.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="create-event-page">
      <h1>Create an Event</h1>
      <p>Share a skating meetup, class, or community session.</p>
      {error && <p className="profile-message" role="alert">{error}</p>}
      <form className="create-event-form" onSubmit={handleSubmit}>
        <label htmlFor="event-name">Event name</label>
        <input id="event-name" name="name" required />

        <div className="form-row">
          <div><label htmlFor="event-date">Date</label><input id="event-date" name="date" type="date" required /></div>
          <div><label htmlFor="event-time">Time</label><input id="event-time" name="time" type="time" required /></div>
        </div>

        <label htmlFor="event-location">Venue or location</label>
        <input id="event-location" name="location" required />

        <label htmlFor="event-city">City</label>
        <input id="event-city" name="city" required />

        <label htmlFor="event-level">Skill level</label>
        <select id="event-level" name="skillLevel" required defaultValue="">
          <option value="" disabled>Select a level</option>
          <option>All levels</option><option>Beginner</option><option>Intermediate</option><option>Skilled</option><option>Expert</option>
        </select>

        <label htmlFor="event-description">Description</label>
        <textarea id="event-description" name="description" rows="5" required />

        <label htmlFor="event-image">Image URL (optional)</label>
        <input id="event-image" name="imageUrl" type="url" placeholder="https://example.com/event-photo.jpg" />

        <button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Event"}</button>
      </form>
    </main>
  );
}
