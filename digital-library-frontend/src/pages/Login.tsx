import { type FormEvent, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      setErr("");
      await login(email, password);
      nav("/dashboard"); // 👈 changed from /notes → /dashboard
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? "Login failed");
    }
  }

  function onGuest() {
    nav("/feed"); // 👈 guest users go straight to feed
  }

  return (
    <div
      className="page"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "80vh",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "rgba(255,255,255,0.04)",
          padding: "2rem",
          borderRadius: "12px",
          boxShadow: "0 6px 18px rgba(0,0,0,0.3)",
        }}
      >
        <h1 style={{ textAlign: "center", marginBottom: 20 }}>Login</h1>

        <form onSubmit={onSubmit} style={{ width: "100%" }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: 500 }}>Email</label>
            <input
              className="field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              style={{ marginTop: 6 }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: 500 }}>Password</label>
            <input
              className="field"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ marginTop: 6 }}
            />
          </div>
          <button
            className="btn"
            type="submit"
            style={{ width: "100%", marginTop: 10 }}
          >
            Sign in
          </button>
          {err && (
            <p style={{ color: "var(--danger)", marginTop: 10, textAlign: "center" }}>
              {err}
            </p>
          )}
        </form>

        <div style={{ marginTop: 20, textAlign: "center" }}>
          <p style={{ marginBottom: 10 }}>
            Don’t have an account?{" "}
            <Link to="/register" style={{ color: "var(--brand)", fontWeight: 600 }}>
              Create one
            </Link>
          </p>
          <button
            onClick={onGuest}
            className="btn btn-outline"
            style={{ width: "100%" }}
          >
            Log in as Guest
          </button>
        </div>
      </div>
    </div>
  );
}
