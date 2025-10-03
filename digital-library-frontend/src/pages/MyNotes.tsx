import { useEffect, useState } from "react";
import { getMyNotes, type Note } from "../api/notes";
import StatusBadge from "../components/StatusBadge";

export default function MyNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [debug, setDebug] = useState<any>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setLoading(true);
      setErr("");
      const res = await getMyNotes();
      setNotes(res);
      setDebug({ count: res.length });
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? e?.message ?? "Failed to load notes");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h1 style={{ margin: 0 }}>My Notes</h1>
        <button className="btn btn-outline" onClick={load}>Refresh</button>
      </div>

      {loading && <p className="text-muted">Loading…</p>}
      {err && <p style={{ color: "var(--danger)" }}>{err}</p>}
      {!loading && !err && notes.length === 0 && <p>No notes yet.</p>}

      {notes.length > 0 && (
        <ul style={{ marginTop: 16, paddingLeft: 0, listStyle: "none" }}>
          {notes.map((n) => (
            <li
              key={n.id}
              style={{
                marginBottom: 12,
                padding: 12,
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 10,
                background: "rgba(255,255,255,0.03)",
              }}
            >
              <h3 style={{ margin: "0 0 6px" }}>{n.title}</h3>
              <p className="text-muted" style={{ margin: 0 }}>
                Status: <StatusBadge value={n.status} /> • Downloads: {n.downloads ?? 0}
              </p>
            </li>
          ))}
        </ul>
      )}

      {/* tiny debug breadcrumb so we know what's happening */}
      {!loading && !err && (
        <p className="text-muted" style={{ marginTop: 8, fontSize: 12 }}>
          Debug: {JSON.stringify(debug)}
        </p>
      )}
    </div>
  );
}
