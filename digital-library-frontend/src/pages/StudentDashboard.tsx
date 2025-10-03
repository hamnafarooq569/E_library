import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getMyNotes, getPreviewUrl, fetchNoteDownload, type Note } from "../api/notes";
import { useAuth } from "../auth/AuthContext";

export default function StudentDashboard() {
  const { user, isAuthed } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!isAuthed) return;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const data = await getMyNotes();
        setNotes(data);
      } catch (e: any) {
        setErr(e?.response?.data?.message ?? "Failed to load your notes");
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthed]);

  const stats = useMemo(() => {
    const s = { APPROVED: 0, PENDING: 0, REJECTED: 0, TOTAL: 0 };
    for (const n of notes) {
      const st = (n.status ?? "PENDING").toUpperCase() as "APPROVED" | "PENDING" | "REJECTED";
      (s as any)[st] = ((s as any)[st] ?? 0) + 1;
      s.TOTAL += 1;
    }
    return s;
  }, [notes]);

  const recent = useMemo(() => {
    const sorted = [...notes].sort((a, b) => {
      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return db - da;
    });
    return sorted.slice(0, 5);
  }, [notes]);

  async function onDownload(note: Note) {
    try {
      const { blob, filename } = await fetchNoteDownload(note.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename || `${note.title || "note"}-${note.id}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(e?.response?.data?.message ?? "Download failed");
    }
  }

  function onPreview(id: number) {
    window.open(getPreviewUrl(id), "_blank", "noopener,noreferrer");
  }

  return (
    <div className="page">
      <h1 style={{ marginBottom: 12 }}>Welcome{user?.email ? `, ${user.email}` : ""}</h1>
      <p className="text-muted" style={{ marginTop: 0 }}>Here’s a quick snapshot of your Digital Library.</p>

      {/* Quick links (use Router Links to avoid full reloads) */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", margin: "12px 0 20px" }}>
        <Link className="btn" to="/upload">Upload</Link>
        <Link className="btn btn-outline" to="/notes">My Notes</Link>
        <Link className="btn btn-outline" to="/feed">Feed</Link>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
        <StatCard label="Approved" value={stats.APPROVED} color="#00e6a8" />
        <StatCard label="Pending" value={stats.PENDING} color="#ffcc66" />
        <StatCard label="Rejected" value={stats.REJECTED} color="crimson" />
        <StatCard label="Total" value={stats.TOTAL} />
      </div>

      {loading && <p className="text-muted" style={{ marginTop: 16 }}>Loading…</p>}
      {err && <p style={{ color: "var(--danger)", marginTop: 16 }}>{err}</p>}

      {/* Recent uploads */}
      <h3 style={{ marginTop: 24 }}>Recent uploads</h3>
      {recent.length === 0 ? (
        <p className="text-muted">No uploads yet. Try uploading your first note.</p>
      ) : (
        <ul style={{ paddingLeft: 0, listStyle: "none", marginTop: 12 }}>
          {recent.map((n) => (
            <li
              key={n.id}
              style={{
                marginBottom: 12,
                padding: 14,
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 12,
                background: "rgba(255,255,255,0.03)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{n.title}</div>
                  <div className="text-muted" style={{ fontSize: 13 }}>
                    {n.createdAt ? new Date(n.createdAt).toLocaleString() : "—"} · Status:{" "}
                    <strong style={{ color: n.status === "APPROVED" ? "#00e6a8" : n.status === "REJECTED" ? "crimson" : "#ffcc66" }}>
                      {n.status ?? "PENDING"}
                    </strong>
                    {" · "}Downloads: {n.downloads ?? 0}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <button className="btn btn-outline" onClick={() => onPreview(n.id)}>Preview</button>
                  <button className="btn" onClick={() => onDownload(n)}>Download</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div style={{
      border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: 14,
      padding: 14,
      background: "rgba(255,255,255,0.04)"
    }}>
      <div className="text-muted" style={{ fontSize: 13 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: color ?? "var(--text)" }}>{value}</div>
    </div>
  );
}
