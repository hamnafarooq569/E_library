// src/pages/Register.tsx
import { type FormEvent, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../api/auth";
import { useAuth } from "../auth/AuthContext";

export default function Register() {
  const { login } = useAuth(); // reuse existing login to get token
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      setErr("");
      setBusy(true);
      await registerUser({ email, name, password }); // create user
      await login(email, password); // get token + store user
      nav("/dashboard"); // 👈 changed from /notes → /dashboard
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? e?.message ?? "Registration failed");
    } finally {
      setBusy(false);
    }
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
          borderRadius: 12,
          boxShadow: "0 6px 18px rgba(0,0,0,0.3)",
        }}
      >
        <h1 style={{ textAlign: "center", marginBottom: 20 }}>Register</h1>

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
            <label style={{ fontWeight: 500 }}>Name</label>
            <input
              className="field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              style={{ marginTop: 6 }}
            />
          </div>

          <div style={{ marginBottom: 10 }}>
            <label style={{ fontWeight: 500 }}>Password</label>
            <input
              className="field"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ marginTop: 6 }}
            />
            <small
              className="text-muted"
              style={{ display: "block", marginTop: 6 }}
            >
              Minimum 6 characters.
            </small>
          </div>

          <button
            className="btn"
            type="submit"
            disabled={busy}
            style={{ width: "100%", marginTop: 10 }}
          >
            {busy ? "Creating…" : "Sign up"}
          </button>

          {err && (
            <p
              style={{
                color: "var(--danger)",
                marginTop: 10,
                textAlign: "center",
              }}
            >
              {err}
            </p>
          )}
        </form>

        <div style={{ marginTop: 20, textAlign: "center" }}>
          <p style={{ marginBottom: 0 }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "var(--brand)", fontWeight: 600 }}>
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
