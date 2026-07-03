// WorkspacePage.jsx — Project workspace
//
// Inside a project. Two tabs: "Papers" (the unified discovery/working table)
// and "Literature reviews" (drafts of reviews built from selected papers).
//
// Visual reference: /Entwurf/Papers-Unified-workspace/ in the Litree
// Playground .fig. Uses tokens from colors_and_type.css and primitives from
// Primitives.jsx — no new shared components were added to src/.

const { useState: useStateWP, useEffect: useEffectWP, useMemo: useMemoWP, useRef: useRefWP } = React;

/* ── seed data ──────────────────────────────────────────────────────────── */
const SEED_PAPERS = [
  { id: "p01", title: "Monetary Policy and Financial Stability", journal: "Journal of Money, Credit and Banking", year: 2022, authors: "Chen · Park",            fullText: "available" },
  { id: "p02", title: "The Future of Work: Automation, AI, and Labor Market Policies", journal: "Journal of Economic Perspectives", year: 2023, authors: "Acemoglu · Restrepo",    fullText: "available" },
  { id: "p03", title: "The Role of Fintech in Emerging Economies", journal: "Journal of Economic Perspectives", year: 2022, authors: "Beck · Demirgüç-Kunt", fullText: "available" },
  { id: "p04", title: "The Impact of Climate Change on Global Supply Chains", journal: "Review of Economics and Statistics", year: 2024, authors: "Mendelsohn · Nordhaus", fullText: "available" },
  { id: "p05", title: "The Role of Cultural Biases in Economic Decision-Making", journal: "Quarterly Journal of Economics", year: 2021, authors: "Henrich · Heine", fullText: "missing"   },
  { id: "p06", title: "Technological Advancements in International Trade", journal: "Journal of Global Business", year: 2023, authors: "Goldberg · Pavcnik", fullText: "available" },
  { id: "p07", title: "Trade Policies in a Post-Pandemic World", journal: "Global Policy Journal", year: 2022, authors: "Rodrik · Stiglitz", fullText: "available" },
  { id: "p08", title: "Intergenerational Mobility and the Geography of Opportunity", journal: "American Economic Review", year: 2023, authors: "Chetty · Hendren",    fullText: "missing"   },
  { id: "p09", title: "Inequality Dynamics in the Long Run", journal: "Journal of Political Economy", year: 2024, authors: "Piketty · Saez", fullText: "available" },
  { id: "p10", title: "Behavioral Foundations of Household Finance", journal: "Review of Financial Studies", year: 2022, authors: "Campbell · Calvet", fullText: "available" },
  { id: "p11", title: "Fiscal Policy Responses to Economic Crises", journal: "Journal of Monetary Economics", year: 2024, authors: "Romer · Ramey", fullText: "missing"   },
  { id: "p12", title: "Income Inequality and Social Mobility in Southeast Asia", journal: "World Development", year: 2023, authors: "Banerjee · Duflo", fullText: "available" },
  { id: "p13", title: "Labor Market Frictions in the Gig Economy", journal: "Industrial Relations", year: 2024, authors: "Katz · Krueger", fullText: "missing"   },
  { id: "p14", title: "Schooling Quality and the Returns to Education in Rural Economies", journal: "Quarterly Journal of Economics", year: 2019, authors: "Attanasio · Meghir", fullText: "available" },
  { id: "p15", title: "Credit Constraints and Household Investment in Children", journal: "Economic Journal", year: 2023, authors: "Narayan · Van der Weide", fullText: "available" },
  { id: "p16", title: "Caste, Networks, and Labor Market Entry", journal: "World Bank Economic Review", year: 2023, authors: "Banerjee · Duflo", fullText: "missing" },
  { id: "p17", title: "Conditional Cash Transfers and Long-Run Mobility", journal: "Economic Journal", year: 2024, authors: "Narayan · Van der Weide", fullText: "available" },
  { id: "p18", title: "Spatial Inequality and the Geography of Opportunity", journal: "Population and Development Review", year: 2023, authors: "Alesina · Stantcheva", fullText: "available" },
  { id: "p19", title: "Informality and the Returns to Skill", journal: "World Bank Economic Review", year: 2019, authors: "Jensen · Miller", fullText: "available" },
  { id: "p20", title: "Trust, Cohesion, and the Provision of Public Goods", journal: "Population and Development Review", year: 2020, authors: "Galor · Zeira", fullText: "available" },
  { id: "p21", title: "Gender Gaps in Educational Attainment", journal: "Journal of Human Resources", year: 2020, authors: "Heckman · Mosso", fullText: "available" },
  { id: "p22", title: "Land Inequality and Long-Run Development", journal: "Journal of Human Resources", year: 2020, authors: "Glewwe · Kremer", fullText: "available" },
  { id: "p23", title: "Microfinance, Savings, and Asset Accumulation", journal: "Journal of Development Economics", year: 2019, authors: "Bossuroy · Karlan", fullText: "available" },
  { id: "p24", title: "Tertiary Access and Intergenerational Persistence", journal: "World Development", year: 2021, authors: "Galor · Zeira", fullText: "available" },
  { id: "p25", title: "Early-Childhood Investment and Adult Outcomes", journal: "American Economic Review", year: 2020, authors: "Jensen · Miller", fullText: "missing" },
  { id: "p26", title: "Redistributive Preferences and Perceived Fairness", journal: "Economic Journal", year: 2022, authors: "Jensen · Miller", fullText: "available" },
  { id: "p27", title: "Internal Migration and Children's Outcomes", journal: "Journal of Human Resources", year: 2023, authors: "Attanasio · Meghir", fullText: "available" },
  { id: "p28", title: "Wealth Inequality and the Transmission of Advantage", journal: "Journal of Human Resources", year: 2022, authors: "Corak · Piraino", fullText: "available" },
  { id: "p29", title: "Public Schooling and the Inequality–Mobility Link", journal: "Population and Development Review", year: 2024, authors: "Jensen · Miller", fullText: "missing" },
  { id: "p30", title: "Group-Based Exclusion and Social Cohesion", journal: "American Economic Review", year: 2023, authors: "Munshi · Rosenzweig", fullText: "available" },
  { id: "p31", title: "Occupational Persistence Across Generations", journal: "Journal of Development Studies", year: 2020, authors: "Galor · Zeira", fullText: "missing" },
  { id: "p32", title: "Health Inequality and Human-Capital Formation", journal: "Journal of Public Economics", year: 2022, authors: "Narayan · Van der Weide", fullText: "available" },
  { id: "p33", title: "Institutional Quality and Economic Mobility", journal: "Journal of Political Economy", year: 2023, authors: "Glewwe · Kremer", fullText: "available" },
  { id: "p34", title: "Labor-Market Segmentation in Emerging Economies", journal: "World Development", year: 2024, authors: "Munshi · Rosenzweig", fullText: "missing" },
  { id: "p35", title: "The Great Gatsby Curve in Developing Nations", journal: "World Bank Economic Review", year: 2022, authors: "Bossuroy · Karlan", fullText: "available" },
  { id: "p36", title: "Place-Based Disadvantage and Neighborhood Effects", journal: "Economic Journal", year: 2023, authors: "Jensen · Miller", fullText: "available" },
  { id: "p37", title: "Social Insurance and the Rural Poor", journal: "Journal of Development Studies", year: 2023, authors: "Ravallion · Chen", fullText: "missing" },
  { id: "p38", title: "Anti-Discrimination Policy and Opportunity", journal: "World Development", year: 2022, authors: "Bossuroy · Karlan", fullText: "available" },
  { id: "p39", title: "Cross-Country Evidence on Mobility Measurement", journal: "Journal of Political Economy", year: 2024, authors: "Field · Pande", fullText: "available" },
  { id: "p40", title: "Targeting, Leakage, and Transfer Effectiveness", journal: "Journal of Political Economy", year: 2020, authors: "Ravallion · Chen", fullText: "available" },
  { id: "p41", title: "Norms, Aspirations, and Educational Choice", journal: "Journal of Human Resources", year: 2019, authors: "Bossuroy · Karlan", fullText: "available" },
  { id: "p42", title: "Financial Development and Inclusive Growth", journal: "Journal of Development Economics", year: 2021, authors: "Glewwe · Kremer", fullText: "missing" },
  { id: "p43", title: "Inequality of Opportunity: A Decomposition", journal: "World Development", year: 2021, authors: "Hanushek · Woessmann", fullText: "available" },
  { id: "p44", title: "Returns to Schooling Under Weak Enforcement", journal: "World Development", year: 2019, authors: "Banerjee · Duflo", fullText: "available" },
  { id: "p45", title: "Cohort Evidence on Educational Mobility", journal: "Journal of Human Resources", year: 2020, authors: "Heckman · Mosso", fullText: "missing" },
];

const SEED_REVIEWS = [
  { id: "r1", title: "Income inequality & intergenerational mobility", papers: 24, screened: 18, created: "Apr 24, 2026", updated: "2 days ago", status: "In progress" },
  { id: "r2", title: "Fiscal policy after the pandemic",                papers: 11, screened: 11, created: "Feb 18, 2026", updated: "3 weeks ago", status: "Complete" },
];

/* ── page shell ─────────────────────────────────────────────────────────── */
function WorkspacePage({ project, knobs, openModal, setOpenModal }) {
  const [tab, setTab] = useStateWP("papers"); // papers | reviews
  const [papers, setPapers] = useStateWP(SEED_PAPERS);
  const [reviews, setReviews] = useStateWP(SEED_REVIEWS);

  const reviewsEmpty = knobs.reviewsEmpty === true;
  const shownReviews = reviewsEmpty ? [] : reviews;

  /* Loading: skeleton rows resolve into data. True when arriving fresh from the
     search flow (?new=1) or via the `loading` knob — so the workspace appears
     immediately and fills in, instead of jumping from empty to full. */
  const arrivedFresh = (typeof window !== "undefined" && /[?&]new=1\b/.test(window.location.search));
  const [loading, setLoading] = useStateWP(arrivedFresh || knobs.loading === true);
  useEffectWP(() => {
    // Knob holds the skeleton on for inspection; only a fresh arrival auto-resolves.
    if (!loading || knobs.loading === true) return;
    const t = setTimeout(() => {
      setLoading(false);
      if (arrivedFresh && window.history.replaceState) {
        window.history.replaceState(null, "", window.location.pathname);
      }
    }, 1100);
    return () => clearTimeout(t);
  }, [loading, knobs.loading]);
  const [selected, setSelected] = useStateWP(() => new Set());
  const [viewPaper, setViewPaper] = useStateWP(null);
  const [search, setSearch] = useStateWP("");
  const [sort, setSort] = useStateWP("year-desc");
  const [showQuery, setShowQuery] = useStateWP(() => {
    try { return localStorage.getItem("litree:showQuery") === "1"; } catch (e) { return false; }
  });
  useEffectWP(() => {
    try { localStorage.setItem("litree:showQuery", showQuery ? "1" : "0"); } catch (e) {}
  }, [showQuery]);

  /* Tweak: jump to a tab */
  useEffectWP(() => { if (knobs.activeTab) setTab(knobs.activeTab); }, [knobs.activeTab]);
  const knobMounted = useRefWP(false);
  useEffectWP(() => {
    if (!knobMounted.current) { knobMounted.current = true; return; }
    setLoading(knobs.loading === true);
  }, [knobs.loading]);

  /* Create a literature review directly — no modal, since there's nothing to
     decide. Auto-named from the project; renameable later via the row menu.
     Lands on the reviews tab where the new "In progress" row is the feedback. */
  const createReview = (instructions) => {
    setReviews(prev => [{
      id: "r" + Date.now(),
      title: project.name,
      papers: papers.length,
      screened: 0,
      created: "Just now",
      updated: "Just now",
      status: "In progress",
      instructions: (instructions || "").trim() || undefined,
    }, ...prev]);
    setOpenModal(null);
    setTab("reviews");
  };

  const missing = papers.filter(p => p.fullText === "missing");
  const selectedMissing = papers.filter(p => p.fullText === "missing" && selected.has(p.id));

  const filteredPapers = useMemoWP(() => {
    const q = search.trim().toLowerCase();
    const base = !q ? papers : papers.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.journal.toLowerCase().includes(q) ||
      p.authors.toLowerCase().includes(q)
    );
    const sorted = [...base];
    sorted.sort((a, b) => {
      switch (sort) {
        case "year-asc":  return a.year - b.year || a.title.localeCompare(b.title);
        case "title-asc": return a.title.localeCompare(b.title);
        case "journal-asc": return a.journal.localeCompare(b.journal) || a.title.localeCompare(b.title);
        case "year-desc":
        default:          return b.year - a.year || a.title.localeCompare(b.title);
      }
    });
    return sorted;
  }, [papers, search, sort]);

  const toggleRow = (id) => setSelected(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
  const toggleAll = () => setSelected(prev => {
    if (filteredPapers.every(p => prev.has(p.id))) {
      const next = new Set(prev);
      filteredPapers.forEach(p => next.delete(p.id));
      return next;
    }
    const next = new Set(prev);
    filteredPapers.forEach(p => next.add(p.id));
    return next;
  });
  const allChecked = filteredPapers.length > 0 && filteredPapers.every(p => selected.has(p.id));
  const someChecked = !allChecked && filteredPapers.some(p => selected.has(p.id));

  return (
    <main style={{
      flex: 1, minWidth: 0, height: "100%",
      overflowY: "scroll", scrollbarGutter: "stable", background: "var(--lt-bg-primary)",
    }}>
      <div style={{
        maxWidth: 992, margin: "0 auto",
        padding: "40px clamp(20px, 5vw, 64px) 64px",
      }}>
        {/* Project header — the research question is the anchor of the workspace.
           Kicker (project name) for orientation, the question as the heading,
           and a provenance line beneath so it's clear where the papers came from
           and how to get back to the search. "Create literature review" stays
           the prominent primary action. */}
        <header style={{
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
          gap: 24, flexWrap: "wrap", rowGap: 22,
        }}>
          <div style={{ flex: "1 1 380px", minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
            <h1 style={{
              font: "500 23px/1.42 var(--lt-font-serif, var(--lt-font-sans))",
              letterSpacing: "-0.006em",
              color: "var(--lt-text-ink)",
              margin: 0, maxWidth: 680,
              textWrap: "pretty",
            }}>{project.question || project.name}</h1>

            {project.query && (
              <div style={{
                display: "flex", flexDirection: "column", gap: 8, marginTop: 2,
              }}>
                <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", rowGap: 6, columnGap: 12 }}>
                  <button onClick={() => setShowQuery(v => !v)}
                    aria-expanded={showQuery}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      background: "transparent", border: 0, padding: 0, cursor: "pointer",
                      font: "500 12.5px/1 var(--lt-font-sans)", letterSpacing: "-0.005em",
                      color: "var(--lt-text-secondary)",
                    }}>
                    <Icon name="search" size={13} color="var(--lt-text-tertiary)" />
                    {showQuery ? "Hide search query" : "View search query"}
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      style={{ transform: showQuery ? "rotate(180deg)" : "none", transition: "transform var(--lt-dur-fast, 140ms) var(--lt-ease-out)" }}>
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                </div>
                {showQuery && (
                  <code style={{
                    font: "500 11.5px/1.6 var(--lt-font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)",
                    letterSpacing: "-0.005em",
                    color: "var(--lt-text-secondary)",
                    background: "var(--lt-bg-stone)",
                    border: "1px solid var(--lt-border-subtle)",
                    borderRadius: 8,
                    padding: "8px 12px",
                    maxWidth: 640,
                    whiteSpace: "pre-wrap", wordBreak: "break-word",
                  }}>{project.query}</code>
                )}
              </div>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <Button
              variant="secondary"
              leftIcon="file"
              onClick={() => setOpenModal("quick-summary")}
            >Quick summary</Button>
            <Button
              variant="primary"
              leftIcon="sparkles"
              onClick={() => setOpenModal("create-review")}
            >Generate review</Button>
          </div>
        </header>

        {/* Tabs */}
        <div style={{ marginTop: 28 }}>
          <Tabs
            tabs={[
              { id: "papers",  label: "Papers",             count: search.trim() ? filteredPapers.length : papers.length },
              { id: "reviews", label: "Literature reviews", count: shownReviews.length },
            ]}
            active={tab}
            onChange={setTab}
          />
        </div>

        {tab === "papers" && (
          <PapersPane
            papers={filteredPapers}
            loading={loading}
            selected={selected}
            toggleRow={toggleRow}
            toggleAll={toggleAll}
            allChecked={allChecked}
            someChecked={someChecked}
            search={search} setSearch={setSearch}
            sort={sort} setSort={setSort}
            clearSelection={() => setSelected(new Set())}
            missingCount={missing.length}
            selectedMissingCount={selectedMissing.length}
            onOpenModal={setOpenModal}
            onRemovePaper={(id) => setPapers(prev => prev.filter(p => p.id !== id))}
            onViewPaper={(p) => setViewPaper(p)}
          />
        )}

        {tab === "reviews" && <ReviewsPane reviews={shownReviews} onGoToPapers={() => setTab("papers")} onCreateReview={() => setOpenModal("create-review")} onOpenReview={() => setOpenModal("review-preview")} onDeleteReview={(id) => setReviews(prev => prev.filter(r => r.id !== id))} onRenameReview={(id, title) => setReviews(prev => prev.map(r => r.id === id ? { ...r, title, updated: "Just now" } : r))} onDuplicateReview={(id) => setReviews(prev => { const idx = prev.findIndex(r => r.id === id); if (idx < 0) return prev; const src = prev[idx]; const copy = { ...src, id: "r" + Date.now(), title: src.title + " (copy)", created: "Just now", updated: "Just now", status: "In progress", screened: 0 }; const next = [...prev]; next.splice(idx + 1, 0, copy); return next; })} />}
      </div>

      {openModal === "upload"        && <UploadModal       onClose={() => setOpenModal(null)} />}
      {openModal === "request-texts" && <RequestTextsModal onClose={() => setOpenModal(null)} count={selectedMissing.length || missing.length} papers={papers.filter(p => p.fullText === 'missing')} />}
      {openModal === "delete"        && <DeleteConfirmModal onClose={() => setOpenModal(null)} count={selected.size} items={papers.filter(p => selected.has(p.id)).map(p => p.title)} />}
      {openModal === "quick-summary" && <QuickSummaryModal  onClose={() => setOpenModal(null)} onPreview={() => setOpenModal("quick-summary-preview")} count={papers.length} />}
      {openModal === "quick-summary-preview" && <QuickSummaryPreview onBack={() => setOpenModal("quick-summary")} onClose={() => setOpenModal(null)} />}
      {openModal === "review-preview" && <ReviewDocPreview onClose={() => setOpenModal(null)} />}
      {viewPaper && <PaperPreview paper={viewPaper} onClose={() => setViewPaper(null)} />}
      {openModal === "create-review" && <CreateReviewModal
        onClose={() => setOpenModal(null)}
        onCreate={(instructions) => createReview(instructions)}
      />}
    </main>
  );
}

/* ── Papers tab ─────────────────────────────────────────────────────────── */
const PAPERS_GRID = "36px minmax(0, 2.3fr) minmax(0, 1.3fr) 56px 92px 32px";

const SORT_OPTIONS = [
  { v: "year-desc",   l: "Year (newest)" },
  { v: "year-asc",    l: "Year (oldest)" },
  { v: "title-asc",   l: "Title (A–Z)" },
  { v: "journal-asc", l: "Journal (A–Z)" },
];

const REVIEW_SORT_OPTIONS = [
  { v: "recent", l: "Recently created" },
  { v: "oldest", l: "Oldest first" },
  { v: "title",  l: "Title (A–Z)" },
  { v: "papers", l: "Most papers" },
];

/* CSV export of paper citations. Quotes fields, escapes embedded quotes,
   prepends a UTF-8 BOM so Excel opens accented names correctly. */
function exportPapersCSV(rows, filename) {
  const cols = ["Authors", "Year", "Title", "Journal", "Full text"];
  const esc = (v) => `"${String(v == null ? "" : v).replace(/"/g, '""')}"`;
  const lines = [cols.join(",")];
  rows.forEach(p => {
    lines.push([
      esc((p.authors || "").replace(/ · /g, "; ")),
      esc(p.year),
      esc(p.title),
      esc(p.journal),
      esc(p.fullText === "available" ? "Available" : "Missing"),
    ].join(","));
  });
  const blob = new Blob(["\uFEFF" + lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename || "citations.csv";
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function PapersPane({ papers, loading, selected, toggleRow, toggleAll, allChecked, someChecked, search, setSearch, sort, setSort, clearSelection, missingCount, selectedMissingCount, onOpenModal, onRemovePaper, onViewPaper }) {
  const hasSelection = selected.size > 0 && !loading;

  /* Pagination — keeps the DOM light and the page navigable when a project
     holds hundreds of papers (a single endless scroll of 300+ rows is the
     thing to avoid). 25 rows per page, standard for screening tables. */
  const PAGE_SIZE = 25;
  const [page, setPage] = useStateWP(0);
  const pageCount = Math.max(1, Math.ceil(papers.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const [moreOpen, setMoreOpen] = useStateWP(false);
  const moreRef = useRefWP(null);
  useEffectWP(() => { if (page !== safePage) setPage(safePage); }, [safePage]);
  useEffectWP(() => { setPage(0); }, [search, sort]);
  const start = safePage * PAGE_SIZE;
  const pageRows = papers.slice(start, start + PAGE_SIZE);

  return (
    <div style={{ marginTop: 28 }}>
      {/* Toolbar — in selection mode the row itself becomes the selection
         toolbar (no extra band, no boxed bar): count + clear on the left,
         actions on the right. Otherwise: search left, sort + upload right. */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 12, marginBottom: 20, minHeight: 36, flexWrap: "wrap", rowGap: 12,
      }}>
        {hasSelection ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
              <span style={{
                font: "500 13px/1 var(--lt-font-sans)", letterSpacing: "-0.010em",
                color: "var(--lt-text-primary)", whiteSpace: "nowrap",
              }}>{selected.size} selected</span>
              <button onClick={clearSelection}
                style={{
                  background: "transparent", border: 0, padding: "4px 4px", cursor: "pointer",
                  font: "500 13px/1 var(--lt-font-sans)", letterSpacing: "-0.010em",
                  color: "var(--lt-text-tertiary)", whiteSpace: "nowrap",
                }}>Clear</button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flexWrap: "wrap", justifyContent: "flex-end", rowGap: 8 }}>
              <Button variant="ghost" leftIcon="mail"
                onClick={() => onOpenModal("request-texts")}
                disabled={selectedMissingCount === 0}>
                {selectedMissingCount > 0
                  ? `Request ${selectedMissingCount} missing full ${selectedMissingCount === 1 ? "text" : "texts"}`
                  : "No missing full texts"}
              </Button>
              <Button variant="ghost" leftIcon="arrow-down-to-line"
                onClick={() => exportPapersCSV(papers.filter(p => selected.has(p.id)), "citations-selected.csv")}>
                Export citations
              </Button>
              <Button variant="ghost" leftIcon="trash"
                style={{ color: "var(--lt-danger)" }}
                onClick={() => onOpenModal("delete")}>
                Remove
              </Button>
            </div>
          </>
        ) : (
          <>
            <div style={{ flex: "0 1 420px", minWidth: 140 }}>
              <SearchBox value={search} onChange={setSearch} placeholder="Search papers..." />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, marginLeft: "auto" }}>
              {missingCount > 0 && (
                <Button variant="ghost" leftIcon="mail"
                  onClick={() => onOpenModal("request-texts")}>
                  Request full texts
                </Button>
              )}
              <SortMenu value={sort} setValue={setSort} options={SORT_OPTIONS} />
              <Button variant="ghost" leftIcon="arrow-up-from-line"
                onClick={() => onOpenModal("upload")}>
                Upload
              </Button>
              <button ref={moreRef}
                onClick={() => setMoreOpen(o => !o)}
                aria-label="More actions" title="More actions"
                style={{
                  width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  background: moreOpen ? "var(--lt-bg-active)" : "transparent", border: 0, cursor: "pointer",
                  color: "var(--lt-text-secondary)", transition: "var(--lt-transition-colors)",
                }}>
                <Icon name="ellipsis" size={18} color="currentColor" />
              </button>
              <Dropdown
                anchor={moreRef.current}
                open={moreOpen}
                onClose={() => setMoreOpen(false)}
                align="right"
                items={[
                  { label: "Export citations", icon: "arrow-down-to-line", onClick: () => exportPapersCSV(papers, "citations.csv") },
                ]}
              />
            </div>
          </>
        )}
      </div>

      {/* (Missing full texts is surfaced as a toolbar action above + per-row
         "Missing" badges in the table — no separate nudge row needed.) */}


      {/* Table — borderless: hairline row dividers, no outer box, no filled header band. */}
      <div>
        {/* header — sticky so column labels stay visible while scrolling a long list */}
        <div style={{
          display: "grid",
          gridTemplateColumns: PAPERS_GRID,
          columnGap: 12,
          alignItems: "center",
          height: 44,
          padding: "0 12px",
          borderBottom: "1px solid var(--lt-border-default)",
          font: "var(--lt-table-header)",
          letterSpacing: "-0.005em",
          color: "var(--lt-text-tertiary)",
          position: "sticky", top: 0, zIndex: 1,
          background: "var(--lt-bg-primary)",
        }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Checkbox
              checked={allChecked}
              indeterminate={someChecked}
              onChange={toggleAll}
            />
          </div>
          <div style={{ minWidth: 0 }}>Title</div>
          <div style={{ minWidth: 0 }}>Journal</div>
          <div style={{ minWidth: 0 }}>Year</div>
          <div style={{ minWidth: 0 }}>Full text</div>
          <div></div>
        </div>

        {loading
          ? Array.from({ length: 8 }).map((_, i) => <PaperSkeletonRow key={i} index={i} />)
          : pageRows.map(p => (
          <PaperRow
            key={p.id}
            paper={p}
            selected={selected.has(p.id)}
            onToggle={() => toggleRow(p.id)}
            onOpenModal={onOpenModal}
            onRemove={onRemovePaper}
            onView={onViewPaper}
          />
        ))}

        {!loading && papers.length === 0 && (
          search.trim() ? (
            <div style={{
              padding: "48px 16px", textAlign: "center",
              font: "var(--lt-body)", color: "var(--lt-text-tertiary)",
              letterSpacing: "-0.010em",
            }}>No papers match &ldquo;{search.trim()}&rdquo;.</div>
          ) : (
            <div style={{
              padding: "56px 32px", textAlign: "center",
              display: "flex", flexDirection: "column", alignItems: "center",
            }}>
              <span style={{
                width: 48, height: 48, borderRadius: 13, marginBottom: 18,
                background: "var(--lt-accent-subtle)", color: "var(--lt-accent)",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon name="file" size={22} color="currentColor" />
              </span>
              <h3 style={{
                font: "500 18px/1.3 var(--lt-font-sans)", letterSpacing: "-0.020em",
                color: "var(--lt-text-primary)", margin: "0 0 8px",
              }}>No papers yet</h3>
              <p style={{
                font: "var(--lt-body)", color: "var(--lt-text-secondary)",
                letterSpacing: "-0.010em", margin: "0 0 22px", maxWidth: 380,
              }}>Upload PDFs, BibTeX, or RIS files, or refine your search to pull papers into this project.</p>
              <Button variant="primary" leftIcon="arrow-up-from-line" onClick={() => onOpenModal("upload")}>
                Upload papers
              </Button>
            </div>
          )
        )}
      </div>

      {/* Pagination footer — only when the list spills past one page */}
      {!loading && papers.length > PAGE_SIZE && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 16, marginTop: 16, padding: "0 2px",
        }}>
          <span style={{ font: "var(--lt-body-sm)", letterSpacing: "-0.005em", color: "var(--lt-text-tertiary)" }}>
            Showing {start + 1}–{Math.min(start + PAGE_SIZE, papers.length)} of {papers.length}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <PageButton disabled={safePage === 0} onClick={() => setPage(safePage - 1)} label="Previous">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </PageButton>
            <span style={{
              font: "500 13px/1 var(--lt-font-sans)", letterSpacing: "-0.010em",
              color: "var(--lt-text-secondary)", padding: "0 8px", minWidth: 76, textAlign: "center",
            }}>Page {safePage + 1} of {pageCount}</span>
            <PageButton disabled={safePage >= pageCount - 1} onClick={() => setPage(safePage + 1)} label="Next">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </PageButton>
          </div>
        </div>
      )}
    </div>
  );
}

function PageButton({ disabled, onClick, label, children }) {
  const [hover, setHover] = useStateWP(false);
  return (
    <button onClick={onClick} disabled={disabled} aria-label={label}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        width: 32, height: 32, borderRadius: 8,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        border: "1px solid " + (disabled ? "var(--lt-border-subtle)" : "var(--lt-border-input)"),
        background: (!disabled && hover) ? "var(--lt-bg-active)" : "transparent",
        color: disabled ? "var(--lt-text-disabled, var(--lt-border-input))" : "var(--lt-text-secondary)",
        cursor: disabled ? "default" : "pointer",
        transition: "var(--lt-transition-colors)",
      }}>
      {children}
    </button>
  );
}

/* ── Icon button — compact icon-only action with tooltip ────────────────── */
function IconButton({ icon, label, onClick, danger }) {
  const [hover, setHover] = useStateWP(false);
  return (
    <button onClick={onClick} aria-label={label} title={label}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        width: 36, height: 36, borderRadius: 8, flexShrink: 0,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        background: hover ? "var(--lt-bg-active)" : "transparent", border: 0, cursor: "pointer",
        color: danger ? "var(--lt-danger)" : "var(--lt-text-secondary)",
        transition: "var(--lt-transition-colors)",
      }}>
      <Icon name={icon} size={17} color="currentColor" />
    </button>
  );
}

/* ── Sort menu ──────────────────────────────────────────────────────────── */
function SortMenu({ value, setValue, options }) {
  const [open, setOpen] = useStateWP(false);
  const [hover, setHover] = useStateWP(false);
  const ref = useRefWP(null);
  const current = options.find(o => o.v === value) || options[0];
  return (
    <>
      <button ref={ref} onClick={() => setOpen(o => !o)}
        onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          height: 36, padding: "0 12px",
          background: (open || hover) ? "var(--lt-bg-active)" : "transparent",
          border: 0, borderRadius: 8, cursor: "pointer",
          font: "500 14px/1 var(--lt-font-sans)",
          letterSpacing: "-0.010em",
          color: "var(--lt-text-secondary)",
          whiteSpace: "nowrap", flexShrink: 0,
          transition: "var(--lt-transition-colors)",
        }}>
        <Icon name="arrow-up-down" size={14} color="var(--lt-text-tertiary)" />
        <span style={{ color: "var(--lt-text-tertiary)" }}>Sort:</span>
        <span>{current.l}</span>
        <Icon name="chevron-down" size={14} color="var(--lt-text-tertiary)" />
      </button>
      <Dropdown
        anchor={ref.current}
        open={open}
        onClose={() => setOpen(false)}
        align="right"
        items={options.map(o => ({
          label: o.l,
          icon: o.v === value ? "check" : undefined,
          onClick: () => setValue(o.v),
        }))}
      />
    </>
  );
}

/* ── Skeleton row — placeholder while papers resolve ────────────────────── */
function PaperSkeletonRow({ index = 0 }) {
  // Slight width variation per row so the skeleton reads as content, not a grid.
  const titleW = ["86%", "72%", "94%", "64%", "80%"][index % 5];
  const journW = ["70%", "58%", "82%", "66%"][index % 4];
  // Stagger the pulse a touch per row so they don't all breathe in unison.
  const delay = { animationDelay: `${(index % 4) * 0.12}s` };
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: PAPERS_GRID,
      columnGap: 12,
      alignItems: "center",
      minHeight: 52,
      padding: "8px 12px",
      borderBottom: "1px solid var(--lt-border-subtle)",
    }} aria-hidden="true">
      <div><span className="lt-skeleton" style={{ display: "block", width: 16, height: 16, borderRadius: 4, ...delay }} /></div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7, minWidth: 0 }}>
        <span className="lt-skeleton" style={{ display: "block", width: titleW, height: 11, ...delay }} />
        <span className="lt-skeleton" style={{ display: "block", width: "40%", height: 9, opacity: 0.7, ...delay }} />
      </div>
      <div><span className="lt-skeleton" style={{ display: "block", width: journW, height: 11, ...delay }} /></div>
      <div><span className="lt-skeleton" style={{ display: "block", width: 32, height: 11, ...delay }} /></div>
      <div><span className="lt-skeleton" style={{ display: "block", width: 58, height: 18, borderRadius: 9999, ...delay }} /></div>
      <div></div>
    </div>
  );
}

function PaperRow({ paper, selected, onToggle, onOpenModal, onRemove, onView }) {
  const [hover, setHover] = useStateWP(false);
  const [menuOpen, setMenuOpen] = useStateWP(false);
  const menuRef = useRefWP(null);
  const [copied, setCopied] = useStateWP(false);
  const isMissing = paper.fullText === "missing";

  // APA-ish citation from the row's fields: Authors (Year). Title. Journal.
  const citation = `${paper.authors.replace(/ · /g, ", ")} (${paper.year}). ${paper.title}. ${paper.journal}.`;
  const copyCitation = () => {
    const done = () => { setCopied(true); setTimeout(() => setCopied(false), 1600); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(citation).then(done, done);
    } else {
      const ta = document.createElement("textarea");
      ta.value = citation; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); } catch (e) {}
      document.body.removeChild(ta); done();
    }
  };
  return (
    <div
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: "grid",
        gridTemplateColumns: PAPERS_GRID,
        columnGap: 12,
        alignItems: "center",
        minHeight: 52,
        padding: "8px 12px",
        background: selected ? "var(--lt-accent-subtle)"
                  : isMissing && hover ? "rgba(249, 236, 240, 0.6)"
                  : hover    ? "var(--lt-bg-active)" : "transparent",
        borderBottom: "1px solid var(--lt-border-subtle)",
        transition: "background-color var(--lt-dur-fast) var(--lt-ease-out)",
      }}>
      <div style={{ display: "flex", alignItems: "flex-start", paddingTop: 1 }}>
        <Checkbox checked={selected} onChange={onToggle} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{
          font: "var(--lt-body)",
          letterSpacing: "-0.010em",
          color: "var(--lt-text-primary)",
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }} title={paper.title}>
          {paper.title}
        </div>
        <div style={{
          marginTop: 2,
          font: "var(--lt-body-sm)",
          letterSpacing: "-0.005em",
          color: "var(--lt-text-tertiary)",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }} title={paper.authors}>
          {paper.authors}
        </div>
      </div>
      <div style={{
        minWidth: 0, alignSelf: "center",
        font: "var(--lt-body)",
        letterSpacing: "-0.010em",
        color: "var(--lt-text-secondary)",
        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        overflow: "hidden",
      }} title={paper.journal}>
        {paper.journal}
      </div>
      <div style={{
        minWidth: 0, alignSelf: "center",
        font: "var(--lt-body)",
        letterSpacing: "-0.010em",
        color: "var(--lt-text-secondary)",
      }}>
        {paper.year}
      </div>
      <div style={{ alignSelf: "center" }}>
        <Badge status={paper.fullText}>
          {paper.fullText === "available" ? "Available" : "Missing"}
        </Badge>
      </div>
      <div style={{ alignSelf: "center", display: "flex", justifyContent: "flex-end" }}>
        <button ref={menuRef}
          onClick={(e) => { e.stopPropagation(); setMenuOpen(o => !o); }}
          aria-label="Paper actions"
          style={{
            width: 28, height: 28, borderRadius: 6,
            background: menuOpen ? "var(--lt-bg-active)" : "transparent", border: 0, cursor: "pointer",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            color: "var(--lt-text-tertiary)",
            opacity: (hover || menuOpen) ? 1 : 0,
            transition: "opacity var(--lt-dur-fast) var(--lt-ease-out)",
          }}>
          <Icon name="ellipsis" size={16} color="currentColor" />
        </button>
        <Dropdown
          anchor={menuRef.current}
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          align="right"
          items={[
            ...(isMissing
              ? [
                  { label: "Upload full text", icon: "arrow-up-from-line", onClick: () => onOpenModal && onOpenModal("upload") },
                ]
              : [
                  { label: "View paper", icon: "eye", onClick: () => onView && onView(paper) },
                ]),
            { label: "Copy citation", icon: "copy", onClick: copyCitation },
            { divider: true },
            { label: "Remove", icon: "trash", destructive: true, onClick: () => onRemove && onRemove(paper.id) },
          ]}
        />
        {copied && <CopyToast />}
      </div>
    </div>
  );
}

/* ── Copy confirmation toast ────────────────────────────────────────────── */
function CopyToast() {
  return (
    <div style={{
      position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
      zIndex: 1200,
      display: "inline-flex", alignItems: "center", gap: 8,
      padding: "9px 14px",
      background: "var(--lt-text-ink)", color: "var(--lt-bg-surface)",
      borderRadius: 9999,
      font: "500 13px/1 var(--lt-font-sans)", letterSpacing: "-0.010em",
      boxShadow: "var(--lt-elev-3)",
      animation: "lt-toast-in 160ms var(--lt-ease-out)",
      pointerEvents: "none",
    }}>
      <Icon name="check" size={15} color="currentColor" />
      Citation copied to clipboard
    </div>
  );
}

/* ── Search box ─────────────────────────────────────────────────────────── */
function SearchBox({ value, onChange, placeholder }) {
  const [focus, setFocus] = useStateWP(false);
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      width: "100%", minWidth: 0, maxWidth: 460, height: 32,
      padding: "0 12px",
      border: `1px solid ${focus ? "var(--lt-border-input)" : "var(--lt-border-default)"}`,
      background: "var(--lt-bg-surface)",
      borderRadius: 8,
      boxShadow: focus ? "var(--lt-focus-ring)" : "none",
      transition: "var(--lt-transition-colors)",
    }}>
      <Icon name="search" size={14} color="var(--lt-text-tertiary)" />
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        placeholder={placeholder}
        style={{
          flex: 1, border: 0, outline: "none", background: "transparent",
          font: "var(--lt-body-sm)", color: "var(--lt-text-primary)",
          letterSpacing: "-0.010em",
        }}
      />
      {value && (
        <button onClick={() => onChange("")}
          style={{ background: "transparent", border: 0, padding: 2, cursor: "pointer", color: "var(--lt-text-tertiary)", display: "inline-flex" }}>
          <Icon name="x" size={12} color="currentColor" />
        </button>
      )}
    </div>
  );
}

/* ── Literature reviews tab ─────────────────────────────────────────────── */
function ReviewsPane({ reviews, onGoToPapers, onCreateReview, onOpenReview, onDeleteReview, onRenameReview, onDuplicateReview }) {
  const [search, setSearch] = useStateWP("");
  const [sort, setSort] = useStateWP("recent");
  if (reviews.length === 0) {
    return (
      <div style={{ marginTop: 28 }}>
        <div style={{
          padding: "52px 32px", textAlign: "center",
          display: "flex", flexDirection: "column", alignItems: "center",
          border: "1px dashed var(--lt-border-input)",
          borderRadius: 14,
        }}>
          <span style={{
            width: 52, height: 52, borderRadius: 14, marginBottom: 20,
            background: "var(--lt-accent-subtle)", color: "var(--lt-accent)",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon name="sparkles" size={24} color="currentColor" />
          </span>
          <h3 style={{
            font: "500 19px/1.3 var(--lt-font-sans)", letterSpacing: "-0.022em",
            color: "var(--lt-text-primary)", margin: "0 0 8px",
          }}>No literature reviews yet</h3>
          <p style={{
            font: "var(--lt-body)", color: "var(--lt-text-secondary)",
            letterSpacing: "-0.010em", margin: "0 0 24px", maxWidth: 420,
          }}>A literature review is a full synthesis built from the complete texts of your papers.</p>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Button variant="primary" leftIcon="sparkles" onClick={onCreateReview}>
              Generate review
            </Button>
            <Button variant="ghost" onClick={onGoToPapers}>
              Browse papers
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const q = search.trim().toLowerCase();
  const filtered = (q ? reviews.filter(r => r.title.toLowerCase().includes(q)) : reviews.slice())
    .sort((a, b) => {
      switch (sort) {
        case "oldest": return Date.parse(a.created) - Date.parse(b.created);
        case "title":  return a.title.localeCompare(b.title);
        case "papers": return b.papers - a.papers;
        case "recent":
        default:       return Date.parse(b.created) - Date.parse(a.created);
      }
    });

  return (
    <div style={{ marginTop: 28 }}>
      {/* Toolbar — identical structure to the Papers tab: search + sort grouped
         on the left, so the sort control sits in the same position on both. */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 16, marginBottom: 20,
      }}>
        <div style={{ flex: 1, minWidth: 0, maxWidth: 420 }}>
          <SearchBox value={search} onChange={setSearch} placeholder="Search reviews..." />
        </div>
        <div style={{ flexShrink: 0 }}>
          <SortMenu value={sort} setValue={setSort} options={REVIEW_SORT_OPTIONS} />
        </div>
      </div>

      <div>
        {/* Header — mirrors the Papers table header so both tabs share the same
           toolbar → header → rows rhythm and the content starts at the same Y. */}
        <div style={{
          display: "flex", alignItems: "center", gap: 14,
          height: 36, padding: "0 12px",
          borderBottom: "1px solid var(--lt-border-default)",
          font: "var(--lt-table-header)", letterSpacing: "-0.005em",
          color: "var(--lt-text-tertiary)",
        }}>
          <span style={{ width: 32, flexShrink: 0 }} />
          <span style={{ flex: 1, minWidth: 0 }}>Review</span>
          <span style={{ flexShrink: 0 }}>Status</span>
          <span style={{ width: 28, flexShrink: 0 }} />
        </div>

        {filtered.map((r, i) => (
          <ReviewRow key={r.id} review={r} isLast={i === filtered.length - 1} onOpen={onOpenReview} onDelete={onDeleteReview} onRename={onRenameReview} onDuplicate={onDuplicateReview} />
        ))}
        {filtered.length === 0 && (
          <div style={{
            padding: "40px 16px", textAlign: "center",
            font: "var(--lt-body)", color: "var(--lt-text-tertiary)", letterSpacing: "-0.010em",
          }}>No reviews match your search.</div>
        )}
      </div>
    </div>
  );
}

function ReviewRow({ review, isLast, onOpen, onDelete, onRename, onDuplicate }) {
  const [hover, setHover] = useStateWP(false);
  const [menuOpen, setMenuOpen] = useStateWP(false);
  const [renaming, setRenaming] = useStateWP(false);
  const [draft, setDraft] = useStateWP(review.title);
  const menuRef = useRefWP(null);
  const isComplete = review.status === "Complete";
  const commitRename = () => {
    const t = draft.trim();
    if (t && t !== review.title && onRename) onRename(review.id, t);
    setRenaming(false);
  };
  return (
    <a href="#"
      onClick={(e) => { e.preventDefault(); if (!renaming && onOpen) onOpen(); }}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", flexDirection: "column",
        padding: "14px 12px",
        background: hover ? "var(--lt-bg-active)" : "transparent",
        borderBottom: isLast ? 0 : "1px solid var(--lt-border-subtle)",
        textDecoration: "none", color: "inherit",
        transition: "var(--lt-transition-colors)",
        cursor: "pointer",
      }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{
          width: 32, height: 32, borderRadius: 8,
          background: "var(--lt-accent-subtle)",
          color: "var(--lt-accent)",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <Icon name="file" size={15} color="currentColor" />
        </span>

        <div style={{ flex: 1, minWidth: 0 }}>
          {renaming ? (
            <input
              value={draft}
              autoFocus
              onChange={(e) => setDraft(e.target.value)}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onMouseDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") { setDraft(review.title); setRenaming(false); } }}
              onBlur={commitRename}
              style={{
                width: "100%", boxSizing: "border-box",
                font: "500 14px/1.35 var(--lt-font-sans)", letterSpacing: "-0.015em",
                color: "var(--lt-text-primary)",
                border: "1px solid var(--lt-accent)", borderRadius: 6,
                padding: "3px 7px", outline: "none", background: "var(--lt-bg-surface)",
              }}
            />
          ) : (
            <div style={{
              font: "500 14px/1.35 var(--lt-font-sans)",
              letterSpacing: "-0.015em",
              color: "var(--lt-text-primary)",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>{review.title}</div>
          )}
          <div style={{
            marginTop: 3,
            font: "var(--lt-body-sm)",
            letterSpacing: "-0.005em",
            color: "var(--lt-text-tertiary)",
          }}>
            {isComplete
              ? `${review.papers} papers · Updated ${review.updated}`
              : `${review.screened} of ${review.papers} papers screened · Updated ${review.updated}`}
          </div>
        </div>

        <span style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          font: "var(--lt-badge)", letterSpacing: "-0.010em",
          color: isComplete ? "var(--lt-success-strong)" : "var(--lt-text-secondary)",
          background: isComplete ? "var(--lt-success-subtle)" : "var(--lt-bg-stone)",
          padding: "3px 8px 3px 7px", borderRadius: 9999,
          flexShrink: 0,
        }}>
          <span style={{ width: 5, height: 5, borderRadius: 5,
            background: isComplete ? "var(--lt-success)" : "var(--lt-text-tertiary)" }} />
          {review.status}
        </span>

        <button ref={menuRef}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen(o => !o); }}
          aria-label="Review actions"
          style={{
            width: 28, height: 28, borderRadius: 6,
            background: menuOpen ? "var(--lt-bg-active)" : "transparent", border: 0, cursor: "pointer",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            color: "var(--lt-text-tertiary)",
            opacity: (hover || menuOpen) ? 1 : 0,
            transition: "opacity var(--lt-dur-fast) var(--lt-ease-out)",
            flexShrink: 0,
          }}>
          <Icon name="ellipsis" size={16} color="currentColor" />
        </button>
      </div>

      {!isComplete && (
        <div style={{
          marginLeft: 46, marginTop: 10, height: 4, borderRadius: 9999,
          background: "var(--lt-bg-stone)", overflow: "hidden", maxWidth: 320,
        }}>
          <div style={{
            height: "100%", borderRadius: 9999,
            width: `${Math.round((review.screened / review.papers) * 100)}%`,
            background: "var(--lt-accent)",
          }} />
        </div>
      )}

      <Dropdown
        anchor={menuRef.current}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        align="right"
        items={[
          { label: "Rename", icon: "pencil-line", onClick: () => { setDraft(review.title); setRenaming(true); } },
          { label: "Export PDF", icon: "download", onClick: () => {
            const a = document.createElement("a");
            a.href = "Literature Review (standalone).html";
            a.download = "Literature Review — " + review.title + ".html";
            document.body.appendChild(a); a.click(); a.remove();
          } },
          { divider: true },
          { label: "Delete", icon: "trash", destructive: true, onClick: () => { if (onDelete) onDelete(review.id); } },
        ]}
      />
    </a>
  );
}

/* ── Modal shell (inlined, page-local) ──────────────────────────────────── */
function Modal({ children, onClose, width = 480 }) {
  useEffectWP(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);
  return (
    <div onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "var(--lt-overlay-modal)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
      }}>
      <div onClick={e => e.stopPropagation()}
        style={{
          background: "var(--lt-bg-surface)",
          borderRadius: 16,
          border: "1px solid var(--lt-border-default)",
          boxShadow: "var(--lt-elev-3)",
          width, maxWidth: "100%",
          maxHeight: "calc(100vh - 48px)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}>
        {children}
      </div>
    </div>
  );
}

/* ── Upload modal ───────────────────────────────────────────────────────── */
function UploadModal({ onClose }) {
  const [files, setFiles] = useStateWP([]);
  const [dragOver, setDragOver] = useStateWP(false);
  const totalSize = files.reduce((s, f) => s + parseFloat(f.size), 0).toFixed(1);

  // Prototype: dropping or choosing files populates a representative set so the
  // "files added" state is explorable. Real upload would read the dropped files.
  const addSampleFiles = () => setFiles([
    { name: "Acemoglu_AI_labor_2023.pdf", size: "3.1 MB", meta: "Acemoglu & Restrepo · JEP · 2023", state: "ready" },
    { name: "Henrich_cultural_bias.pdf",  size: "2.4 MB", meta: "Henrich & Heine · QJE · 2021",     state: "ready" },
  ]);

  return (
    <Modal onClose={onClose} width={560}>
      <div style={{ padding: "22px 24px 0", display: "flex", flexDirection: "column", gap: 4 }}>
        <h3 style={{ font: "500 18px/1.3 var(--lt-font-sans)", letterSpacing: "-0.020em", color: "var(--lt-text-primary)", margin: 0 }}>Upload papers</h3>
        <p style={{ font: "var(--lt-body)", color: "var(--lt-text-secondary)", letterSpacing: "-0.010em", margin: 0 }}>
          Drop PDFs, BibTeX, or RIS files – Litree extracts authors, titles, and abstracts automatically.
        </p>
      </div>

      <div style={{ padding: "18px 24px 4px", flex: 1, overflow: "auto", minHeight: 0 }}>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); addSampleFiles(); }}
          style={{
            border: `1.5px dashed ${dragOver ? "var(--lt-accent)" : "var(--lt-border-input)"}`,
            background: dragOver ? "var(--lt-accent-subtle)" : "var(--lt-bg-primary)",
            borderRadius: 12,
            padding: "28px 24px",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
            transition: "var(--lt-transition-colors)",
          }}>
          <span style={{
            width: 40, height: 40, borderRadius: 10,
            background: dragOver ? "var(--lt-bg-surface)" : "var(--lt-bg-stone)",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            color: dragOver ? "var(--lt-accent)" : "var(--lt-text-secondary)",
            transition: "var(--lt-transition-colors)",
          }}>
            <Icon name="arrow-up-from-line" size={18} color="currentColor" />
          </span>
          <div style={{ font: "500 14px/1.3 var(--lt-font-sans)", color: "var(--lt-text-primary)", letterSpacing: "-0.010em" }}>
            {dragOver ? "Release to upload" : "Drag PDFs, BibTeX, or RIS files here"}
          </div>
          <div style={{ font: "var(--lt-body-sm)", color: "var(--lt-text-tertiary)", letterSpacing: "-0.010em" }}>or</div>
          <Button variant="secondary" leftIcon="folder-open" onClick={addSampleFiles}>Choose files from computer</Button>
          <div style={{
            marginTop: 4,
            font: "500 10px/1 var(--lt-font-sans)",
            letterSpacing: "0.04em", textTransform: "uppercase",
            color: "var(--lt-text-tertiary)",
          }}>Max 50 files · 50 MB each</div>
        </div>

        {files.length > 0 && (
          <div style={{ marginTop: 18 }}>
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginBottom: 8,
            }}>
              <div style={{
                font: "500 10px/1 var(--lt-font-sans)",
                letterSpacing: "0.04em", textTransform: "uppercase",
                color: "var(--lt-text-tertiary)",
              }}>
                {files.length} ready · {totalSize} MB
              </div>
              <button onClick={() => setFiles([])}
                style={{
                  background: "transparent", border: 0, padding: 0, cursor: "pointer",
                  font: "500 11px/1 var(--lt-font-sans)",
                  letterSpacing: "-0.010em",
                  color: "var(--lt-text-tertiary)",
                }}>Clear all</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {files.map((f, i) => (
                <FileRow key={i} file={f}
                  onRemove={() => setFiles(files.filter((_, j) => j !== i))}
                  isLast />
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{
        display: "flex", justifyContent: "flex-end", gap: 8,
        padding: "8px 24px 20px",
      }}>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="primary" leftIcon="check"
          disabled={files.length === 0}
          onClick={onClose}>
          Add {files.length} {files.length === 1 ? "paper" : "papers"}
        </Button>
      </div>
    </Modal>
  );
}

function FileRow({ file, onRemove, isLast }) {
  const [hover, setHover] = useStateWP(false);
  return (
    <div
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 12px",
        background: hover ? "var(--lt-bg-active)" : "transparent",
        borderBottom: isLast ? 0 : "1px solid var(--lt-border-subtle)",
        transition: "var(--lt-transition-colors)",
      }}>
      <span style={{
        width: 28, height: 28, borderRadius: 6,
        background: "var(--lt-accent-subtle)",
        color: "var(--lt-accent)",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Icon name="file" size={14} color="currentColor" />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          font: "500 13px/1.2 var(--lt-font-sans)",
          letterSpacing: "-0.010em",
          color: "var(--lt-text-primary)",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{file.name}</div>
        <div style={{
          marginTop: 2,
          font: "11px/1.4 var(--lt-font-sans)",
          letterSpacing: "-0.005em",
          color: "var(--lt-text-tertiary)",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{file.meta} · {file.size}</div>
      </div>
      <button onClick={onRemove}
        style={{
          width: 26, height: 26, borderRadius: 6,
          background: "transparent", border: 0, cursor: "pointer",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          color: "var(--lt-text-tertiary)",
          opacity: hover ? 1 : 0,
          transition: "opacity var(--lt-dur-fast) var(--lt-ease-out)",
        }}>
        <Icon name="x" size={14} color="currentColor" />
      </button>
    </div>
  );
}

/* ── Request full texts modal ───────────────────────────────────────────── */
function RequestTextsModal({ onClose, count, papers }) {
  const [to, setTo] = useStateWP("library@adb.org");
  const [subject, setSubject] = useStateWP(`Full-text request – ${papers.length} papers`);
  const [body, setBody] = useStateWP([
    "Dear Library Team,",
    "",
    `I am conducting a literature review on economic inequality and intergenerational mobility. I would like to request full-text access for ${papers.length} papers that are not currently available through our institutional subscriptions.`,
    "",
    "The full list of references is attached at the bottom of this email.",
    "",
    "Thank you for your support.",
    "",
    "Best regards,",
    "Jane Doe",
  ].join("\n"));
  const [copied, setCopied] = useStateWP(false);
  const fullEmail = [
    body, "",
    "References:",
    ...papers.map((p, i) => `${i + 1}. ${p.title} (${p.authors}, ${p.year}) – ${p.journal}`),
  ].join("\n");

  const inputStyle = {
    width: "100%", boxSizing: "border-box",
    height: 36, padding: "0 12px",
    font: "13px/1 var(--lt-font-sans)",
    letterSpacing: "-0.010em",
    color: "var(--lt-text-primary)",
    background: "var(--lt-bg-surface)",
    border: "1px solid var(--lt-border-default)",
    borderRadius: 8,
    outline: "none",
  };
  const labelStyle = {
    display: "block", marginBottom: 6,
    font: "var(--lt-label)",
    letterSpacing: "-0.010em",
    color: "var(--lt-text-secondary)",
  };

  return (
    <Modal onClose={onClose} width={560}>
      <div style={{ padding: "22px 24px 0", display: "flex", flexDirection: "column", gap: 4 }}>
        <h3 style={{ font: "500 18px/1.3 var(--lt-font-sans)", letterSpacing: "-0.020em", color: "var(--lt-text-primary)", margin: 0 }}>
          Request full texts from your library
        </h3>
        <p style={{ font: "var(--lt-body)", color: "var(--lt-text-secondary)", letterSpacing: "-0.010em", margin: 0 }}>
          We've drafted an email for {papers.length} missing {papers.length === 1 ? "paper" : "papers"}. Review, edit, then send.
        </p>
      </div>

      <div style={{ padding: "18px 24px 4px", flex: 1, overflow: "auto", minHeight: 0, display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={labelStyle}>To</label>
          <input value={to} onChange={(e) => setTo(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Subject</label>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Message</label>
          <textarea value={body} onChange={(e) => setBody(e.target.value)}
            rows={8}
            style={{
              ...inputStyle,
              height: "auto", padding: 12, lineHeight: 1.55, resize: "vertical",
            }} />
        </div>
      </div>

      <div style={{
        display: "flex", justifyContent: "flex-end", gap: 8,
        padding: "8px 24px 20px",
      }}>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="primary" leftIcon={copied ? "check" : "copy"}
          onClick={() => {
            navigator.clipboard && navigator.clipboard.writeText(fullEmail).catch(() => {});
            setCopied(true);
            setTimeout(() => setCopied(false), 1400);
          }}>
          {copied ? "Copied" : "Copy email"}
        </Button>
      </div>
    </Modal>
  );
}

/* ── Quick summary modal ────────────────────────────────────────────────── */
function QuickSummaryModal({ onClose, onPreview, count }) {
  const downloadDoc = () => {
    const a = document.createElement("a");
    a.href = "Quick Summary (standalone).html";
    a.download = "Quick Summary — Inequality, mobility & cohesion.html";
    document.body.appendChild(a);
    a.click();
    a.remove();
    onClose();
  };
  return (
    <Modal onClose={onClose} width={480}>
      <div style={{ padding: "24px 26px 0", display: "flex", flexDirection: "column", gap: 7 }}>
        <h3 style={{
          font: "500 18px/1.3 var(--lt-font-sans)",
          letterSpacing: "-0.020em", color: "var(--lt-text-primary)", margin: 0,
        }}>Quick summary</h3>
        <p style={{ font: "var(--lt-body)", color: "var(--lt-text-secondary)", letterSpacing: "-0.010em", margin: 0 }}>
          A fast read on what the literature says, synthesized from the papers’ abstracts.
        </p>
      </div>

      <div style={{ padding: "18px 26px 4px", display: "flex", flexDirection: "column", gap: 13 }}>
        {/* What you'll get — concrete facts, not filler like "formatted document" */}
        <div style={{
          display: "flex", alignItems: "center", gap: 9,
          font: "var(--lt-body)", letterSpacing: "-0.010em", color: "var(--lt-text-secondary)",
        }}>
          <Icon name="file" size={16} color="var(--lt-text-tertiary)" />
          Key takeaways · 14 themes · 318 abstracts
        </div>

        {/* Caveat — also carries the distinction from a full literature review */}
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 7, alignSelf: "flex-start",
          font: "500 12.5px/1 var(--lt-font-sans)", letterSpacing: "-0.005em",
          color: "var(--lt-warn-strong)", background: "var(--lt-warn-subtle)",
          padding: "6px 11px", borderRadius: 9999,
        }}>
          <Icon name="circle-alert" size={13} color="currentColor" />
          Abstracts only — not a full literature review
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "18px 26px 22px" }}>
        <Button variant="ghost" leftIcon="eye" onClick={onPreview}>Preview</Button>
        <Button variant="primary" leftIcon="download" onClick={downloadDoc}>Download summary</Button>
      </div>
    </Modal>
  );
}

/* ── Quick summary preview — in-app overlay embedding the document ───────── */
function QuickSummaryPreview({ onBack, onClose }) {
  const downloadDoc = () => {
    const a = document.createElement("a");
    a.href = "Quick Summary (standalone).html";
    a.download = "Quick Summary — Inequality, mobility & cohesion.html";
    document.body.appendChild(a); a.click(); a.remove();
  };
  useEffectWP(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [onClose]);
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "var(--lt-overlay-panel, rgba(0,0,0,0.45))",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 24px",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: "100%", maxWidth: 880, height: "100%", maxHeight: "92vh",
        background: "var(--lt-bg-surface)", borderRadius: 14, overflow: "hidden",
        boxShadow: "var(--lt-elev-3)", display: "flex", flexDirection: "column",
      }}>
        {/* Toolbar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
          padding: "12px 14px 12px 18px",
          borderBottom: "1px solid var(--lt-border-default)", flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <button onClick={onBack} aria-label="Back" style={{
              width: 30, height: 30, borderRadius: 7, flexShrink: 0,
              background: "transparent", border: 0, cursor: "pointer",
              display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--lt-text-secondary)",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <span style={{ font: "500 14px/1.3 var(--lt-font-sans)", letterSpacing: "-0.015em", color: "var(--lt-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              Quick summary — preview
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <Button variant="primary" size="sm" leftIcon="download" onClick={downloadDoc}>Download</Button>
            <button onClick={onClose} aria-label="Close" style={{
              width: 30, height: 30, borderRadius: 7,
              background: "transparent", border: 0, cursor: "pointer",
              display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--lt-text-tertiary)",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>
        </div>
        {/* Document */}
        <iframe src="Quick Summary.html" title="Quick summary preview" style={{
          flex: 1, width: "100%", border: 0, background: "var(--lt-bg-stone)",
        }} />
      </div>
    </div>
  );
}

/* ── Paper preview — in-app overlay showing the paper's full text ───────── */
function PaperPreview({ paper, onClose }) {
  useEffectWP(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [onClose]);
  const authors = (paper.authors || "").replace(/ · /g, ", ");
  const para = (t) => (
    <p style={{ font: "400 14.5px/1.75 var(--lt-font-sans)", letterSpacing: "-0.003em", color: "var(--lt-text-secondary)", margin: "0 0 15px", textWrap: "pretty" }}>{t}</p>
  );
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "var(--lt-overlay-panel, rgba(0,0,0,0.45))",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 24px",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: "100%", maxWidth: 820, height: "100%", maxHeight: "92vh",
        background: "var(--lt-bg-surface)", borderRadius: 14, overflow: "hidden",
        boxShadow: "var(--lt-elev-3)", display: "flex", flexDirection: "column",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
          padding: "12px 14px 12px 18px",
          borderBottom: "1px solid var(--lt-border-default)", flexShrink: 0,
        }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, font: "500 14px/1.3 var(--lt-font-sans)", letterSpacing: "-0.015em", color: "var(--lt-text-primary)", overflow: "hidden" }}>
            <Icon name="file" size={15} color="var(--lt-text-tertiary)" />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Full text</span>
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <Button variant="secondary" size="sm" leftIcon="download" onClick={onClose}>Download PDF</Button>
            <button onClick={onClose} aria-label="Close" style={{
              width: 30, height: 30, borderRadius: 7,
              background: "transparent", border: 0, cursor: "pointer",
              display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--lt-text-tertiary)",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", background: "var(--lt-bg-stone)" }}>
          <article style={{
            maxWidth: 640, margin: "28px auto", background: "var(--lt-bg-surface)",
            border: "1px solid var(--lt-border-default)", borderRadius: 12, padding: "48px 56px 56px",
          }}>
            <div style={{ font: "500 11px/1 var(--lt-font-sans)", letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--lt-text-tertiary)", marginBottom: 16 }}>
              {paper.journal} · {paper.year}
            </div>
            <h1 style={{ font: "500 26px/1.28 var(--lt-font-serif, var(--lt-font-sans))", letterSpacing: "-0.010em", color: "var(--lt-text-ink, var(--lt-text-primary))", margin: "0 0 12px", textWrap: "balance" }}>
              {paper.title}
            </h1>
            <div style={{ font: "400 14px/1.5 var(--lt-font-sans)", letterSpacing: "-0.005em", color: "var(--lt-text-secondary)", marginBottom: 28, paddingBottom: 24, borderBottom: "1px solid var(--lt-border-subtle)" }}>
              {authors}
            </div>
            <h2 style={{ font: "500 13px/1 var(--lt-font-sans)", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--lt-text-tertiary)", margin: "0 0 12px" }}>Abstract</h2>
            {para(`This paper examines ${paper.title.toLowerCase()}, situating the question within the broader literature and contributing new evidence on its mechanisms and policy relevance. We motivate the analysis, describe our data and identification strategy, and summarise the principal findings.`)}
            {para("Drawing on the empirical setting, we document robust patterns and test the leading explanations against plausible alternatives. The results are consistent across specifications and subsamples, and we discuss the conditions under which the effects are strongest.")}
            {para("We conclude by drawing out implications for theory and policy, noting the limitations of the present design and outlining directions for future work. Full text rendered here is a representative preview for the prototype.")}
          </article>
        </div>
      </div>
    </div>
  );
}

/* ── Literature review preview — in-app overlay embedding the document ───── */
function ReviewDocPreview({ onClose }) {
  const downloadDoc = () => {
    const a = document.createElement("a");
    a.href = "Literature Review (standalone).html";
    a.download = "Literature Review — Inequality, mobility & cohesion.html";
    document.body.appendChild(a); a.click(); a.remove();
  };
  useEffectWP(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [onClose]);
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "var(--lt-overlay-panel, rgba(0,0,0,0.45))",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 24px",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: "100%", maxWidth: 880, height: "100%", maxHeight: "92vh",
        background: "var(--lt-bg-surface)", borderRadius: 14, overflow: "hidden",
        boxShadow: "var(--lt-elev-3)", display: "flex", flexDirection: "column",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
          padding: "12px 14px 12px 18px",
          borderBottom: "1px solid var(--lt-border-default)", flexShrink: 0,
        }}>
          <span style={{ font: "500 14px/1.3 var(--lt-font-sans)", letterSpacing: "-0.015em", color: "var(--lt-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            Literature review
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <Button variant="primary" size="sm" leftIcon="download" onClick={downloadDoc}>Download</Button>
            <button onClick={onClose} aria-label="Close" style={{
              width: 30, height: 30, borderRadius: 7,
              background: "transparent", border: 0, cursor: "pointer",
              display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--lt-text-tertiary)",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>
        </div>
        <iframe src="Literature Review.html" title="Literature review" style={{
          flex: 1, width: "100%", border: 0, background: "var(--lt-bg-stone)",
        }} />
      </div>
    </div>
  );
}

/* ── Generate review modal ──────────────────────────────────────────────── */
function CreateReviewModal({ onClose, onCreate }) {
  const [instructions, setInstructions] = useStateWP("");
  const [focus, setFocus] = useStateWP(false);
  const suggestions = [
    "Emphasise the most recent studies",
    "Group findings by methodology",
    "Compare results across regions",
    "Highlight gaps and open questions",
  ];
  const addSuggestion = (s) => {
    setInstructions(prev => {
      const t = prev.trim();
      if (!t) return s + ".";
      if (t.toLowerCase().includes(s.toLowerCase())) return prev;
      return t.replace(/\.?$/, ". ") + s + ".";
    });
  };
  useEffectWP(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <Modal onClose={onClose} width={500}>
      <div style={{ padding: "24px 26px 0", display: "flex", flexDirection: "column", gap: 7 }}>
        <h3 style={{ font: "500 18px/1.3 var(--lt-font-sans)", letterSpacing: "-0.020em", color: "var(--lt-text-primary)", margin: 0 }}>
          Generate literature review
        </h3>
        <p style={{ font: "var(--lt-body)", color: "var(--lt-text-secondary)", letterSpacing: "-0.010em", margin: 0 }}>
          Litree reads your papers and writes a full, cited synthesis of the field.
        </p>
      </div>

      <div style={{ padding: "18px 26px 4px", display: "flex", flexDirection: "column", gap: 12 }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{
            font: "500 13px/1 var(--lt-font-sans)", letterSpacing: "-0.010em",
            color: "var(--lt-text-secondary)",
          }}>Custom instructions <span style={{ color: "var(--lt-text-tertiary)", fontWeight: 400 }}>(optional)</span></span>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
            rows={4}
            placeholder="Tell Litree how to shape the review — tone, structure, what to emphasise…"
            style={{
              width: "100%", boxSizing: "border-box", resize: "vertical",
              padding: "11px 13px", borderRadius: 10,
              border: "1px solid " + (focus ? "var(--lt-accent)" : "var(--lt-border-input)"),
              boxShadow: focus ? "var(--lt-focus-ring)" : "none",
              background: "var(--lt-bg-surface)", color: "var(--lt-text-primary)",
              font: "var(--lt-body)", letterSpacing: "-0.006em", outline: "none",
              transition: "var(--lt-transition-colors)",
            }}
          />
        </label>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => addSuggestion(s)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "5px 11px", borderRadius: 9999, cursor: "pointer",
                border: "1px solid var(--lt-border-input)", background: "transparent",
                font: "500 12.5px/1 var(--lt-font-sans)", letterSpacing: "-0.005em",
                color: "var(--lt-text-secondary)",
                transition: "var(--lt-transition-colors)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--lt-bg-active)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
              <span style={{ color: "var(--lt-text-tertiary)", fontWeight: 400 }}>+</span>{s}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: "18px 26px 22px" }}>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="primary" leftIcon="sparkles" onClick={() => onCreate(instructions)}>
          Generate review
        </Button>
      </div>
    </Modal>
  );
}

/* ── Delete confirm modal ───────────────────────────────────────────────── */
function DeleteConfirmModal({ onClose, count, items = [] }) {
  return (
    <Modal onClose={onClose} width={420}>
      <div style={{ padding: "22px 24px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
        <span style={{
          width: 36, height: 36, borderRadius: 10,
          background: "var(--lt-danger-subtle)",
          color: "var(--lt-danger)",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon name="trash" size={16} color="currentColor" />
        </span>
        <h3 style={{ font: "500 18px/1.3 var(--lt-font-sans)", letterSpacing: "-0.020em", color: "var(--lt-text-primary)", margin: 0 }}>
          Remove {count} {count === 1 ? "paper" : "papers"}?
        </h3>
        <p style={{ font: "var(--lt-body)", color: "var(--lt-text-secondary)", letterSpacing: "-0.010em", margin: 0 }}>
          These papers will be removed from this project. Any literature reviews that already cite them keep their citations.
        </p>
      </div>

      <div style={{
        display: "flex", justifyContent: "flex-end", gap: 8,
        padding: "8px 24px 20px",
      }}>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="danger" leftIcon="trash" onClick={onClose}>
          Remove {count} {count === 1 ? "paper" : "papers"}
        </Button>
      </div>
    </Modal>
  );
}

Object.assign(window, { WorkspacePage });
