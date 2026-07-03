// Dropdown.jsx — floating menu with items, dividers, destructive variant

function Dropdown({ anchor, items, open, onClose, align = "right", placement = "bottom" }) {
  const ref = useRef();
  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (!ref.current?.contains(e.target)) onClose(); };
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    setTimeout(() => document.addEventListener("mousedown", onDoc), 0);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || !anchor) return null;
  const rect = anchor.getBoundingClientRect();
  const MENU_W = 180;
  const MENU_H_ESTIMATE = items.length * 36 + 12;
  const vertical = placement === "top"
    ? { top: rect.top - MENU_H_ESTIMATE - 6 }
    : { top: rect.bottom + 6 };
  const horizontal = align === "right"
    ? { left: rect.right - MENU_W }
    : { left: rect.left };
  const style = { ...vertical, ...horizontal };

  return (
    <div ref={ref} onClick={(e) => e.stopPropagation()} style={{
      position: "fixed", ...style,
      width: 180, zIndex: 100,
      borderRadius: 12, background: "var(--lt-bg-surface)",
      boxShadow: "var(--lt-elev-3)",
      padding: 6,
      display: "flex", flexDirection: "column",
    }}>
      {items.map((it, i) =>
        it.divider
          ? <div key={i} style={{ height: 1, background: "var(--lt-border-subtle)", margin: "6px 4px" }} />
          : <MenuItem key={i} {...it} onClick={() => { onClose(); it.onClick?.(); }} />
      )}
    </div>
  );
}

function MenuItem({ icon, label, destructive, onClick }) {
  const [hover, setHover] = useState(false);
  const color = destructive ? "var(--lt-danger)" : "var(--lt-text-secondary)";
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "8px 10px", border: 0, cursor: "pointer", textAlign: "left",
        background: hover ? "var(--lt-bg-hover)" : "transparent",
        borderRadius: 6, color,
        font: "500 13px/1 var(--lt-font-sans)", letterSpacing: "-0.01em",
      }}>
      {icon && <Icon name={icon} size={16} color="currentColor" />}
      {label}
    </button>
  );
}

Object.assign(window, { Dropdown });
