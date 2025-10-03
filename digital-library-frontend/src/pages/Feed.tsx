import { useEffect, useState } from "react";
import { getPublicFeed, type Note} from "../api/notes";
import SearchBar from "../components/SearchBar";
import Pager from "../components/Pager";
import NoteCard from "../components/NoteCard";

export default function Feed() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [items, setItems] = useState<Note[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function load(p = page, query = q) {
    try {
      setLoading(true);
      setErr("");
      const res = await getPublicFeed(query, p, limit);
      setItems(res.items ?? []);
      setTotal(res.total ?? res.items?.length ?? 0);
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? "Failed to load feed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(1, q); setPage(1); }, [q]);
  useEffect(() => { load(page, q); }, [page]);

  return (
    <div className="page">
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <SearchBar value={q} onChange={setQ} />
      </div>

      {loading && <p className="text-muted">Loading…</p>}
      {err && <p style={{ color: "var(--danger)" }}>{err}</p>}

      {!loading && !err && items.length === 0 && <p>No notes found.</p>}

      {items.length > 0 && (
        <>
          <ul style={{ marginTop: 16, paddingLeft: 0 }}>
            {items.map((n) => <NoteCard key={n.id} note={n} />)}
          </ul>
          <Pager page={page} limit={limit} total={total} onPage={setPage} />
        </>
      )}
    </div>
  );
}
