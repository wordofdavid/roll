import events from "../data/events.json";
import EventCard from "../components/EventCard";

export default function EventsPage() {
  return (
    <main>
      <header>
        <h1>Upcoming Roller Skating Events</h1>
        <p>Find meetups, workshops, and community skate sessions.</p>
      </header>

      <section className="events-grid">
        {events.map(event => (
          <EventCard key={event.id} event={event} />
        ))}
      </section>
    </main>
  );
}