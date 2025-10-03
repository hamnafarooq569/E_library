import { useEffect, useState } from "react";

type Props = {
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  delayMs?: number;
};

export default function SearchBar({ placeholder = "Search notes…", value, onChange, delayMs = 350 }: Props) {
  const [inner, setInner] = useState(value);

  useEffect(() => { setInner(value); }, [value]);

  useEffect(() => {
    const t = setTimeout(() => onChange(inner.trim()), delayMs);
    return () => clearTimeout(t);
  }, [inner]);

  return (
    <input
      className="field"
      placeholder={placeholder}
      value={inner}
      onChange={(e) => setInner(e.target.value)}
      style={{ maxWidth: 420 }}
    />
  );
}
