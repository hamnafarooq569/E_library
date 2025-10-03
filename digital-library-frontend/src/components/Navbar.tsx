import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Navbar() {
  const { isAuthed, logout, user } = useAuth();
  const nav = useNavigate();
  const { pathname } = useLocation();

  const hideFeed = pathname === "/login" || pathname === "/register";

  return (
    <nav className="navbar">
      <h2 className="logo">Digital Library</h2>
      <div className="links">
        {/* Public link (hide on login + register pages) */}
        {!hideFeed && <Link to="/feed">Feed</Link>}
        {isAuthed && <Link to="/dashboard">Dashboard</Link>}

        {/* Only when signed in */}
        {isAuthed && (
          <>
            <Link to="/notes">My Notes</Link>
            <Link to="/upload">Upload</Link>
          </>
        )}

        {!isAuthed && <Link to="/register">Register</Link>}

        {/* Admin-only */}
        {user?.role?.toUpperCase() === "ADMIN" && <Link to="/admin">Admin</Link>}

        {/* Auth action */}
        {!isAuthed ? (
          <Link to="/login">Login</Link>
        ) : (
          <button
            onClick={() => {
              logout();
              nav("/login");
            }}
            style={{
              background: "transparent",
              color: "var(--text)",
              border: 0,
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
