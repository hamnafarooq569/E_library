import api from "./client";
import type { Note } from "./notes";


// Pending notes (admin only)
export async function getPendingNotes(page = 1, limit = 10): Promise<Note[]> {
  const { data } = await api.get("/notes/pending", { params: { page, limit } });
  return Array.isArray(data?.items) ? data.items : data;
}

export async function approveNote(id: number) {
  const { data } = await api.post(`/notes/${id}/approve`, {}); // explicit body
  return data;
}

export async function rejectNote(id: number) {
  const { data } = await api.post(`/notes/${id}/reject`, {}); // 👈 explicit body fixes 405/415 quirks
  return data;
}

export async function getAdminSummary() {
  const { data } = await api.get("/notes/admin/summary");
  return data;
}
