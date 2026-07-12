import { useState } from "react";
import events from "../data/events.json";
import EventCard from "../components/EventCard";
import { getSavedEventIds } from "../utilities/savedEvents";

export default function SavedEventsPage() {
  const [savedIds] = useState(getSavedEventIds);

  const savedEvents = events.filter(event =>
    savedIds.includes(event.id)
  );

  return (
    <main className="events-page-background">
      <div className="events-content-panel">
      <h1>Saved Events</h1>

      {savedEvents.length === 0 ? (
        <div>
          <h2>No saved events yet</h2>
          <p>Explore upcoming events and save the ones you like.</p>
        </div>
      ) : (
        <section className="events-grid">
          {savedEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </section>
      )}
      </div>
    </main>
  );
}
