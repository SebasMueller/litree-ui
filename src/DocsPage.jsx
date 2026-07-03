// DocsPage.jsx – Journals documentation.
// Flat, text-first layout: no card chrome, no section dividers. Sections are
// separated by whitespace and the weight of their H3 + count. TOC rail is the
// only persistent line on the page.
//
// Content rules:
//  - No stat tiles or inline stat row – counts live in the TOC and per-group
//    pills where they're actionable.
//  - Intro mentions group count inline.
//  - Hover on journal rows provides row-separation; no horizontal dividers.

const { useState: useStateDP, useEffect: useEffectDP, useMemo: useMemoDP, useRef: useRefDP } = React;

function DocsPage({ knobs }) {
  const [article, setArticle] = useStateDP("journals");

  return (
    <main style={{
      flex: 1, minWidth: 0, height: "100%",
      overflow: "hidden", background: "var(--lt-bg-primary)",
      display: "flex", flexDirection: "column",
    }}>
      {article === "journals"
        ? <JournalsDoc knobs={knobs} article={article} setArticle={setArticle} />
        : <EbscoDoc article={article} setArticle={setArticle} />}

    </main>
  );
}

/* Shared left-rail nav: article list + section anchors for current article */
function DocsNav({ article, setArticle, sections, activeSection, scrollTo }) {
  return (
    <aside style={{
      position: "sticky", top: 0, alignSelf: "start",
      paddingTop: 4,
    }}>
      <div style={{
        font: "500 10px/1.6 var(--lt-font-sans)",
        letterSpacing: "0.08em", textTransform: "uppercase",
        color: "var(--lt-text-tertiary)",
        padding: "0 10px 10px",
      }}>
        Pipelines
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 1, marginBottom: 20 }}>
        <ArticleItem label="EBSCO research pipeline" active={article === "ebsco"} onClick={() => setArticle("ebsco")} />
        <ArticleItem label="Journal catalog"         active={article === "journals"} onClick={() => setArticle("journals")} />
      </div>

      {sections && sections.length > 0 && (
        <>
          <div style={{
            font: "500 10px/1.6 var(--lt-font-sans)",
            letterSpacing: "0.08em", textTransform: "uppercase",
            color: "var(--lt-text-tertiary)",
            padding: "0 10px 10px",
          }}>
            On this page
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {sections.map(s => (
              <TocItem
                key={s.id}
                label={s.label}
                count={s.count}
                dim={s.dim}
                active={activeSection === s.id}
                onClick={() => !s.dim && scrollTo(s.id)}
              />
            ))}
          </div>
        </>
      )}

      <div style={{
        marginTop: 16, padding: "0 10px",
        font: "400 12px/1.5 var(--lt-font-sans)",
        color: "var(--lt-text-tertiary)", letterSpacing: "-0.005em",
      }}>
        Last updated <span style={{ color: "var(--lt-text-secondary)" }}>April 22, 2026</span>
      </div>
    </aside>
  );
}

function ArticleItem({ label, active, onClick }) {
  const [hover, setHover] = useStateDP(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        width: "100%", textAlign: "left",
        background: active ? "var(--lt-accent-subtle)" : hover ? "var(--lt-bg-hover)" : "transparent",
        border: 0, cursor: "pointer",
        padding: "7px 10px", borderRadius: 6,
        font: `${active ? 500 : 500} 13.5px/1.4 var(--lt-font-sans)`,
        letterSpacing: "-0.01em",
        color: active ? "var(--lt-accent)" : hover ? "var(--lt-text-primary)" : "var(--lt-text-secondary)",
        transition: "color 120ms ease, background-color 120ms ease",
      }}
    >
      {label}
    </button>
  );
}

/* ───────── Journals tab ───────── */

function JournalsDoc({ knobs, article, setArticle }) {
  const scrollerRef = useRefDP(null);
  const [search, setSearch] = useStateDP("");
  const [activeSection, setActiveSection] = useStateDP("overview");

  const filtered = useMemoDP(() => {
    if (!search.trim()) return JOURNAL_GROUPS.map(g => ({ ...g, filtered: g.journals, hidden: false }));
    const q = search.trim().toLowerCase();
    return JOURNAL_GROUPS.map(g => {
      const matches = g.journals.filter(j => j.toLowerCase().includes(q));
      const nameHit = g.name.toLowerCase().includes(q);
      return {
        ...g,
        filtered: nameHit ? g.journals : matches,
        hidden: !nameHit && matches.length === 0,
      };
    });
  }, [search]);

  const visibleGroups = filtered.filter(g => !g.hidden);
  const totalVisible = visibleGroups.reduce((a, g) => a + g.filtered.length, 0);

  useEffectDP(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const onScroll = () => {
      const sections = scroller.querySelectorAll("[data-section-id]");
      const probeY = scroller.scrollTop + 140;
      let current = "overview";
      sections.forEach(s => {
        if (s.offsetTop <= probeY) current = s.getAttribute("data-section-id");
      });
      setActiveSection(current);
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => scroller.removeEventListener("scroll", onScroll);
  }, [visibleGroups.length]);

  const scrollTo = (id) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const el = scroller.querySelector(`[data-section-id="${id}"]`);
    if (!el) return;
    scroller.scrollTo({ top: el.offsetTop - 28, behavior: "smooth" });
  };

  return (
    <div ref={scrollerRef} style={{
      height: "100%", overflowY: "auto",
      display: "grid",
      gridTemplateColumns: "200px minmax(0, 1fr)",
      columnGap: 48,
      padding: "32px 48px 96px",
      alignItems: "start",
    }}>
      <DocsNav
        article={article}
        setArticle={setArticle}
        sections={[
          { id: "overview", label: "Overview" },
          ...filtered.map(g => ({
            id: g.id,
            label: g.name,
            count: g.hidden ? 0 : g.filtered.length,
            dim: g.hidden,
          })),
        ]}
        activeSection={activeSection}
        scrollTo={scrollTo}
      />

      {/* Content – flat, no cards */}
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0, maxWidth: 960 }}>
        {/* Overview */}
        <section data-section-id="overview" style={{ paddingBottom: 40 }}>
          <h2 style={{
            font: "500 28px/1.22 var(--lt-font-serif, var(--lt-font-sans))", letterSpacing: "-0.012em",
            color: "var(--lt-text-ink, var(--lt-text-primary))", margin: 0, maxWidth: 720,
          }}>
            Journal catalog
          </h2>
          <p style={{
            marginTop: 12,
            font: "400 15px/1.65 var(--lt-font-sans)", letterSpacing: "-0.005em",
            color: "var(--lt-text-secondary)", maxWidth: 720,
          }}>
            Litree organizes journals into {CATALOG_STATS.groupCount} thematic groups that scope EBSCO retrieval to curated sources.
            Groups can overlap – the same journal may appear in multiple groups when it spans domains, and duplicates are resolved at query time so each article is only retrieved once.
          </p>

          <div style={{ marginTop: 24 }}>
            <SearchField value={search} onChange={setSearch} placeholder="Search all journals…" clearable />
            {search && (
              <div style={{
                marginTop: 10,
                font: "400 12.5px/1.5 var(--lt-font-sans)", color: "var(--lt-text-tertiary)",
              }}>
                {totalVisible === 0 ? (
                  <>No journals match <b style={{ color: "var(--lt-text-secondary)", fontWeight: 500 }}>"{search}"</b>.</>
                ) : (
                  <>Found <b style={{ color: "var(--lt-text-secondary)", fontWeight: 500 }}>{totalVisible.toLocaleString()}</b> journals across <b style={{ color: "var(--lt-text-secondary)", fontWeight: 500 }}>{visibleGroups.length}</b> groups.</>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Groups */}
        {visibleGroups.map((g, i) => (
          <JournalGroup
            key={g.id}
            group={g}
            knobs={knobs}
            highlight={search.trim()}
            first={i === 0}
          />
        ))}

        {visibleGroups.length === 0 && (
          <div style={{
            padding: "56px 0", textAlign: "center",
          }}>
            <div style={{
              font: "600 15px/1.3 var(--lt-font-sans)", color: "var(--lt-text-primary)",
              letterSpacing: "-0.01em", marginBottom: 6,
            }}>No matching journals</div>
            <div style={{ font: "400 13px/1.5 var(--lt-font-sans)", color: "var(--lt-text-tertiary)" }}>
              Try a different search term or clear the filter.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InlineStat_UNUSED({ value, label }) {
  // kept in case we want inline stats back; intentionally not rendered
  return null;
}

function TocItem({ label, count, active, onClick, dim }) {
  const [hover, setHover] = useStateDP(false);
  return (
    <button
      onClick={onClick}
      disabled={dim}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        width: "100%", textAlign: "left",
        background: active ? "var(--lt-accent-subtle)" : hover && !dim ? "var(--lt-bg-hover)" : "transparent",
        border: 0,
        cursor: dim ? "default" : "pointer",
        padding: "7px 10px",
        borderRadius: 6,
        display: "flex", alignItems: "center", gap: 8,
        font: `${active ? 500 : 400} 13px/1.4 var(--lt-font-sans)`,
        letterSpacing: "-0.01em",
        color: dim
          ? "var(--lt-text-disabled)"
          : active
            ? "var(--lt-accent)"
            : hover ? "var(--lt-text-primary)" : "var(--lt-text-secondary)",
        transition: "color 120ms ease, background-color 120ms ease",
      }}
    >
      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {label}
      </span>
      {count != null && (
        <span style={{
          font: "400 11px/1 var(--lt-font-sans)",
          color: dim ? "var(--lt-text-disabled)" : "var(--lt-text-tertiary)",
          fontVariantNumeric: "tabular-nums",
        }}>
          {count}
        </span>
      )}
    </button>
  );
}

function JournalGroup({ group, knobs, highlight, first }) {
  const cols = knobs.columns;
  const padY = knobs.density === "compact" ? 8 : 12;
  const fontSize = knobs.density === "compact" ? 12.5 : 13;

  return (
    <section
      data-section-id={group.id}
      style={{
        padding: first ? "44px 0 8px" : "52px 0 8px",
      }}
    >
      {/* Heading row */}
      <div style={{
        display: "flex", alignItems: "baseline", justifyContent: "space-between",
        gap: 16, marginBottom: 8,
      }}>
        <h3 style={{
          font: "600 18px/1.3 var(--lt-font-sans)", letterSpacing: "-0.02em",
          color: "var(--lt-text-primary)", margin: 0,
        }}>
          {group.name}
        </h3>
        <span style={{
          font: "500 12px/1 var(--lt-font-sans)", letterSpacing: "-0.005em",
          color: "var(--lt-text-tertiary)", flexShrink: 0,
          fontVariantNumeric: "tabular-nums",
        }}>
          {group.filtered.length.toLocaleString()}
          {group.filtered.length !== group.journals.length
            ? ` of ${group.journals.length.toLocaleString()} journals`
            : ` journals`}
        </span>
      </div>

      <p style={{
        font: "400 14px/1.6 var(--lt-font-sans)", letterSpacing: "-0.005em",
        color: "var(--lt-text-secondary)", margin: "0 0 20px", maxWidth: 780,
      }}>
        {group.description}
      </p>

      {/* Journal grid – no card, just a clean grid on the page */}
      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        columnGap: 32,
        rowGap: 0,
      }}>
        {group.filtered.map((name, i) => (
          <JournalRow
            key={name + i}
            name={name}
            padY={padY}
            fontSize={fontSize}
            showDivider={knobs.dividers}
            highlight={highlight}
          />
        ))}
      </div>
    </section>
  );
}

function JournalRow({ name, padY, fontSize, showDivider, highlight }) {
  return (
    <div
      style={{
        padding: `${padY}px 8px`,
        borderBottom: showDivider ? "1px solid var(--lt-border-subtle)" : "none",
        borderRadius: 4,
        background: "transparent",
        font: `400 ${fontSize}px/1.45 var(--lt-font-sans)`,
        letterSpacing: "-0.005em",
        color: "var(--lt-text-primary)",
        wordBreak: "normal",
        overflowWrap: "break-word",
        cursor: "default",
      }}
      title={name}
    >
      {highlight ? highlightText(name, highlight) : name}
    </div>
  );
}

function highlightText(text, q) {
  if (!q) return text;
  const lc = text.toLowerCase();
  const needle = q.toLowerCase();
  const idx = lc.indexOf(needle);
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{
        background: "var(--lt-accent-subtle)", color: "var(--lt-accent)",
        padding: "0 1px", borderRadius: 2,
      }}>{text.slice(idx, idx + needle.length)}</mark>
      {text.slice(idx + needle.length)}
    </>
  );
}

function SearchField({ value, onChange, placeholder = "Search…", clearable }) {
  const [focus, setFocus] = useStateDP(false);
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "0 12px", height: 38, maxWidth: 440,
      background: "var(--lt-bg-surface)",
      border: `1px solid ${focus ? "var(--lt-accent)" : "var(--lt-border-default)"}`,
      boxShadow: focus ? "var(--lt-focus-ring)" : "none",
      borderRadius: 8,
      transition: "border-color 120ms ease, box-shadow 120ms ease",
    }}>
      <Icon name="search" size={14} color="var(--lt-text-tertiary)" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        placeholder={placeholder}
        style={{
          border: 0, outline: 0, flex: 1, background: "transparent",
          font: "400 14px/1 var(--lt-font-sans)", letterSpacing: "-0.005em",
          color: "var(--lt-text-primary)",
        }}
      />
      {clearable && value && (
        <button
          onClick={() => onChange("")}
          style={{
            background: "transparent", border: 0, cursor: "pointer",
            padding: 2, borderRadius: 4, display: "inline-flex",
            color: "var(--lt-text-tertiary)",
          }}
          title="Clear"
        >
          <Icon name="x" size={14} color="currentColor" />
        </button>
      )}
    </div>
  );
}

/* ───────── EBSCO article ───────── */

function EbscoDoc({ article, setArticle }) {
  const scrollerRef = useRefDP(null);
  const [activeSection, setActiveSection] = useStateDP("overview");

  useEffectDP(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const onScroll = () => {
      const sections = scroller.querySelectorAll("[data-section-id]");
      const probeY = scroller.scrollTop + 140;
      let current = "overview";
      sections.forEach(s => {
        if (s.offsetTop <= probeY) current = s.getAttribute("data-section-id");
      });
      setActiveSection(current);
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => scroller.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const el = scroller.querySelector(`[data-section-id="${id}"]`);
    if (!el) return;
    scroller.scrollTo({ top: el.offsetTop - 28, behavior: "smooth" });
  };

  const sections = [
    { id: "overview",     label: "Overview" },
    { id: "defaults",     label: "Defaults and assumptions" },
    { id: "request",      label: "Request shape" },
    { id: "search",       label: "Search behavior" },
    { id: "pagination",   label: "Pagination and splitting" },
    { id: "curation",     label: "Record curation" },
    { id: "reliability",  label: "Reliability choices" },
    { id: "benefits",     label: "Benefits and tradeoffs" },
  ];

  return (
    <div ref={scrollerRef} style={{
      height: "100%", overflowY: "auto",
      display: "grid",
      gridTemplateColumns: "220px minmax(0, 1fr)",
      columnGap: 48,
      padding: "32px 48px 96px",
      alignItems: "start",
    }}>
      <DocsNav article={article} setArticle={setArticle}
               sections={sections} activeSection={activeSection} scrollTo={scrollTo} />

      <div style={{ display: "flex", flexDirection: "column", minWidth: 0, maxWidth: 760 }}>
        {/* Overview */}
        <section data-section-id="overview" style={{ paddingBottom: 8 }}>
          <h2 style={{
            font: "500 28px/1.22 var(--lt-font-serif, var(--lt-font-sans))", letterSpacing: "-0.012em",
            color: "var(--lt-text-ink, var(--lt-text-primary))", margin: 0,
          }}>
            EBSCO research pipeline
          </h2>
          <p style={{
            marginTop: 12,
            font: "400 15px/1.65 var(--lt-font-sans)", letterSpacing: "-0.005em",
            color: "var(--lt-text-secondary)", margin: "12px 0 0", maxWidth: 720,
          }}>
            Litree uses EBSCO as the primary article retrieval source. This page documents how the pipeline wraps the EBSCO API in a retrieval strategy that produces stable, reviewable, and deduplicated article sets for the rest of the application.
          </p>

          {/* Beta callout */}
          <div style={{
            marginTop: 20,
            padding: "14px 16px",
            borderLeft: "3px solid var(--lt-accent)",
            background: "var(--lt-accent-subtle)",
            borderRadius: "0 6px 6px 0",
          }}>
            <div style={{
              font: "600 13px/1.4 var(--lt-font-sans)", letterSpacing: "-0.005em",
              color: "var(--lt-accent)", marginBottom: 4,
            }}>
              Beta – actively evolving
            </div>
            <div style={{
              font: "400 13.5px/1.6 var(--lt-font-sans)", letterSpacing: "-0.005em",
              color: "var(--lt-text-secondary)",
            }}>
              This pipeline is under active development. Several defaults described below are working values that we are testing and tuning as we learn more about real-world retrieval patterns. Where a value is likely to change, we have called it out.
            </div>
          </div>

          <p style={{
            marginTop: 20,
            font: "400 15px/1.7 var(--lt-font-sans)", letterSpacing: "-0.005em",
            color: "var(--lt-text-secondary)", margin: "20px 0 0",
          }}>
            Litree does not treat the EBSCO API as a simple search endpoint. Our research pipeline wraps it in a retrieval strategy that aims to produce stable, reviewable, and deduplicated article sets for the rest of the application. The goal is to convert an approved boolean query into a bounded collection of journal articles that are ready for persistence, scoring, and later review.
          </p>

          {/* Three pillars */}
          <div style={{
            marginTop: 28,
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 16,
          }}>
            <Pillar
              title="Query-first retrieval"
              body="We send the accepted boolean query directly to EBSCO and then apply narrowing filters such as source type, journal, and date."
            />
            <Pillar
              title="Density-aware pagination"
              body="Dense result windows are detected and split into smaller date ranges so we can retrieve more of the relevant record set before hitting EBSCO retrieval ceilings."
            />
            <Pillar
              title="DOI-based curation"
              body="We keep records with normalized DOIs and skip DOI-less or duplicate records to make downstream processing more reliable."
            />
          </div>
        </section>

        {/* 1. Defaults */}
        <DocSection id="defaults" num="01" title="Defaults and assumptions"
          intro="The pipeline applies several defaults on behalf of the user so that a research run can be started with minimal configuration. These values are working defaults that we are actively testing – they may change as we iterate.">
          <DefinitionList items={[
            ["Date range", "When no date range is specified, the pipeline searches from 2000-01 through the current month. If an end date is provided that falls in the future, it is clamped to the current month. This range is a working default – we may adjust the lower bound as we learn which starting year best balances coverage with retrieval volume."],
            ["Journal groups", <>When no journal groups are selected, the pipeline uses all six configured groups: Economics Tier 1, Economics Tier 2, Data Science, Education, Finance, and Health. The full list of journals and their groupings is available on the <DocLink onClick={() => setArticle("journals")}>Journals</DocLink> page. Groups overlap by design – duplicates are resolved at query time so each journal title appears only once in the EBSCO request.</>],
            ["Source types", "Source types default to Academic Journals, Conference Materials, and Reports. This filter is applied as an EBSCO facet and currently cannot be changed from the UI."],
            ["Result target", "The user selects a result target of 500, 1000, or 1500. This controls how many curated records the pipeline will keep. It also determines the global page budget – the pipeline allocates roughly 3x the pages needed to fill that target (with a minimum of 30 pages) to account for records lost to deduplication and DOI filtering."],
          ]}/>
        </DocSection>

        {/* 2. Request shape */}
        <DocSection id="request" num="02" title="Request shape and pipeline inputs"
          intro="The Trigger task receives an already accepted query, optional journal groups, and a bounded result target. That is an important system assumption: query approval happens before this step. The research task is responsible for retrieval quality and boundedness, not query authoring.">
          <CodeBlock>{`research_pipeline({
  acceptedBooleanQuery,
  journalGroups,          // optional – defaults to all groups
  maxResults: 500 | 1000 | 1500,
  dateStart?,             // optional – defaults to "2000-01"
  dateEnd?                // optional – defaults to current month
})`}</CodeBlock>
          <DefinitionList items={[
            ["Inputs we rely on", "A non-empty boolean query, the project and user context, and a curated set of journal groups or journals. When journal groups are omitted, all six groups are used."],
            ["What happens next", "The pipeline runs EBSCO retrieval first, persists the research output, then uses the resulting candidate set for relevance scoring."],
          ]}/>
        </DocSection>

        {/* 3. Search behavior */}
        <DocSection id="search" num="03" title="How the EBSCO search request is constructed"
          intro="We pass the full boolean expression as a single EBSCO query term and rely on EBSCO to interpret the boolean logic inside that string. We then add narrowing controls around it using EBSCO's FacetFilters mechanism instead of embedding every constraint into the query text.">
          <CodeBlock>{`SearchCriteria: {
  Queries: [{ Term: acceptedBooleanQuery }],
  SearchMode: "all",
  Sort: "relevance",
  AutoSuggest: "n",
  AutoCorrect: "n",
  IncludeFacets: "y",
  FacetFilters: [
    { FacetValues: [{ Id: "SourceType", Value: "Academic Journals" }] },
    { FacetValues: journals.map(j => ({ Id: "Journal", Value: j })) }
  ],
  Limiters: [{ Id: "DT1", Values: ["dateStart/dateEnd"] }]
}

RetrievalCriteria: {
  View: "detailed",
  ResultsPerPage: 50,
  PageNumber,
  Highlight: "n",
  IncludeImageQuickView: "n"
}`}</CodeBlock>
          <DefinitionList items={[
            ["Boolean query handling", "Boolean logic is authored upstream and passed through unchanged. This keeps query semantics explicit and avoids a second layer of query rewriting inside the retrieval step."],
            ["Search mode", <>The default search mode is <Code>all</Code>, which reflects a stricter retrieval posture. Combined with curated journals, this helps us keep the candidate set narrower and more aligned with downstream review use cases.</>],
            ["Source and journal facet filters", "Journals and source types are applied as EBSCO FacetFilters rather than being embedded in the query string. Source types default to Academic Journals. Journals are resolved from the selected journal groups (or all groups when none are specified) and deduplicated before being sent as individual facet values."],
            ["Date limiter", <>The date range is passed to EBSCO using the <Code>DT1</Code> limiter in <Code>YYYY-MM</Code> format. This limiter is also used during window splitting – each sub-window sends its own narrowed date range. The <Code>DT1</Code> limiter does not accept day-level values in this workflow, which is why single-month windows cannot be split further.</>],
            ["Relevance-first sorting", "Results are requested with relevance sorting. This aligns the API ordering with the fact that we only keep a bounded number of records and want the highest-value candidates earlier in the retrieval process."],
          ]}/>
        </DocSection>

        {/* 4. Pagination */}
        <DocSection id="pagination" num="04" title="Pagination, retrieval ceilings, and date-window splitting"
          intro="Pagination is where most of the retrieval strategy lives. We do not assume that walking page 1, 2, 3, and so on will safely expose the full result set. Instead, we operate with two separate page budgets and split overly dense date windows when necessary.">
          <CodeBlock>{`full date range (e.g. 2000-01 → 2026-04)
  → fetch first window
  → detect dense / truncated window
  → binary split into two halves
  → process newer half first (recency-first)
  → repeat split if either half is still dense
  → stop at maxResults or global page budget`}</CodeBlock>
          <DefinitionList items={[
            ["Per-window ceiling (6 pages)", "EBSCO enforces a max-start-request-number of 251. At 50 results per page, that gives us 6 safe pages (up to 300 records) per date window before a request risks asking for records beyond the supported start range. When a window has more hits than this ceiling allows, the window is flagged as dense and queued for splitting."],
            ["Global page budget", "Separately from the per-window ceiling, the pipeline maintains a global page budget calculated as roughly 3x the pages needed to fill the result target, with a minimum of 30 pages. For a 500 result target that means 30 pages; for 1000 it means 60. This over-allocation accounts for records lost to DOI filtering and deduplication. The pipeline stops fetching when either the result target or the global page budget is reached. These multipliers are working values we are still tuning."],
            ["Dense-window detection", "A window is treated as dense through two paths. First, EBSCO may return error 138 (max-start exceeded) directly when a page request falls beyond the ceiling – this is an immediate signal. Second, after fetching all safe pages for a window, the pipeline checks whether the total hits reported by EBSCO exceed what the per-window ceiling can traverse. If so, the window is flagged as dense even though no error occurred."],
            ["Binary splitting strategy", "When a date window is dense, the pipeline splits it in half by month count – not into individual months. For example, a window spanning 24 months becomes two 12-month windows. If either half is still dense, it is split again. The newer half is always processed first (recency-first ordering) so that when the global result budget runs out, the most recent records have already been captured."],
            ["Single-month limitation", <>When binary splitting reduces a window down to a single month that is still too dense, the pipeline cannot split further. The EDS <Code>DT1</Code> limiter does not accept day-level granularity in this workflow. In these cases the pipeline keeps the partial retrieval (up to 300 records from that month) and records the truncation in the artifact summary. This is a known limitation we are tracking.</>],
          ]}/>
        </DocSection>

        {/* 5. Curation */}
        <DocSection id="curation" num="05" title="Record curation after retrieval"
          intro="After pages are fetched, Litree applies a second layer of quality control. This is not just about collecting records. It is about shaping a candidate set that behaves well during persistence, deduplication, abstract analysis, and later review.">
          <DefinitionList items={[
            ["DOI requirement", "Records without a DOI are discarded. The DOI is treated as the most reliable stable identifier for cross-page deduplication and later article handling."],
            ["Multi-path DOI extraction", <>EBSCO records store DOIs in different locations depending on the record source. The pipeline searches three paths: direct record-level fields, the record header, and the nested <Code>BibRecord.BibEntity.Identifiers</Code> array. This multi-path approach reduces the number of records incorrectly discarded as DOI-less.</>],
            ["DOI normalization", <>DOI values are normalized by stripping URL prefixes (<Code>doi.org/</Code>, <Code>dx.doi.org/</Code>), the <Code>doi:</Code> scheme prefix, and any trailing query or fragment parameters, then lowercasing before deduplication.</>],
            ["Duplicate removal", "Duplicate records are skipped using the normalized DOI as the key. This matters because overlapping date windows and journal retrieval patterns can surface the same article more than once."],
            ["Detailed retrieval view", "We request the detailed view from EBSCO so the pipeline has enough metadata to extract stable identifiers and support later processing steps."],
          ]}/>
        </DocSection>

        {/* 6. Reliability */}
        <DocSection id="reliability" num="06" title="Reliability and operational choices"
          intro="The wrapper also handles the operational realities of the EBSCO API. Authentication, session creation, retries, and cleanup are part of the retrieval strategy because the pipeline is long-running and must behave predictably under transient failures.">
          <DefinitionList items={[
            ["Session lifecycle", "We authenticate, create a session tied to the configured EBSCO profile, and explicitly end the session in a final cleanup step. Session cleanup runs even if the retrieval itself fails, so we avoid leaving orphaned sessions on the EBSCO side."],
            ["Error-specific retry behavior", "The pipeline distinguishes between three categories of EBSCO error. Auth expiration (error 104) triggers a full re-authentication and new session before retrying. Session invalidation (error 108) creates a new session without re-authenticating. Transient server errors (429, 5xx) are retried with exponential backoff starting at 250ms, up to 4 attempts. Error 138 (max-start exceeded) is never retried – it signals a dense window and triggers the splitting strategy instead."],
            ["Request timeouts", "Each individual EBSCO API request has a 30-second timeout. This applies to authentication, session creation, search, and retrieve calls. The timeout is a per-request value – a full research run with many pages and windows can take considerably longer end-to-end."],
            ["Artifact and summary visibility", "The run captures page summaries, retrieval statistics, split counts, duplicate counts, DOI discard counts, and retrieval-limit signals so the team can understand why a given result set looks the way it does. This artifact is the primary tool we use to diagnose retrieval quality during beta testing."],
          ]}/>
        </DocSection>

        {/* 7. Benefits */}
        <DocSection id="benefits" num="07" title="Benefits and tradeoffs">
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 28,
            marginTop: 4,
          }}>
            <BulletColumn
              label="Main benefits"
              items={[
                "Curated journal filtering keeps the candidate set aligned with the project's research domain.",
                "Relevance sorting helps bounded retrieval favor stronger matches earlier.",
                "Binary date-window splitting reduces loss when large ranges exceed EBSCO's per-window pagination limit of 300 records.",
                "Multi-path DOI extraction and normalization produce a cleaner and more stable set for persistence and review scoring.",
                "Error-specific retry and session handling make long-running research jobs more robust in production.",
              ]}
            />
            <BulletColumn
              label="Tradeoffs and open questions"
              items={[
                "Relevant records without DOIs are excluded by design. We are tracking how many records this affects in practice.",
                "Very dense single-month windows can still end in partial retrieval because day-level splitting is not available through the EDS DT1 limiter.",
                "The default date floor of 2000-01 may need adjustment per research domain – some fields have significant literature predating this.",
                "The 3x page budget multiplier and minimum of 30 pages are working values. We are monitoring whether these consistently produce enough headroom.",
                "The API query is assumed to be valid and approved before it reaches this task.",
                "This is an optimized retrieval strategy, not an exhaustive archival export of every EBSCO hit.",
              ]}
            />
          </div>
        </DocSection>
      </div>
    </div>
  );
}

/* ───────── EBSCO helpers ───────── */

function DocSection({ id, num, title, intro, children }) {
  return (
    <section data-section-id={id} style={{ padding: "40px 0 8px" }}>
      <h3 style={{
        font: "600 20px/1.3 var(--lt-font-sans)", letterSpacing: "-0.02em",
        color: "var(--lt-text-primary)", margin: "0 0 12px",
      }}>
        {num && <span style={{ color: "var(--lt-text-tertiary)", fontWeight: 500, marginRight: 10 }}>{num}</span>}
        {title}
      </h3>
      {intro && (
        <p style={{
          font: "400 14.5px/1.65 var(--lt-font-sans)", letterSpacing: "-0.005em",
          color: "var(--lt-text-secondary)", margin: "0 0 20px",
        }}>
          {intro}
        </p>
      )}
      {children}
    </section>
  );
}

function DefinitionList({ items }) {
  return (
    <dl style={{ margin: 0, display: "flex", flexDirection: "column", gap: 18 }}>
      {items.map(([term, def], i) => (
        <div key={i}>
          <dt style={{
            font: "600 13.5px/1.4 var(--lt-font-sans)", letterSpacing: "-0.01em",
            color: "var(--lt-text-primary)", marginBottom: 4,
          }}>{term}</dt>
          <dd style={{
            margin: 0,
            font: "400 14px/1.6 var(--lt-font-sans)", letterSpacing: "-0.005em",
            color: "var(--lt-text-secondary)",
          }}>{def}</dd>
        </div>
      ))}
    </dl>
  );
}

function BulletColumn({ label, items }) {
  return (
    <div>
      <div style={{
        font: "600 13px/1.4 var(--lt-font-sans)", letterSpacing: "-0.01em",
        color: "var(--lt-text-primary)", marginBottom: 10,
      }}>{label}</div>
      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((t, i) => (
          <li key={i} style={{
            paddingLeft: 16, position: "relative",
            font: "400 13.5px/1.55 var(--lt-font-sans)", letterSpacing: "-0.005em",
            color: "var(--lt-text-secondary)",
          }}>
            <span aria-hidden="true" style={{
              position: "absolute", left: 2, top: 9,
              width: 4, height: 4, borderRadius: "50%",
              background: "var(--lt-text-tertiary)",
            }} />
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Pillar({ title, body }) {
  return (
    <div style={{
      padding: "16px 18px",
      background: "var(--lt-bg-stone, var(--lt-bg-primary))",
      border: "1px solid var(--lt-border-subtle)",
      borderRadius: 10,
    }}>
      <div style={{
        font: "600 13.5px/1.4 var(--lt-font-sans)", letterSpacing: "-0.01em",
        color: "var(--lt-text-primary)", marginBottom: 6,
      }}>{title}</div>
      <div style={{
        font: "400 13px/1.55 var(--lt-font-sans)", letterSpacing: "-0.005em",
        color: "var(--lt-text-secondary)",
      }}>{body}</div>
    </div>
  );
}

function CodeBlock({ children }) {
  return (
    <pre style={{
      margin: "0 0 20px",
      padding: "14px 16px",
      background: "var(--lt-bg-stone, #F5F3EF)",
      border: "1px solid var(--lt-border-subtle)",
      borderRadius: 8,
      overflow: "auto",
      font: "400 12.5px/1.6 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
      color: "var(--lt-text-primary)",
      whiteSpace: "pre",
    }}>
      <code>{children}</code>
    </pre>
  );
}

function Code({ children }) {
  return (
    <code style={{
      padding: "1px 5px",
      borderRadius: 4,
      background: "var(--lt-bg-stone, #F5F3EF)",
      border: "1px solid var(--lt-border-subtle)",
      font: "400 0.92em/1 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
      color: "var(--lt-text-primary)",
    }}>{children}</code>
  );
}

function DocLink({ onClick, children }) {
  return (
    <button onClick={onClick} style={{
      background: "transparent", border: 0, padding: 0, cursor: "pointer",
      color: "var(--lt-accent)", font: "inherit",
      textDecoration: "underline", textUnderlineOffset: 2,
    }}>{children}</button>
  );
}

Object.assign(window, { DocsPage });
