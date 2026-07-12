import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import EventsPage from "./pages/EventsPage";
import LoginPage from "./pages/LoginPage";
import SavedEventsPage from "./pages/SavedEventsPage";
import ProfilePage from "./pages/ProfilePage";
import CreateEventPage from "./pages/CreateEventPage";
import SignupPage from "./pages/SignUpPage";
import "./App.css";

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const isAuthPage = location.pathname === "/" || location.pathname === "/login" || location.pathname === "/signup";

  async function handleLogout() {
    try {
      await fetch("http://localhost:3000/api/logout", { method: "POST", credentials: "include" });
    } catch { /* still clear local login state */ }
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("username");

    navigate("/login", { replace: true });
  }

  return (
    <>
      <nav className="main-nav">
        {isLoggedIn && !isAuthPage ? (
          <>
            <Link to="/events">Events</Link>
            <Link to="/saved-events">Saved Events</Link>
            <Link to="/profile">Profile</Link>
            <Link to="/create-event">Create Event</Link>

            <button type="button" onClick={handleLogout}>
              Log Out
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Log In</Link>
            <Link to="/signup">Sign Up</Link>
          </>
        )}
      </nav>

      <Routes>
        {/* First page */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        {/* Public pages */}
        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/signup"
          element={<SignupPage />}
        />

        {/* Protected pages */}
        <Route element={<ProtectedRoute />}>
          <Route path="/events" element={<EventsPage />} />
          <Route
            path="/saved-events"
            element={<SavedEventsPage />}
          />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/create-event" element={<CreateEventPage />} />
        </Route>

        {/* Unknown URL */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
