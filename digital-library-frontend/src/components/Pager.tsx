type Props = { page: number; limit: number; total: number; onPage: (p: number) => void };

export default function Pager({ page, limit, total, onPage }: Props) {
  const pages = Math.max(1, Math.ceil(total / (limit || 10)));
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12 }}>
      <button className="btn btn-outline" onClick={() => onPage(Math.max(1, page - 1))} disabled={page <= 1}>Prev</button>
      <span className="text-muted">Page {page} / {pages}</span>
      <button className="btn btn-outline" onClick={() => onPage(Math.min(pages, page + 1))} disabled={page >= pages}>Next</button>
    </div>
  );
}
