import { useEffect, useState } from "react";
import EventCard from "../components/EventCard";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");

  function removeEventFromPage(eventId) {
    setEvents((currentEvents) => currentEvents.filter((event) => event.id !== eventId));
  }

  useEffect(() => {
    fetch("http://localhost:3000/api/events", {
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) throw new Error();
        return response.json();
      })
      .then((data) => setEvents(data.events))
      .catch(() => setError("Could not load events. Make sure the backend is running."));
  }, []);

  return (
    <main className="events-page-background">
      <div className="events-content-panel">
      <header>
        <h1>Upcoming Roller Skating Events</h1>
        <p>Find meetups, workshops, and community skate sessions.</p>
      </header>
      {error && <p role="alert">{error}</p>}
      {!error && events.length === 0 ? <p>No events have been created yet.</p> : (
        <section className="events-grid">
          {events.map((event) => <EventCard key={event.id} event={event} onDeleted={removeEventFromPage} />)}
        </section>
      )}
      </div>
    </main>
  );
}
