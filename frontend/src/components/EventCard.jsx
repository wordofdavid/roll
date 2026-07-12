import { useEffect, useState } from "react";
import { isEventSaved, saveEvent, removeSavedEvent } from "../utilities/savedEvents";

export default function EventCard({ event, onDeleted }) {
  const [saved, setSaved] = useState(() => isEventSaved(event.id));
  const [attended, setAttended] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:3000/api/me", { credentials: "include" })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => setAttended(data?.attendedEventIds.includes(event.id) || false))
      .catch(() => {});
  }, [event.id]);

  function handleSaveToggle() {
    saved ? removeSavedEvent(event.id) : saveEvent(event.id);
    setSaved(!saved);
  }

  async function handleAttendanceToggle() {
    setMessage("");
    try {
      const response = await fetch(`http://localhost:3000/api/attendance/${event.id}`, {
        method: attended ? "DELETE" : "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error();
      setAttended(!attended);
      setMessage(attended ? "Removed from your progress." : "Added to your progress!");
    } catch {
      setMessage("Could not update attendance.");
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(`Delete “${event.name}”? This cannot be undone.`);
    if (!confirmed) return;

    setMessage("");
    try {
      const response = await fetch(`http://localhost:3000/api/events/${event.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const result = await response.json();
      if (!response.ok) {
        setMessage(result.message || "Could not delete the event.");
        return;
      }
      onDeleted?.(event.id);
    } catch {
      setMessage("Could not connect to the backend.");
    }
  }

  return (
    <article className="event-card">
      {event.imageUrl && event.imageUrl !== "//nothing" && <img src={event.imageUrl} alt="" />}
      <div>
        <p>{event.skillLevel}</p>
        <h2>{event.name}</h2>
        <p>{event.date} at {event.time}</p>
        <p>{event.location}, {event.city}</p>
        <p>{event.description}</p>
        <button type="button" onClick={handleSaveToggle} aria-pressed={saved}>
          {saved ? "Saved ✓" : "Save event"}
        </button>
        <button type="button" onClick={handleAttendanceToggle}>
          {attended ? "Undo attendance" : "I went to this event"}
        </button>
        {event.canDelete && (
          <button className="delete-event-button" type="button" onClick={handleDelete}>
            Delete event
          </button>
        )}
        {message && <p role="status">{message}</p>}
      </div>
    </article>
  );
}
