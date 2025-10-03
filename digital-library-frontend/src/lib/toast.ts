export function toast(msg: string, type: "success"|"error"="success") {
  let host = document.getElementById("toast-host");
  if (!host) {
    host = document.createElement("div");
    host.id = "toast-host";
    Object.assign(host.style, {
      position: "fixed", right: "16px", bottom: "16px", zIndex: "9999",
      display: "flex", flexDirection: "column", gap: "8px",
    });
    document.body.appendChild(host);
  }

  const el = document.createElement("div");
  el.textContent = msg;
  Object.assign(el.style, {
    background: type === "success" ? "rgba(0,230,168,.15)" : "rgba(229,72,77,.15)",
    color: type === "success" ? "#00e6a8" : "#e5484d",
    border: `1px solid ${type === "success" ? "#00e6a8" : "#e5484d"}`,
    padding: "10px 12px", borderRadius: "10px", fontWeight: 700, backdropFilter: "blur(4px)"
  });
  host.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}
