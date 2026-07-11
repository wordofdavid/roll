import { useState } from "react";
import {
  isEventSaved,
  saveEvent,
  removeSavedEvent
} from "../utilities/savedEvents";

export default function EventCard({ event }) {
  const [saved, setSaved] = useState(() => isEventSaved(event.id));

  function handleSaveToggle() {
    if (saved) {
      removeSavedEvent(event.id);
    } else {
      saveEvent(event.id);
    }

    setSaved(!saved);
  }

  return (
    <article className="event-card">
      <img src={event.imageUrl} alt="" />

      <div>
        <p>{event.skillLevel}</p>
        <h2>{event.name}</h2>
        <p>
          {event.date} at {event.time}
        </p>
        <p>
          {event.location}, {event.city}
        </p>
        <p>{event.description}</p>

        <button
          type="button"
          onClick={handleSaveToggle}
          aria-pressed={saved}
        >
          {saved ? "Saved ✓" : "Save event"}
        </button>
      </div>
    </article>
  );
}