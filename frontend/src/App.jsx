import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import EventsPage from "./pages/EventsPage";
import SavedEventsPage from "./pages/SavedEventsPage";
import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <nav className="main-nav">
        <Link to="/events">Events</Link>
        <Link to="/saved-events">Saved Events</Link>
      </nav>

      <Routes>
        <Route path="/events" element={<EventsPage />} />
        <Route path="/saved-events" element={<SavedEventsPage />} />
      </Routes>
    </BrowserRouter>
  );
}