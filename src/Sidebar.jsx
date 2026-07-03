// Sidebar.jsx — left rail matching preview/sidebar.html
// 248 px expanded, warm stone bg, collapsible.
// Layout top → bottom: brand row · New project · PROJECTS overline · list · footer (Documentation + user chip).

function Sidebar({ projects, activeProjectId, onSelectProject, onNewProject, onDeleteProject, user, badge, feedback, docsHref, systemHealth, storageKey = "litree:sidebar-collapsed", defaultCollapsed = false, defaultMenuOpen = false, searchable = false, searchThreshold = 8, searchPlaceholder = "Search projects", collapseAfter = 0, listLabel = "Projects", defaultQuery = "" }) {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      const v = storageKey ? localStorage.getItem(storageKey) : null;
      return v === null ? !!defaultCollapsed : v === "1";
    } catch (e) { return !!defaultCollapsed; }
  });
  useEffect(() => {
    if (!storageKey) return;
    try { localStorage.setItem(storageKey, collapsed ? "1" : "0"); } catch (e) {}
  }, [collapsed, storageKey]);

  // Brand wordmark resolves against the same configurable base as icons
  // (window.LT_ASSETS_BASE, default "assets/"). Set it once in the host app
  // so the logo + icons load from wherever you serve static assets.
  const assetBase = (typeof window !== "undefined" && window.LT_ASSETS_BASE) || "assets/";
  const logoSrc = new URL(`${assetBase}logo-litree.png`, document.baseURI).toString();
  const logoDarkSrc = new URL(`${assetBase}logo-litree-dark.png`, document.baseURI).toString();

  // User menu (owned by the sidebar — matches preview/sidebar.html .sb-menu spec exactly)
  const [menuOpen, setMenuOpen] = useState(!!defaultMenuOpen);
  const [npHover, setNpHover] = useState(false);
  const [accHover, setAccHover] = useState(false);
  // Theme — opt-in dark mode via data-theme on <html>, persisted. Lives in the
  // user menu (conventional home for appearance, à la Linear / GitHub).
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("litree:theme")
        || document.documentElement.getAttribute("data-theme")
        || "light";
    } catch (e) { return "light"; }
  });
  useEffect(() => {
    try {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("litree:theme", theme);
    } catch (e) {}
  }, [theme]);

  // System health — Litree depends on external services; if one is down,
  // search or review generation fails. A status dot in the footer surfaces this
  // at a glance and opens a detail panel. Default data is illustrative.
  const [healthOpen, setHealthOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const health = systemHealth || {
    state: "operational",
    lastChecked: "22:06:14",
    services: [
      { name: "Supabase",    state: "operational", detail: "Database query succeeded.",            latency: "166ms" },
      { name: "EBSCO",       state: "operational", detail: "Authentication and session check succeeded.", latency: "1190ms" },
      { name: "OpenRouter",  state: "operational", detail: "Reachable.",                            latency: "140ms" },
      { name: "OpenAlex",    state: "operational", detail: "Reachable.",                            latency: "498ms" },
      { name: "Trigger.dev", state: "operational", detail: "Server key is configured.",             latency: "1ms" },
    ],
  };
  const healthColor = { operational: "var(--lt-success)", degraded: "var(--lt-warn)", outage: "var(--lt-danger)" }[health.state] || "var(--lt-success)";
  const healthLabel = { operational: "All systems operational", degraded: "Degraded performance", outage: "Service outage" }[health.state] || "All systems operational";
  // Optional list controls (all opt-in via props):
  //  · searchable    → filter field above the list
  //  · collapseAfter → cap the visible rows, with a "Show all (N)" toggle
  //  · project.date  → renders a second muted line under the title
  const [query, setQuery] = useState(defaultQuery);
  const [showAll, setShowAll] = useState(false);
  const [searchFocus, setSearchFocus] = useState(false);
  const sidebarRef = useRef();
  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e) => { if (!sidebarRef.current?.contains(e.target)) setMenuOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setMenuOpen(false); };
    setTimeout(() => document.addEventListener("mousedown", onDoc), 0);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const width = collapsed ? 56 : 248;

  // Derived list: search filters by name; collapseAfter caps the rows until
  // "Show all" is toggled (search always shows every match, ignoring the cap).
  // Search only earns its space on lists long enough to be worth filtering:
  // it appears when `searchable` AND the list reaches `searchThreshold`. Below
  // that, the bar would be noise over a handful of rows, so it auto-hides.
  const showSearch = searchable && projects.length >= searchThreshold;
  const q = (showSearch ? query : "").trim().toLowerCase();
  const filtered = q ? projects.filter(p => (p.name || "").toLowerCase().includes(q)) : projects;
  const limited = collapseAfter > 0 && !q && !showAll && filtered.length > collapseAfter;
  const visibleProjects = limited ? filtered.slice(0, collapseAfter) : filtered;
  const showCount = (showSearch || collapseAfter > 0) && projects.length > 0;

  // Arrow-key roaming over the project rows (↑/↓, Home/End). Enter/Space are
  // handled natively by the row <button>. Keeps the list usable as primary nav.
  function onListKeyDown(e) {
    const keys = ["ArrowDown", "ArrowUp", "Home", "End"];
    if (!keys.includes(e.key)) return;
    const items = Array.from(e.currentTarget.querySelectorAll('[data-project-row]'));
    if (!items.length) return;
    const idx = items.indexOf(document.activeElement);
    e.preventDefault();
    let next;
    if (e.key === "ArrowDown") next = items[idx < 0 ? 0 : Math.min(items.length - 1, idx + 1)];
    else if (e.key === "ArrowUp") next = items[idx < 0 ? items.length - 1 : Math.max(0, idx - 1)];
    else if (e.key === "Home") next = items[0];
    else next = items[items.length - 1];
    if (next) next.focus();
  }

  return (
    <aside ref={sidebarRef} style={{
      width, flexShrink: 0, alignSelf: "stretch", boxSizing: "border-box",
      background: "var(--lt-bg-sidebar)",
      borderRight: "1px solid var(--lt-border-default)",
      display: "flex", flexDirection: "column",
      padding: collapsed ? "16px 8px 12px" : "16px 12px 12px",
      transition: "width var(--lt-dur-slow) var(--lt-ease-out), padding var(--lt-dur-slow) var(--lt-ease-out)",
      position: "relative",
    }}>
      {/* Brand row */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: collapsed ? "center" : "flex-start",
        gap: 8, padding: collapsed ? "2px 0 6px" : "2px 6px 6px",
        height: 38, boxSizing: "content-box",
      }}>
        {collapsed ? (
          <button title="Expand sidebar"
            onClick={() => setCollapsed(false)}
            style={{
              width: 24, height: 24,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              background: "transparent", border: 0, borderRadius: 4, padding: 0,
              color: "var(--lt-text-tertiary)", cursor: "pointer",
            }}>
            <Icon name="panel-left" size={16} color="currentColor" />
          </button>
        ) : (
          <>
            <img className="lt-wordmark-light" src={logoSrc} alt="litree" style={{ height: 34, width: "auto" }} />
            <img className="lt-wordmark-dark" src={logoDarkSrc} alt="litree" style={{ height: 34, width: "auto" }} />
            {badge && (
              <span style={{
                font: "600 9.5px/1 var(--lt-font-sans)", letterSpacing: "0.06em", textTransform: "uppercase",
                color: "var(--lt-accent)", background: "var(--lt-accent-subtle)",
                border: "1px solid var(--lt-border-subtle)",
                padding: "3px 6px", borderRadius: "var(--lt-radius-full)",
                alignSelf: "center",
              }}>{badge}</span>
            )}
            <button title="Collapse sidebar"
              onClick={() => setCollapsed(true)}
              style={{
                marginLeft: "auto", width: 24, height: 24,
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                background: "transparent", border: 0, borderRadius: 4, padding: 0,
                color: "var(--lt-text-tertiary)", cursor: "pointer",
              }}>
              <Icon name="panel-left" size={16} color="currentColor" />
            </button>
          </>
        )}
      </div>

      {/* New project — full-width primary CTA when expanded (sidebar convention:
          larger hit target, flush with the search field + list below), and a
          32×32 icon button when collapsed. */}
      <button onClick={onNewProject}
        title={collapsed ? "New project" : undefined}
        onMouseEnter={() => setNpHover(true)} onMouseLeave={() => setNpHover(false)}
        style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          gap: 6, height: collapsed ? 32 : 36, padding: collapsed ? 0 : "0 12px",
          width: collapsed ? 32 : "auto", alignSelf: collapsed ? "center" : "stretch",
          background: npHover ? "var(--lt-accent-solid-hover)" : "var(--lt-accent-solid)", color: "var(--lt-text-on-accent)",
          border: 0, borderRadius: "var(--lt-radius-md)",
          font: "var(--lt-button)", letterSpacing: "-0.01em",
          cursor: "pointer", margin: collapsed ? "14px auto 0" : "14px 8px 0",
          transition: "var(--lt-transition-colors)",
        }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <path d="M12 5v14M5 12h14" />
        </svg>
        {!collapsed && <span>New project</span>}
      </button>

      {/* Search */}
      {!collapsed && showSearch && (
        <div style={{ position: "relative", margin: "12px 8px 0" }}>
          <span style={{
            position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)",
            display: "inline-flex", color: "var(--lt-text-tertiary)", pointerEvents: "none",
          }}>
            <Icon name="search" size={15} color="currentColor" />
          </span>
          <input
            type="text" value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setSearchFocus(true)} onBlur={() => setSearchFocus(false)}
            placeholder={searchPlaceholder} aria-label={searchPlaceholder}
            style={{
              width: "100%", boxSizing: "border-box", height: 34,
              padding: "0 10px 0 30px",
              background: "var(--lt-bg-surface)",
              border: `1px solid ${searchFocus ? "var(--lt-accent)" : "var(--lt-border-input)"}`,
              borderRadius: "var(--lt-radius-md)",
              boxShadow: searchFocus ? "var(--lt-focus-ring)" : "none",
              font: "var(--lt-body)", letterSpacing: "-0.01em",
              color: "var(--lt-text-primary)", outline: "none",
              transition: "var(--lt-transition-colors)",
            }} />
        </div>
      )}

      {/* List overline (with optional count) */}
      {!collapsed && (
        <div style={{
          font: "var(--lt-overline)", letterSpacing: "0.1em", textTransform: "uppercase",
          color: "var(--lt-text-tertiary)", padding: "0 10px", margin: "20px 0 8px",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <span>{listLabel}</span>
          {showCount && (
            <span style={{ color: "var(--lt-text-disabled)", letterSpacing: "0.04em" }}>
              &middot; {filtered.length}
            </span>
          )}
        </div>
      )}

      {/* Project list. Collapsed shows NO per-item markers (Notion / VS Code
          pattern — the rail is an expand affordance, not a project switcher);
          identity lives in the expanded list. Arrow keys roam the rows. */}
      <div role="list" onKeyDown={collapsed ? undefined : onListKeyDown} style={{
        display: "flex", flexDirection: "column",
        gap: collapsed ? 2 : 4,
        flex: "1 1 auto", overflowY: "auto", minHeight: 0,
        marginTop: collapsed ? 24 : 0,
      }}>
        {!collapsed && visibleProjects.map(p => (
          <ProjectItem key={p.id}
            project={p}
            active={p.id === activeProjectId}
            onClick={() => onSelectProject(p.id)}
            onDelete={onDeleteProject ? () => onDeleteProject(p.id) : undefined} />
        ))}

        {/* No projects at all */}
        {!collapsed && projects.length === 0 && (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
            padding: "28px 16px", margin: "8px 2px 0",
            border: "1px dashed var(--lt-border-input)", borderRadius: 12,
          }}>
            <span style={{
              width: 36, height: 36, borderRadius: 10, marginBottom: 12,
              background: "var(--lt-accent-subtle)", color: "var(--lt-accent)",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
            }}>
              <Icon name="folder" size={17} color="currentColor" />
            </span>
            <div style={{
              font: "500 13.5px/1.35 var(--lt-font-sans)", letterSpacing: "-0.010em",
              color: "var(--lt-text-primary)", marginBottom: 4,
            }}>No projects yet</div>
            <div style={{
              font: "var(--lt-body-sm)", letterSpacing: "-0.005em",
              color: "var(--lt-text-tertiary)", marginBottom: 14, maxWidth: 180,
            }}>Start by asking a research question — Litree finds and organises the papers.</div>
            <button onClick={onNewProject} style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              height: 32, padding: "0 12px", borderRadius: 8, cursor: "pointer",
              border: 0, background: "var(--lt-accent)", color: "var(--lt-text-on-accent, #fff)",
              font: "500 13px/1 var(--lt-font-sans)", letterSpacing: "-0.010em",
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
              New project
            </button>
          </div>
        )}

        {/* Search returned nothing */}
        {!collapsed && q && filtered.length === 0 && (
          <div style={{ padding: "8px 10px", font: "var(--lt-body-sm)", color: "var(--lt-text-tertiary)" }}>
            No matches for &ldquo;{query.trim()}&rdquo;.
          </div>
        )}

        {/* Show all / Show less toggle */}
        {!collapsed && collapseAfter > 0 && !q && filtered.length > collapseAfter && (
          <button onClick={() => setShowAll(s => !s)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              alignSelf: "flex-start", height: 28, padding: "0 10px", marginTop: 2,
              background: "transparent", border: 0, borderRadius: 5, cursor: "pointer",
              font: "var(--lt-body-sm)", letterSpacing: "-0.01em",
              color: "var(--lt-text-secondary)",
              transition: "var(--lt-transition-colors)",
            }}>
            {showAll ? "Show less" : `Show all (${filtered.length})`}
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                 style={{ transform: showAll ? "rotate(180deg)" : "none", transition: "transform var(--lt-dur-fast, 140ms) var(--lt-ease-out)" }}>
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        )}
      </div>

      {/* User menu popover — opens above the user chip, full footer width */}
      {menuOpen && !collapsed && (
        <div style={{
          position: "absolute", bottom: 96, left: 8, right: 8,
          background: "var(--lt-bg-surface)",
          borderRadius: "var(--lt-radius-lg)",
          boxShadow: "var(--lt-elev-3)",
          padding: 6, zIndex: 10,
        }}>
          <div style={{ padding: "8px 10px 10px", borderBottom: "1px solid var(--lt-border-subtle)" }}>
            <div style={{ font: "500 14px/1.25 var(--lt-font-sans)", color: "var(--lt-text-primary)", letterSpacing: "-0.01em" }}>{user.name}</div>
            <div style={{ font: "400 12px/1.3 var(--lt-font-sans)", color: "var(--lt-text-tertiary)", letterSpacing: "-0.005em", marginTop: 2 }}>{user.email}</div>
          </div>
          <UserMenuItem
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
            label="Account settings" onClick={() => setMenuOpen(false)} />
          <UserMenuToggle
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>}
            label="Dark mode" on={theme === "dark"}
            onToggle={() => setTheme(t => t === "dark" ? "light" : "dark")} />
          <UserMenuItem
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>}
            label="Log out" onClick={() => setMenuOpen(false)} />
        </div>
      )}

      {/* Footer */}
      <div style={{
        borderTop: "1px solid var(--lt-border-subtle)",
        paddingTop: 6, marginTop: 6,
      }}>
        {feedback && !collapsed && (
          <FooterLink icon="message-square" label={feedback.label || "Send feedback"}
            onClick={(e) => { if (e) e.preventDefault(); if (feedback.onClick) feedback.onClick(); else setFeedbackOpen(true); }}
            collapsed={collapsed} />
        )}
        <FooterLink icon="book-open" label="Documentation" href={docsHref || "#"} collapsed={collapsed} />

        {/* System status — colored dot reflects worst service state; opens the
           health detail panel. Visible collapsed too (dot only). */}
        <div onClick={() => setHealthOpen(true)}
          title={collapsed ? healthLabel : undefined}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--lt-bg-active)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          style={{
            display: "flex", alignItems: "center",
            gap: collapsed ? 0 : 10,
            justifyContent: collapsed ? "center" : "flex-start",
            height: 30, width: collapsed ? 32 : "auto",
            padding: collapsed ? 0 : "0 8px",
            margin: collapsed ? "0 auto 2px" : undefined,
            borderRadius: 5, cursor: "pointer", marginTop: 2,
            transition: "var(--lt-transition-colors)",
          }}>
          <span style={{
            width: 22, height: 22, flexShrink: 0,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: healthColor }} />
          </span>
          {!collapsed && (
            <span style={{
              font: "var(--lt-body-sm)", letterSpacing: "-0.005em", color: "var(--lt-text-tertiary)",
            }}>{healthLabel}</span>
          )}
        </div>

        {/* Divider — separates utility links from the account control below,
           so the account chip reads as the footer's anchor, not a third link. */}
        <div style={{
          height: 1, background: "var(--lt-border-subtle)",
          margin: collapsed ? "6px auto" : "6px 4px",
          width: collapsed ? 24 : "auto",
        }} />

        <button onClick={() => setMenuOpen(o => !o)} title={collapsed ? user.name : undefined}
          onMouseEnter={() => setAccHover(true)} onMouseLeave={() => setAccHover(false)}
          style={{
            width: "100%", display: "flex", alignItems: "center",
            gap: collapsed ? 0 : 8,
            minHeight: collapsed ? 36 : 48,
            padding: collapsed ? 0 : "6px 8px",
            justifyContent: collapsed ? "center" : "flex-start",
            background: (menuOpen || accHover) ? "var(--lt-bg-active)" : "transparent",
            border: 0, borderRadius: 8, cursor: "pointer",
            transition: "var(--lt-transition-colors)",
          }}>
          <span style={{
            width: collapsed ? 24 : 24, height: collapsed ? 24 : 24, borderRadius: "50%",
            background: "var(--lt-accent-subtle)", color: "var(--lt-accent)",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            font: "600 12px/1 var(--lt-font-sans)", letterSpacing: "-0.01em", flexShrink: 0,
          }}>{user.initials}</span>
          {!collapsed && (
            <>
              <span style={{
                flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 1, textAlign: "left",
              }}>
                <span style={{
                  font: "500 13.5px/1.2 var(--lt-font-sans)", letterSpacing: "-0.01em",
                  color: "var(--lt-text-primary)",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>{user.name}</span>
                {(user.org || user.email) && (
                  <span style={{
                    font: "400 11.5px/1.2 var(--lt-font-sans)", letterSpacing: "-0.005em",
                    color: "var(--lt-text-tertiary)",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>{user.org || user.email}</span>
                )}
              </span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--lt-text-tertiary)" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"
                   style={{ flexShrink: 0, transform: menuOpen ? "rotate(180deg)" : "none", transition: "transform var(--lt-dur-fast, 140ms) var(--lt-ease-out)" }}>
                <path d="m6 9 6 6 6-6" />
              </svg>
            </>
          )}
        </button>
      </div>

      {healthOpen && (
        <SystemHealthModal health={health} color={healthColor} label={healthLabel}
          onClose={() => setHealthOpen(false)} />
      )}
      {feedbackOpen && (
        <FeedbackModal user={user} onClose={() => setFeedbackOpen(false)} />
      )}
    </aside>
  );
}

function FeedbackModal({ user, onClose }) {
  const [kind, setKind] = useState("idea");
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [onClose]);
  const kinds = [
    { v: "idea", l: "Idea" },
    { v: "bug", l: "Bug" },
    { v: "other", l: "Other" },
  ];
  const send = () => { if (text.trim()) { setSent(true); setTimeout(onClose, 1400); } };
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "var(--lt-overlay-panel, rgba(0,0,0,0.45))",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: "100%", maxWidth: 460,
        background: "var(--lt-bg-surface)", borderRadius: "var(--lt-radius-lg, 14px)",
        boxShadow: "var(--lt-elev-3)", overflow: "hidden",
      }}>
        {sent ? (
          <div style={{ padding: "40px 26px 44px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center" }}>
            <span style={{
              width: 44, height: 44, borderRadius: "50%", background: "var(--lt-success-subtle)", color: "var(--lt-success-strong)",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
            </span>
            <h3 style={{ font: "500 18px/1.3 var(--lt-font-sans)", letterSpacing: "-0.020em", color: "var(--lt-text-primary)", margin: 0 }}>Thanks for the feedback</h3>
            <p style={{ font: "var(--lt-body)", color: "var(--lt-text-secondary)", letterSpacing: "-0.010em", margin: 0, maxWidth: 320 }}>
              We read every note. It helps shape what Litree builds next.
            </p>
          </div>
        ) : (
          <>
            <div style={{ padding: "24px 26px 0", display: "flex", flexDirection: "column", gap: 7 }}>
              <h3 style={{ font: "500 18px/1.3 var(--lt-font-sans)", letterSpacing: "-0.020em", color: "var(--lt-text-primary)", margin: 0 }}>Send feedback</h3>
              <p style={{ font: "var(--lt-body)", color: "var(--lt-text-secondary)", letterSpacing: "-0.010em", margin: 0 }}>
                Found a bug or have an idea? Tell us — Litree is in beta and your input steers it.
              </p>
            </div>

            <div style={{ padding: "18px 26px 4px", display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Kind */}
              <div style={{ display: "inline-flex", background: "var(--lt-bg-stone)", borderRadius: 9, padding: 3 }}>
                {kinds.map(k => {
                  const active = k.v === kind;
                  return (
                    <button key={k.v} onClick={() => setKind(k.v)} style={{
                      flex: 1, height: 32, padding: "0 14px", borderRadius: 6, border: 0, cursor: "pointer",
                      background: active ? "var(--lt-bg-surface)" : "transparent",
                      boxShadow: active ? "var(--lt-elev-1)" : "none",
                      color: active ? "var(--lt-text-primary)" : "var(--lt-text-tertiary)",
                      font: "500 13px/1 var(--lt-font-sans)", letterSpacing: "-0.01em",
                      transition: "var(--lt-transition-colors)",
                    }}>{k.l}</button>
                  );
                })}
              </div>

              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                autoFocus
                placeholder={kind === "bug" ? "What went wrong? What did you expect to happen?" : kind === "idea" ? "What would make Litree better for you?" : "Tell us what's on your mind…"}
                rows={5}
                style={{
                  width: "100%", boxSizing: "border-box", resize: "vertical",
                  padding: "11px 13px", minHeight: 110,
                  border: "1px solid var(--lt-border-input)", borderRadius: 10,
                  background: "var(--lt-bg-surface)", color: "var(--lt-text-primary)",
                  font: "var(--lt-body)", letterSpacing: "-0.010em", lineHeight: 1.5, outline: "none",
                }}
              />

              <div style={{ display: "flex", alignItems: "center", gap: 8, font: "var(--lt-body-sm)", letterSpacing: "-0.005em", color: "var(--lt-text-tertiary)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                Sent as {user?.email || "you"}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: "18px 26px 22px" }}>
              <button onClick={onClose} style={{
                height: 38, padding: "0 14px", borderRadius: 9, border: 0, cursor: "pointer",
                background: "transparent", color: "var(--lt-text-secondary)",
                font: "500 14px/1 var(--lt-font-sans)", letterSpacing: "-0.01em",
              }}>Cancel</button>
              <button onClick={send} disabled={!text.trim()} style={{
                height: 38, padding: "0 16px", borderRadius: 9, border: 0,
                cursor: text.trim() ? "pointer" : "default", opacity: text.trim() ? 1 : 0.5,
                background: "var(--lt-accent)", color: "var(--lt-text-on-accent, #fff)",
                font: "500 14px/1 var(--lt-font-sans)", letterSpacing: "-0.01em",
              }}>Send feedback</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SystemHealthModal({ health, color, label, onClose }) {
  const [checked, setChecked] = useState(health.lastChecked);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [onClose]);
  const refresh = () => {
    setBusy(true);
    setTimeout(() => {
      setChecked(new Date().toLocaleTimeString("en-GB", { hour12: false }));
      setBusy(false);
    }, 700);
  };
  const stateColor = (s) => ({ operational: "var(--lt-success)", degraded: "var(--lt-warn)", outage: "var(--lt-danger)" }[s] || "var(--lt-success)");
  const stateLabel = (s) => ({ operational: "Operational", degraded: "Degraded", outage: "Outage" }[s] || "Operational");
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "var(--lt-overlay-panel, rgba(0,0,0,0.45))",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: "100%", maxWidth: 540, maxHeight: "86vh", overflow: "auto",
        background: "var(--lt-bg-surface)", borderRadius: "var(--lt-radius-lg, 14px)",
        boxShadow: "var(--lt-elev-3)", padding: "24px 26px 26px",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: color }} />
              <h3 style={{ font: "500 18px/1.3 var(--lt-font-sans)", letterSpacing: "-0.020em", color: "var(--lt-text-primary)", margin: 0 }}>System health</h3>
            </div>
            <p style={{ font: "var(--lt-body)", color: "var(--lt-text-secondary)", letterSpacing: "-0.010em", margin: 0 }}>
              Current availability for the services Litree relies on before new research starts.
            </p>
          </div>
          <button onClick={onClose} aria-label="Close" style={{
            width: 30, height: 30, borderRadius: 7, flexShrink: 0,
            background: "transparent", border: 0, cursor: "pointer",
            display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--lt-text-tertiary)",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
          marginTop: 18, padding: "14px 16px",
          border: "1px solid var(--lt-border-default)", borderRadius: 12,
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <span style={{ font: "500 14px/1.2 var(--lt-font-sans)", letterSpacing: "-0.01em", color: "var(--lt-text-primary)" }}>{label}</span>
            <span style={{ font: "var(--lt-body-sm)", color: "var(--lt-text-tertiary)", letterSpacing: "-0.005em" }}>Last checked {checked}</span>
          </div>
          <button onClick={refresh} disabled={busy} style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            height: 38, padding: "0 14px", borderRadius: 9,
            background: "transparent", border: "1px solid var(--lt-border-input)",
            cursor: busy ? "default" : "pointer", opacity: busy ? 0.6 : 1,
            font: "500 14px/1 var(--lt-font-sans)", letterSpacing: "-0.01em", color: "var(--lt-text-secondary)",
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                 style={{ animation: busy ? "lt-spin 0.8s linear infinite" : "none" }}>
              <path d="M3 12a9 9 0 0 1 9-9 9 9 0 0 1 6.7 3M21 12a9 9 0 0 1-9 9 9 9 0 0 1-6.7-3"/><path d="M21 3v6h-6M3 21v-6h6"/>
            </svg>
            {busy ? "Checking…" : "Refresh"}
          </button>
        </div>

        <div style={{ marginTop: 16, border: "1px solid var(--lt-border-default)", borderRadius: 12, overflow: "hidden" }}>
          {health.services.map((s, i) => (
            <div key={s.name} style={{
              display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16,
              padding: "14px 16px",
              borderBottom: i < health.services.length - 1 ? "1px solid var(--lt-border-subtle)" : 0,
            }}>
              <div style={{ display: "flex", gap: 11, minWidth: 0 }}>
                <span style={{ marginTop: 1, color: stateColor(s.state), flexShrink: 0 }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ font: "500 15px/1.3 var(--lt-font-sans)", letterSpacing: "-0.015em", color: "var(--lt-text-primary)" }}>{s.name}</div>
                  <div style={{ marginTop: 2, font: "var(--lt-body-sm)", letterSpacing: "-0.005em", color: "var(--lt-text-tertiary)" }}>{s.detail}</div>
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ font: "500 13px/1.3 var(--lt-font-sans)", letterSpacing: "-0.01em", color: "var(--lt-text-secondary)" }}>{stateLabel(s.state)}</div>
                <div style={{ marginTop: 2, font: "var(--lt-body-sm)", color: "var(--lt-text-tertiary)", letterSpacing: "-0.005em" }}>{s.latency}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProjectItem({ project, active, onClick, onDelete }) {
  const [hover, setHover] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();
  const bg = active ? "var(--lt-accent-subtle)" : (hover ? "var(--lt-bg-active)" : "transparent");
  return (
    <div role="listitem" data-project-row
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ position: "relative", borderRadius: 5, background: bg, transition: "var(--lt-transition-colors)" }}>
      <button onClick={onClick}
        aria-current={active ? "page" : undefined}
        style={{
          width: "100%", textAlign: "left", background: "transparent", border: 0, cursor: "pointer",
          minHeight: project.date ? 46 : (project.question ? 44 : 32),
          padding: (project.date || project.question) ? "7px 10px" : "0 10px",
          paddingRight: onDelete ? 34 : undefined,
          borderRadius: 5,
          display: "flex", flexDirection: "column", justifyContent: "center",
          gap: 2, overflow: "hidden",
        }}>
        <span style={{
          font: project.question ? "13px/1.35 var(--lt-font-sans)" : "var(--lt-body)",
          fontWeight: active ? 500 : 400, letterSpacing: "-0.01em",
          color: "var(--lt-text-primary)",
          ...(project.question
            ? { display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }
            : { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }),
        }}>{project.question || project.name}</span>
        {project.date && (
          <span style={{
            font: "var(--lt-body-sm)", letterSpacing: "-0.005em",
            color: "var(--lt-text-tertiary)",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%",
          }}>{project.date}</span>
        )}
      </button>

      {onDelete && (
        <>
          <button ref={menuRef}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen(o => !o); }}
            aria-label="Project actions"
            style={{
              position: "absolute", top: "50%", right: 5, transform: "translateY(-50%)",
              width: 26, height: 26, borderRadius: 6,
              background: menuOpen ? "var(--lt-bg-hover)" : "transparent", border: 0, cursor: "pointer",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              color: "var(--lt-text-tertiary)",
              opacity: (hover || menuOpen) ? 1 : 0,
              transition: "opacity var(--lt-dur-fast) var(--lt-ease-out)",
            }}>
            <Icon name="ellipsis" size={15} color="currentColor" />
          </button>
          <Dropdown
            anchor={menuRef.current}
            open={menuOpen}
            onClose={() => setMenuOpen(false)}
            align="right"
            items={[
              { label: "Delete project", icon: "trash", destructive: true, onClick: () => onDelete() },
            ]}
          />
        </>
      )}
    </div>
  );
}

function FooterLink({ icon, label, href, onClick, collapsed }) {
  const [hover, setHover] = useState(false);
  return (
    <a href={href || "#"} onClick={onClick} title={label}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", alignItems: "center", gap: collapsed ? 0 : 10,
        height: 30, width: collapsed ? 32 : "auto",
        padding: collapsed ? 0 : "0 8px",
        margin: collapsed ? "0 auto 2px" : undefined,
        justifyContent: collapsed ? "center" : "flex-start",
        borderRadius: 5, textDecoration: "none",
        color: "var(--lt-text-tertiary)",
        background: hover ? "var(--lt-bg-active)" : "transparent",
        font: "var(--lt-body-sm)", letterSpacing: "-0.005em",
        transition: "var(--lt-transition-colors)",
      }}>
      <span style={{ width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon name={icon} size={15} color="var(--lt-text-tertiary)" />
      </span>
      {!collapsed && <span>{label}</span>}
    </a>
  );
}

function UserMenuItem({ icon, label, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        height: 32, padding: "0 10px", borderRadius: 5,
        color: "var(--lt-text-primary)",
        font: "var(--lt-body)", letterSpacing: "-0.01em",
        cursor: "pointer", marginTop: 4,
        background: hover ? "var(--lt-bg-active)" : "transparent",
        transition: "var(--lt-transition-colors)",
      }}>
      <span style={{ width: 15, height: 15, color: "var(--lt-text-tertiary)", flexShrink: 0, display: "inline-flex" }}>
        {React.cloneElement(icon, { width: 15, height: 15, style: { strokeWidth: 1.67 } })}
      </span>
      {label}
    </div>
  );
}

function UserMenuToggle({ icon, label, on, onToggle }) {
  const [hover, setHover] = useState(false);
  return (
    <div onClick={onToggle}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        height: 32, padding: "0 10px", borderRadius: 5,
        color: "var(--lt-text-primary)",
        font: "var(--lt-body)", letterSpacing: "-0.01em",
        cursor: "pointer", marginTop: 4,
        background: hover ? "var(--lt-bg-active)" : "transparent",
        transition: "var(--lt-transition-colors)",
      }}>
      <span style={{ width: 15, height: 15, color: "var(--lt-text-tertiary)", flexShrink: 0, display: "inline-flex" }}>
        {React.cloneElement(icon, { width: 15, height: 15, style: { strokeWidth: 1.67 } })}
      </span>
      <span style={{ flex: 1 }}>{label}</span>
      <span aria-hidden="true" style={{
        width: 30, height: 18, borderRadius: 9999, flexShrink: 0,
        background: on ? "var(--lt-accent)" : "var(--lt-border-input)",
        transition: "background var(--lt-dur-fast, 140ms) var(--lt-ease-out)",
        position: "relative",
      }}>
        <span style={{
          position: "absolute", top: 2, left: on ? 14 : 2,
          width: 14, height: 14, borderRadius: "50%", background: "#fff",
          boxShadow: "0 1px 2px rgba(0,0,0,0.25)",
          transition: "left var(--lt-dur-fast, 140ms) var(--lt-ease-out)",
        }} />
      </span>
    </div>
  );
}

Object.assign(window, { Sidebar });
