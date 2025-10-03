import { useEffect, useState } from "react";
import { getPendingNotes, approveNote, rejectNote, getAdminSummary } from "../api/admin";
import { useAuth } from "../auth/AuthContext";
import type { Note } from "../api/notes";
import { toast } from "../lib/toast";

export default function Admin() {
  const { user } = useAuth();
  const [pending, setPending] = useState<Note[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (user?.role?.toUpperCase() === "ADMIN") load();
  }, [user]);

  async function load() {
    try {
      setLoading(true);
      setMsg("");
      const [p, s] = await Promise.all([getPendingNotes(), getAdminSummary()]);
      setPending(p);
      setSummary(s);
    } catch (e: any) {
      console.error(e);
      setMsg(e?.response?.data?.message ?? e?.message ?? "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id: number) {
    try {
      setMsg("");
      await approveNote(id);
      setMsg(`✅ Note #${id} approved`);
      toast(`Note #${id} approved`, "success");
      // remove from local state immediately
      setPending((prev) => prev.filter((n) => n.id !== id));
      // optionally refresh summary only
      try {
        const s = await getAdminSummary();
        setSummary(s);
      } catch {}
    } catch (e: any) {
      console.error(e);
      const m = e?.response?.data?.message ?? e?.message ?? `Approve failed for #${id}`;
      setMsg(m);
      toast(m, "error");
    }
  }

  async function handleReject(id: number) {
    try {
        setMsg("");
        await rejectNote(id); // posts {}
        setMsg(`❌ Note #${id} rejected`);
        toast(`Note #${id} rejected`, "success");
        // remove from local state immediately
        setPending((prev) => prev.filter((n) => n.id !== id));
        // optionally refresh summary only
        try {
          const s = await getAdminSummary();
          setSummary(s);
        } catch {}
    } catch (e: any) {
        console.error(e);
        const m = e?.response?.data?.message ?? e?.message ?? `Reject failed for #${id}`;
        setMsg(m);
        toast(m, "error");
    }
    }
  if (user?.role?.toUpperCase() !== "ADMIN") {
    return <div className="page"><h1>Forbidden</h1><p>Admins only</p></div>;
  }

  return (
    <div className="page">
      <h1>Admin Dashboard</h1>
      {msg && <p style={{ color: "var(--brand)" }}>{msg}</p>}

      {summary && (
        <div style={{ marginBottom: 20 }}>
          <h3>Summary</h3>
          <p>Total notes: {summary.total}</p>
          <p>Approved: {summary.approved}</p>
          <p>Pending: {summary.pending}</p>
          <p>Rejected: {summary.rejected}</p>
        </div>
      )}

      <h3>Pending Notes</h3>
      {loading && <p>Loading…</p>}
      {pending.length === 0 && !loading && <p>No pending notes.</p>}

      <ul style={{ listStyle: "none", paddingLeft: 0 }}>
        {pending.map((n) => (
          <li key={n.id} style={{ marginBottom: 12, padding: 12, border: "1px solid #333", borderRadius: 8 }}>
            <h4>{n.title}</h4>
            <p>{n.description ?? "No description"}</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn" onClick={() => handleApprove(n.id)}>Approve</button>
              <button
                className="btn btn-outline"
                style={{ borderColor: "crimson", color: "crimson" }}
                onClick={() => handleReject(n.id)}
              >
                Reject
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
