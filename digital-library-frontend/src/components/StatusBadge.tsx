export default function StatusBadge({ value }: { value?: string }) {
  const v = (value ?? "PENDING").toUpperCase();
  const color =
    v === "APPROVED" ? "#00e6a8" :
    v === "REJECTED" ? "crimson" :
    "#ffcc66";

  return (
    <span style={{
      display: "inline-block",
      padding: "2px 8px",
      borderRadius: 999,
      border: `1px solid ${color}`,
      color,
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: .2,
    }}>
      {v}
    </span>
  );
}
