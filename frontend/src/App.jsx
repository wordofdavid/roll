import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import EventsPage from "./pages/EventsPage";
import LoginPage from "./pages/LoginPage";
import SavedEventsPage from "./pages/SavedEventsPage";
import SignupPage from "./pages/SignUpPage";
import "./App.css";

function AppContent() {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  function handleLogout() {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("username");

    navigate("/login", { replace: true });
  }

  return (
    <>
      <nav className="main-nav">
        {isLoggedIn ? (
          <>
            <Link to="/events">Events</Link>
            <Link to="/saved-events">Saved Events</Link>

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
          element={
            <Navigate
              to={isLoggedIn ? "/events" : "/login"}
              replace
            />
          }
        />

        {/* Public pages */}
        <Route
          path="/login"
          element={
            isLoggedIn
              ? <Navigate to="/events" replace />
              : <LoginPage />
          }
        />

        <Route
          path="/signup"
          element={
            isLoggedIn
              ? <Navigate to="/events" replace />
              : <SignupPage />
          }
        />

        {/* Protected pages */}
        <Route element={<ProtectedRoute />}>
          <Route path="/events" element={<EventsPage />} />
          <Route
            path="/saved-events"
            element={<SavedEventsPage />}
          />
        </Route>

        {/* Unknown URL */}
        <Route
          path="*"
          element={
            <Navigate
              to={isLoggedIn ? "/events" : "/login"}
              replace
            />
          }
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