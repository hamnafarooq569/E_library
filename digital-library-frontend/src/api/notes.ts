// src/api/notes.ts
import api from "./client";

export type Note = {
  id: number;
  title: string;
  description?: string;
  tags?: string;
  originalName?: string;
  createdAt?: string;
  approved?: boolean;
  status?: "PENDING" | "APPROVED" | "REJECTED";
  downloads?: number;
};

// --- status normalizer (handles many backend shapes) ---
function normalizeStatus(n: any): "PENDING" | "APPROVED" | "REJECTED" {
  const raw =
    n.status ??
    n.reviewStatus ??
    n.moderation ??
    (n.rejected === true || n.isRejected === true ? "REJECTED" : undefined) ??
    (n.rejectedAt ? "REJECTED" : undefined);

  if (typeof raw === "string") {
    const up = raw.toUpperCase();
    if (up === "APPROVED" || up === "REJECTED" || up === "PENDING") return up as any;
  }

  if (n.approved === true) return "APPROVED";
  if (n.rejectedAt || n.rejected === true || n.isRejected === true) return "REJECTED";
  return "PENDING";
}

export async function getMyNotes(): Promise<Note[]> {
  const { data } = await api.get("/notes/me");
  console.debug("[getMyNotes] response:", data);

  const list = Array.isArray(data)
    ? data
    : (data?.items ?? data?.data ?? data?.rows ?? (Array.isArray(data?.notes) ? data.notes : []));

  return (list as any[]).map((n) => ({
    ...n,
    status: normalizeStatus(n),
  }));
}

export async function uploadNote(dto: { title: string; file: File }) {
  const form = new FormData();
  form.append("title", dto.title);
  form.append("file", dto.file);

  const { data } = await api.post("/notes/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data as Note;
}

// ---------- Public Feed (approved only) ----------
export type Paged<T> = { page: number; limit: number; total: number; items: T[] };

export async function getPublicFeed(q = "", page = 1, limit = 10): Promise<Paged<Note>> {
  const { data } = await api.get("/notes/public/feed", { params: { q, page, limit } });

  const items =
    data?.items ??
    data?.data ??
    data?.rows ??
    (Array.isArray(data) ? data : (Array.isArray(data?.notes) ? data.notes : []));

  const pageNum = Number(data?.page ?? page ?? 1);
  const limitNum = Number(data?.limit ?? limit ?? (Array.isArray(items) ? items.length : 10));
  const totalNum = Number(data?.total ?? (Array.isArray(items) ? items.length : 0));

  const normalizedItems = (items as any[]).map((n) => ({ ...n, status: normalizeStatus(n) }));

  return { page: pageNum, limit: limitNum, total: totalNum, items: normalizedItems };
}

// ---------- URL base helper (prevents "undefined" in hrefs) ----------
function apiBase() {
  const fromEnv = import.meta.env.VITE_API_BASE_URL as string | undefined;
  const fromAxios = (api.defaults?.baseURL as string) || "";
  const base = (fromEnv || fromAxios || "http://localhost:3000").replace(/\/+$/, "");
  return base;
}

// ---------- Preview (inline PDF/Doc) ----------
export function getPreviewUrl(noteId: number) {
  return `${apiBase()}/notes/${noteId}/preview`;
}

// ---------- Download (auth required) ----------
export function getDownloadUrl(noteId: number) {
  return `${apiBase()}/notes/${noteId}/download`;
}

// ---------- Download (auth) as Blob then save ----------
export async function fetchNoteDownload(noteId: number) {
  const res = await api.get(`/notes/${noteId}/download`, { responseType: "blob" });

  // Normalize header keys & parse filename (quoted or RFC5987)
  const headers = res.headers || {};
  const cd = headers["content-disposition"] || headers["Content-Disposition"];
  let filename = `note-${noteId}`;
  if (cd) {
    // Try RFC5987 first: filename*=UTF-8''encoded
    let m = /filename\*=(?:UTF-8''|)([^;]+)/i.exec(cd);
    if (m?.[1]) {
      try { filename = decodeURIComponent(m[1].replace(/^"(.*)"$/, "$1")); } catch {}
    } else {
      // Fallback: filename="quoted name.pdf"
      m = /filename="?([^"]+)"?/i.exec(cd);
      if (m?.[1]) filename = m[1];
    }
  }

  return { blob: res.data as Blob, filename };
}
