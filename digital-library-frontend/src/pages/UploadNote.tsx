// src/pages/UploadNote.tsx
import { type FormEvent, useRef, useState } from "react";
import { uploadNote } from "../api/notes";
import { toast } from "../lib/toast";

export default function UploadNote() {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function pickFile() {
    fileInputRef.current?.click();
  }

  function onFileChange(f?: File | null) {
    setFile(f ?? null);
    setErr("");
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) onFileChange(f);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!file) {
      setErr("Please select a file.");
      return;
    }
    try {
      setBusy(true);
      setErr("");
      await uploadNote({ title, file });
      toast("Note uploaded! Pending admin approval.", "success");
      setTitle("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (e: any) {
      const m = e?.response?.data?.message ?? "Upload failed";
      setErr(m);
      toast(m, "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page" style={{ display: "flex", justifyContent: "center" }}>
      <div
        style={{
          width: "min(760px, 100%)",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 16,
          padding: 22,
          boxShadow: "0 10px 30px rgba(0,0,0,.25)",
        }}
      >
        <div style={{ marginBottom: 18 }}>
          <h1 style={{ margin: 0 }}>Upload Note</h1>
          <p className="text-muted" style={{ margin: "6px 0 0" }}>
            Upload a PDF or document (max 40 MB). Your note will appear after admin approval.
          </p>
        </div>

        <form onSubmit={onSubmit}>
          {/* Title */}
          <div style={{ marginBottom: 14 }}>
            <label>Title</label>
            <input
              className="field"
              placeholder="Enter title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Dropzone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={pickFile}
            role="button"
            tabIndex={0}
            style={{
              marginBottom: 12,
              padding: 16,
              borderRadius: 12,
              border: `2px dashed ${dragOver ? "var(--brand)" : "rgba(255,255,255,.2)"}`,
              background: dragOver ? "rgba(0,230,168,.07)" : "rgba(255,255,255,.02)",
              cursor: "pointer",
              transition: "all .15s ease",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 700 }}>Drag & drop your file here</div>
                <div className="text-muted" style={{ fontSize: 12 }}>…or click to choose</div>
              </div>
              <button type="button" className="btn btn-outline" onClick={pickFile}>
                Choose File
              </button>
            </div>
            <input
              ref={fileInputRef}
              id="fileInput"
              type="file"
              className="field"
              style={{ display: "none" }}
              onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
              // Narrow to common doc types if you want:
              // accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
            />
          </div>

          {/* Selected file chip */}
          {file && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 14,
                padding: "8px 12px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.06)",
                fontSize: 14,
              }}
            >
              <span style={{ fontWeight: 700 }}>{file.name}</span>
              <span className="text-muted">({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => onFileChange(null)}
                style={{ padding: "4px 10px" }}
              >
                Remove
              </button>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button className="btn" type="submit" disabled={busy || !file}>
              {busy ? "Uploading…" : "Upload"}
            </button>
            <span className="text-muted" style={{ fontSize: 12 }}>
              Tip: Clear, descriptive titles help others find your notes.
            </span>
          </div>

          {err && <p style={{ color: "var(--danger)", marginTop: 10 }}>{err}</p>}
        </form>
      </div>
    </div>
  );
}
