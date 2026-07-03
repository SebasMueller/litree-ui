// Primitives.jsx — shared low-level building blocks
// Reads tokens from /colors_and_type.css
// Exposes: Icon, Button, Badge, Checkbox, Tabs, CountPill, SectionLabel,
//          Cite, StatBox, RatingPill, RATING_TONES,
//          DisclosureChevron, DisclosurePanel, Tooltip

const { useState, useRef, useEffect } = React;

/* ───────── Icon ─────────
 * Fetches assets/icons/<name>.svg once and inlines it — robust in screenshots/exports.
 * Path is resolved against document.baseURI so it works from any HTML depth,
 * as long as the page sits next to an `assets/` folder (or has a <base> tag).
 * <Icon name="search" size={16} color="var(--lt-text-secondary)" />
 */
const __iconCache = (typeof window !== "undefined" && (window.__iconCache = window.__iconCache || {})) || {};
function Icon({ name, size = 16, color = "currentColor", style }) {
  const [svg, setSvg] = useState(__iconCache[name] || null);
  const hostRef = useRef(null);

  useEffect(() => {
    if (__iconCache[name]) { setSvg(__iconCache[name]); return; }
    let ok = true;
    const base = (typeof window !== "undefined" && window.LT_ASSETS_BASE) || "assets/";
    const url = new URL(`${base}icons/${name}.svg`, document.baseURI).toString();
    fetch(url)
      .then(r => r.ok ? r.text() : "")
      .then(t => {
        if (!t) return;
        __iconCache[name] = t;
        if (ok) setSvg(t);
      })
      .catch(() => {});
    return () => { ok = false; };
  }, [name]);

  // Parse SVG string in the SVG namespace and inject as a real node.
  // innerHTML in an HTML context can't create properly-namespaced SVG child
  // elements (rect/path/circle etc.), which made some icons render as hairlines.
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    host.replaceChildren(); // clear
    if (!svg) return;
    const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
    const root = doc.documentElement;
    if (!root || root.tagName.toLowerCase() !== "svg") return;
    root.setAttribute("width", size);
    root.setAttribute("height", size);
    // let CSS color cascade through
    if (!root.getAttribute("stroke")) root.setAttribute("stroke", "currentColor");
    host.appendChild(document.importNode(root, true));
  }, [svg, size]);

  return (
    <span ref={hostRef} aria-hidden="true"
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: size, height: size, flexShrink: 0,
        color, lineHeight: 0, ...style,
      }}
    />
  );
}

/* ───────── Button ─────────
 * Variants: primary | secondary | ghost | danger | icon
 * Sizes:    sm | md | lg
 * States:   default | hover (auto) | pressed | focused | loading | disabled
 * The pressed/focused props force those visual states so preview pages can
 * render a reference grid of all states side-by-side.
 */
function Button({
  variant = "primary",
  size = "md",
  leftIcon, rightIcon,
  children, onClick, disabled, loading,
  pressed, focused,                        // preview-forced states
  style,
}) {
  const base = {
    font: "500 14px/1 var(--lt-font-sans)",
    letterSpacing: "-0.01em",
    border: 0, cursor: disabled ? "default" : "pointer",
    display: "inline-flex", alignItems: "center", gap: 8,
    transition: "background-color 140ms ease, color 140ms ease, box-shadow 140ms ease",
    opacity: disabled ? 0.5 : 1,
    whiteSpace: "nowrap",
    outline: "none",
  };
  const heights = { sm: 28, md: 36, lg: 44 };
  const paddings = { sm: "0 10px", md: "0 14px", lg: "0 18px" };
  const fontSizes = { sm: 13, md: 14, lg: 15 };
  const radii = { primary: 8, secondary: 6, ghost: 8, danger: 8, icon: 6 };
  const variants = {
    primary:   { background: "var(--lt-accent)",   color: "var(--lt-text-on-accent)" },
    secondary: { background: "transparent",        color: "var(--lt-text-secondary)",
                 border: "1px solid var(--lt-border-input, var(--lt-border-default))" },
    ghost:     { background: "transparent",        color: "var(--lt-text-secondary)" },
    danger:    { background: "var(--lt-danger)",   color: "var(--lt-text-on-accent)" },
    icon:      { background: "transparent",        color: "var(--lt-text-secondary)" },
  };
  const pressedBg = {
    primary: "var(--lt-accent-pressed)", secondary: "var(--lt-bg-hover)",
    ghost: "var(--lt-bg-active)", danger: "var(--lt-danger-pressed)", icon: "var(--lt-bg-active)",
  }[variant];
  const hoverBg = {
    primary: "var(--lt-accent-hover)", secondary: "var(--lt-bg-active)",
    ghost: "var(--lt-bg-hover)", danger: "var(--lt-danger-hover)", icon: "var(--lt-bg-hover)",
  }[variant];
  const focusRing = {
    primary: "var(--lt-focus-ring-on-accent), 0 0 0 6px rgba(59,90,200,0.28)",
    danger:  "var(--lt-focus-ring-danger)",
    secondary: "var(--lt-focus-ring)",
    ghost:     "var(--lt-focus-ring)",
    icon:      "var(--lt-focus-ring)",
  }[variant];

  const [hover, setHover] = useState(false);
  // Keyboard-only focus ring: :focus-visible matches keyboard nav but not mouse
  // clicks, so the ring shows for keyboard users without flashing on click.
  const [focusVis, setFocusVis] = useState(false);
  const isIcon = variant === "icon";
  const dims = isIcon
    ? { width: 32, height: 32, padding: 0, justifyContent: "center" }
    : { height: heights[size], padding: paddings[size], fontSize: fontSizes[size] };

  const bg = pressed ? pressedBg
           : (hover && !disabled) ? hoverBg
           : variants[variant].background;

  return (
    <button
      onClick={disabled ? undefined : onClick} disabled={disabled}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      onFocus={(e) => { try { if (e.target.matches(":focus-visible")) setFocusVis(true); } catch (_) { setFocusVis(true); } }}
      onBlur={() => setFocusVis(false)}
      style={{ ...base, ...variants[variant], ...dims,
               borderRadius: radii[variant], background: bg,
               boxShadow: (focused || focusVis) ? focusRing : undefined,
               ...style }}
    >
      {loading && (
        <span style={{
          width: 12, height: 12, borderRadius: "50%",
          border: "1.5px solid currentColor", borderTopColor: "transparent",
          animation: "lt-spin 1s linear infinite", flexShrink: 0,
        }} />
      )}
      {!loading && leftIcon && <Icon name={leftIcon} size={14} color="currentColor" />}
      {children}
      {!loading && rightIcon && <Icon name={rightIcon} size={14} color="currentColor" />}
    </button>
  );
}

/* ───────── Badge ───────── */
function Badge({ status = "available", children }) {
  const map = {
    available: { bg: "var(--lt-success-subtle)", fg: "var(--lt-success)", dot: true },
    missing:   { bg: "var(--lt-danger-subtle)",  fg: "var(--lt-danger)",  dot: true },
    failed:    { bg: "var(--lt-danger-subtle)",  fg: "var(--lt-danger)",  dot: true },
    uploading: { bg: "transparent",               fg: "var(--lt-text-tertiary)", spinner: true },
    neutral:   { bg: "var(--lt-bg-stone)",        fg: "var(--lt-text-secondary)" },
  };
  const s = map[status];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      background: s.bg, color: s.fg,
      borderRadius: 9999, padding: "4px 8px",
      font: "500 11px/1 var(--lt-font-sans)", letterSpacing: "-0.01em",
    }}>
      {s.dot && <span style={{ width: 5, height: 5, borderRadius: 5, background: s.fg }} />}
      {s.spinner && <span className="lt-spinner" />}
      {children}
    </span>
  );
}

/* ───────── Checkbox ───────── */
function Checkbox({ checked, onChange, size = 16 }) {
  return (
    <button onClick={() => onChange && onChange(!checked)}
      aria-pressed={checked}
      style={{
        width: size, height: size,
        borderRadius: 4, padding: 0, cursor: "pointer",
        border: checked ? "1.5px solid var(--lt-accent)" : "1.5px solid var(--lt-border-input)",
        background: checked ? "var(--lt-accent)" : "var(--lt-bg-surface)",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
      }}>
      {checked && (
        <svg width={size - 6} height={size - 6} viewBox="0 0 24 24" fill="none"
             stroke="var(--lt-text-on-accent)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12l5 5 9-11" />
        </svg>
      )}
    </button>
  );
}

/* ───────── CountPill ───────── */
function CountPill({ children, active }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      background: active ? "var(--lt-accent-subtle)" : "var(--lt-bg-stone)",
      color:      active ? "var(--lt-accent)"        : "var(--lt-text-tertiary)",
      borderRadius: 9999,
      minWidth: 18, height: 18, padding: "0 5px", boxSizing: "border-box",
      font: "500 12px/1 var(--lt-font-sans)", letterSpacing: "-0.01em",
    }}>{children}</span>
  );
}

/* ───────── SectionLabel — canonical eyebrow (10.5px / 0.10em / 500) ─────────
 * The shared eyebrow spec across the product: side panels, sidebar group
 * headers, column headers, metric labels. One tracking (0.10em), one weight
 * (500). For very tight columns/chips, drop to the 10px compact size inline
 * (same tracking + weight) — see StatBox. */
function SectionLabel({ children, color, style }) {
  return (
    <div style={{
      font: "500 10.5px/1 var(--lt-font-sans)",
      letterSpacing: "0.10em", textTransform: "uppercase",
      color: color || "var(--lt-text-tertiary)", ...style,
    }}>{children}</div>
  );
}

/* ───────── Tabs ───────── */
function Tabs({ tabs, active, onChange }) {
  return (
    <div style={{
      display: "flex", gap: 24,
      borderBottom: "1px solid var(--lt-border-default)",
      padding: "0 4px",
    }}>
      {tabs.map(t => {
        const isActive = t.id === active;
        return (
          <button key={t.id} onClick={() => onChange(t.id)}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 4px 12px",
              background: "transparent", border: 0, cursor: "pointer",
              font: "500 13px/1 var(--lt-font-sans)", letterSpacing: "-0.01em",
              color: isActive ? "var(--lt-text-ink)" : "var(--lt-text-tertiary)",
              borderBottom: `1px solid ${isActive ? "var(--lt-accent)" : "transparent"}`,
              marginBottom: "-1px",
            }}>
            {t.label}
            <CountPill active={isActive}>{t.count}</CountPill>
          </button>
        );
      })}
    </div>
  );
}

/* ───────── Cite — citation chip [n] with smooth-scroll + flash ─────────
 * Caller contract: render references as `<li id="ref-{n}">…</li>` and
 * apply `transition: background-color 1.4s ease-out;` so the flash
 * fades out gracefully. */
function Cite({ n = 1 }) {
  const handleClick = (e) => {
    const target = document.getElementById(`ref-${n}`);
    if (!target) return;
    e.preventDefault();
    const rect = target.getBoundingClientRect();
    const top = window.scrollY + rect.top - 80;
    window.scrollTo({ top, behavior: "smooth" });
    target.style.backgroundColor = "var(--lt-accent-subtle)";
    window.setTimeout(() => { target.style.backgroundColor = ""; }, 1400);
  };
  return (
    <sup>
      <a href={`#ref-${n}`} onClick={handleClick}
        style={{
          font: "500 10.5px/1 var(--lt-font-sans)",
          color: "var(--lt-accent)",
          cursor: "pointer", textDecoration: "none",
          verticalAlign: "0.4em", marginLeft: 1,
        }}>[{n}]</a>
    </sup>
  );
}

/* ───────── StatBox — eyebrow + key value + sub + optional Tooltip ─────────
 * Sub-row ALWAYS reserves space (non-breaking space when empty) so a row of
 * StatBoxes aligns horizontally even when some carry a sub-line and others
 * don't. Eyebrow uses the 10px compact size + single-line ellipsis so dense
 * labels like "I² heterogeneity" fit tight columns without clipping. */
function StatBox({ label, value, sub, info, valueColor, valueSize = 17, style }) {
  return (
    <div style={{
      background: "var(--lt-bg-surface)",
      border: "1px solid var(--lt-border-subtle)",
      borderRadius: 8, padding: "10px 12px",
      display: "flex", flexDirection: "column", gap: 4,
      ...style,
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 5,
        // Compact eyebrow variant — explicit 10px (not the 10.5px canonical)
        // so dense StatBox labels fit tight columns. Same tracking + weight.
        font: "500 10px/1 var(--lt-font-sans)",
        letterSpacing: "0.10em", textTransform: "uppercase",
        color: "var(--lt-text-tertiary)",
        whiteSpace: "nowrap",
        overflow: "hidden", textOverflow: "ellipsis",
      }}>
        <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>
        {info && (
          <Tooltip content={info}>
            <span style={{ display: "inline-flex", color: "var(--lt-text-tertiary)", flexShrink: 0 }}>
              <Icon name="info" size={10} style={{ opacity: 0.7 }} />
            </span>
          </Tooltip>
        )}
      </div>
      <div style={{
        font: `500 ${valueSize}px/1.15 var(--lt-font-sans)`,
        letterSpacing: "-0.015em",
        color: valueColor || "var(--lt-text-primary)",
        fontVariantNumeric: "tabular-nums",
      }}>{value}</div>
      <div style={{
        font: "400 11.5px/1.2 var(--lt-font-sans)",
        color: "var(--lt-text-tertiary)",
        fontVariantNumeric: "tabular-nums",
        minHeight: "1em",
      }}>{sub || "\u00A0"}</div>
    </div>
  );
}

/* ───────── RatingPill — tone-coded quality badge ───────── */
const RATING_TONES = {
  "low":           { label: "Low",           bg: "var(--lt-success-subtle)", fg: "var(--lt-success)"      },
  "some-concerns": { label: "Some concerns", bg: "var(--lt-warn-subtle)",    fg: "var(--lt-warn-strong)"  },
  "high":          { label: "High",          bg: "var(--lt-danger-subtle)",  fg: "var(--lt-danger)"       },
};

function RatingPill({ rating, ratings = RATING_TONES, label, style }) {
  const tone = ratings[rating] || ratings["some-concerns"] || RATING_TONES["some-concerns"];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "3px 9px", borderRadius: 4,
      background: tone.bg, color: tone.fg,
      font: "500 11px/1 var(--lt-font-sans)",
      letterSpacing: "-0.005em",
      whiteSpace: "nowrap",
      ...style,
    }}>{label || tone.label}</span>
  );
}

/* ───────── DisclosureChevron — rotating chevron for collapsibles ─────────
 * variant="flip" → down (closed) → up (open). Card-level disclosures.
 * variant="tree" → right (closed) → down (open). Row-level / nested. */
function DisclosureChevron({
  open, variant = "flip", size = 14, color = "var(--lt-text-tertiary)", style,
}) {
  const boxSize = size + 8;
  const closedTransform = variant === "tree" ? "rotate(-90deg)" : "none";
  const openTransform   = variant === "tree" ? "rotate(0deg)"   : "rotate(180deg)";
  return (
    <span aria-hidden="true" style={{
      width: boxSize, height: boxSize, borderRadius: 6,
      color,
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      transition: "transform var(--lt-dur-base) var(--lt-ease-out)",
      transform: open ? openTransform : closedTransform,
      flexShrink: 0,
      ...style,
    }}>
      <Icon name="chevron-down" size={size} />
    </span>
  );
}

/* ───────── DisclosurePanel — animated collapse container ─────────
 * Requires `@keyframes lt-card-expand` in the host page CSS:
 *   @keyframes lt-card-expand {
 *     from { opacity: 0; transform: translateY(-4px); }
 *     to   { opacity: 1; transform: translateY(0); }
 *   } */
function DisclosurePanel({ open, children, style }) {
  if (!open) return null;
  return (
    <div style={{
      animation: "lt-card-expand 180ms var(--lt-ease-out) both",
      ...style,
    }}>{children}</div>
  );
}

/* ───────── Tooltip — hover/focus popover ─────────
 * Uses position: fixed with JS-calculated viewport coordinates so the popup
 * escapes any `overflow: hidden` ancestor. */
function Tooltip({ content, position = "top", maxWidth = 280, children }) {
  const [show, setShow] = useState(false);
  const [coords, setCoords] = useState({ left: 0, top: 0 });
  const triggerRef = useRef(null);
  if (!content) return children;

  const recalc = () => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setCoords({
      left: r.left + r.width / 2,
      top: position === "bottom" ? r.bottom + 8 : r.top - 8,
    });
  };

  return (
    <span
      ref={triggerRef}
      onMouseEnter={() => { recalc(); setShow(true); }}
      onMouseLeave={() => setShow(false)}
      onFocus={() => { recalc(); setShow(true); }}
      onBlur={() => setShow(false)}
      style={{ display: "inline-flex", alignItems: "center" }}>
      {children}
      {show && (
        <span role="tooltip" style={{
          position: "fixed",
          left: coords.left, top: coords.top,
          transform: position === "bottom"
            ? "translate(-50%, 0)"
            : "translate(-50%, -100%)",
          background: "var(--lt-text-ink)",
          color: "#FDFCFA",
          padding: "8px 10px",
          borderRadius: 6,
          font: "400 12px/1.45 var(--lt-font-sans)",
          letterSpacing: "-0.005em",
          maxWidth, width: "max-content",
          whiteSpace: "normal", textWrap: "pretty",
          zIndex: 10000, pointerEvents: "none",
          boxShadow: "var(--lt-elev-2, 0 4px 16px rgba(0,0,0,0.18))",
          animation: "lt-card-expand 120ms var(--lt-ease-out) both",
        }}>{content}</span>
      )}
    </span>
  );
}

Object.assign(window, {
  Icon, Button, Badge, Checkbox, CountPill, SectionLabel, Tabs,
  Cite, StatBox, RatingPill, RATING_TONES,
  DisclosureChevron, DisclosurePanel, Tooltip,
});
