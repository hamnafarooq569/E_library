import { getPreviewUrl, fetchNoteDownload, type Note } from "../api/notes";
import { useAuth } from "../auth/AuthContext";

export default function NoteCard({ note }: { note: Note }) {
  const { isAuthed } = useAuth();

  async function onDownload() {
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

  function onPreview() {
    // Public preview endpoint (approved files only)
    const w = window.open(getPreviewUrl(note.id), "_blank");
    if (!w) {
      alert("Preview was blocked by your browser. Please allow pop-ups for this site.");
    }
  }

  return (
    <li
      style={{
        marginBottom: 12,
        padding: 14,
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 12,
        background: "rgba(255,255,255,0.03)",
        listStyle: "none",
      }}
    >
      <h3 style={{ margin: "0 0 6px" }}>{note.title}</h3>
      <p className="text-muted" style={{ margin: 0 }}>Downloads: {note.downloads ?? 0}</p>
      <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
        <button className="btn btn-outline" onClick={onPreview}>Preview</button>
        {isAuthed && (
          <button className="btn" onClick={onDownload}>Download</button>
        )}
      </div>
    </li>
  );
}
