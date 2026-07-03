// ResearchQuestionPage.jsx — two-step wizard for starting a new project.
//
//   Step 1 — Ask:     enter the research question (free text + examples)
//   Step 2 — Refine:  one screen, two views of the same query (Terms / Boolean)
//                     with grouped synonyms and a live result-count preview.
//
// "Boolean" is a *view*, not a step. The previous 3-step split (ask / review /
// boolean) was retired because Review and Boolean are the same query rendered
// two different ways — splitting them as sequential steps was theatre.

const { useState: useStateRQ, useEffect: useEffectRQ, useMemo: useMemoRQ, useRef: useRefRQ } = React;

const DEMO_QUESTION = "How does rising economic inequality affect intergenerational mobility and social cohesion in developing nations?";

/* Term model: grouped by semantic concept. Each group is a single AND-clause
   whose contents are OR'd together. Order of groups = order of clauses. */
const DEMO_GROUPS = [
  { id: "g1", name: "Topic",   terms: ["economic inequality", "income inequality"] },
  { id: "g2", name: "Outcome", terms: ["intergenerational mobility", "social mobility", "social cohesion"] },
  { id: "g3", name: "Scope",   terms: ["developing nations", "developing countries"] },
];

const EXAMPLE_QUESTIONS = [
  "How does microfinance affect women's labor force participation in South Asia?",
  "What are the cognitive effects of social media use in adolescents (2015–2025)?",
  "Carbon pricing impact on industrial emissions in OECD countries",
];

/* Sample papers shown below the result count to make Refine concrete. In the
   real product these come from a lightweight EBSCO sample call. */

function ResearchQuestionPage({ knobs }) {
  /* Knob step values: "ask" | "refine" (legacy "review"/"boolean" map to refine) */
  const initialStep = (knobs.step === "ask") ? "ask" : "refine";

  const [step, setStep] = useStateRQ(initialStep);
  const [question, setQuestion] = useStateRQ("");
  const [groups, setGroups] = useStateRQ(DEMO_GROUPS);
  const [boolText, setBoolText] = useStateRQ(null); // null = derive from groups
  const [running, setRunning] = useStateRQ(null); // null | { count }
  const refineQuestion = question.trim() || DEMO_QUESTION;

  useEffectRQ(() => {
    if (!knobs.step) return;
    setStep(knobs.step === "ask" ? "ask" : "refine");
  }, [knobs.step]);

  return (
    <main style={{
      flex: 1, minWidth: 0, height: "100%",
      overflowY: "auto", background: "var(--lt-bg-primary)",
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "40px 24px",
    }}>
      <div style={{
        width: "100%",
        maxWidth: step === "refine" ? 600 : 480,
        margin: "auto 0",
        display: "flex", flexDirection: "column", gap: 28,
      }}>
        <StepIndicator step={step} />

        <header style={{
          display: "flex", flexDirection: "column", gap: 8,
          textAlign: "center", alignItems: "center",
        }}>
          <h1 style={{
            font: "600 28px/1.1 var(--lt-font-sans)",
            letterSpacing: "-0.045em", color: "var(--lt-text-ink)", margin: 0,
          }}>
            {step === "ask" ? "Start your new project" : "Refine your search"}
          </h1>
          <p style={{
            font: "var(--lt-body-lg)", color: "var(--lt-text-secondary)",
            letterSpacing: "-0.010em", margin: 0,
          }}>
            {step === "ask"
              ? "Enter your research question to discover relevant papers."
              : "Adjust synonyms or fall back to boolean – we'll search EBSCO with this."}
          </p>
        </header>

        {step === "ask" ? (
          <AskStep
            question={question}
            setQuestion={setQuestion}
            onNext={() => setStep("refine")}
          />
        ) : (
          <RefineStep
            question={refineQuestion}
            groups={groups}
            setGroups={setGroups}
            boolText={boolText}
            setBoolText={setBoolText}
            onBack={() => setStep("ask")}
            onRun={() => { window.location.href = "Project Workspace.html?new=1"; }}
          />
        )}
      </div>
    </main>
  );
}

/* ── Searching transition ───────────────────────────────────────────────── */
/* Bridges the wizard to the project workspace. Steps check off in sequence,
   then we navigate to Project Workspace.html so the loop is closed. */
function SearchingState({ question, count }) {
  const STEPS = [
    "Parsing your question",
    "Searching EBSCO databases",
    "Ranking " + (count ? "≈ " + count.toLocaleString() + " results" : "results") + " by relevance",
    "Building your project workspace",
  ];
  const [done, setDone] = useStateRQ(0);

  useEffectRQ(() => {
    if (done >= STEPS.length) {
      const t = setTimeout(() => { window.location.href = "Project Workspace.html?new=1"; }, 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setDone(d => d + 1), done === 0 ? 500 : 750);
    return () => clearTimeout(t);
  }, [done]);

  return (
    <main style={{
      flex: 1, minWidth: 0, height: "100%",
      overflowY: "auto", background: "var(--lt-bg-primary)",
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "40px 24px",
    }}>
      <div style={{
        width: "100%", maxWidth: 460, margin: "auto 0",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 24,
      }}>
        <span className="lt-spinner" style={{ width: 22, height: 22, borderWidth: 2 }} />

        <header style={{ display: "flex", flexDirection: "column", gap: 8, textAlign: "center", alignItems: "center" }}>
          <h1 style={{
            font: "600 22px/1.2 var(--lt-font-sans)",
            letterSpacing: "-0.035em", color: "var(--lt-text-ink)", margin: 0,
          }}>Searching for papers</h1>
          <p style={{
            font: "var(--lt-body)", color: "var(--lt-text-secondary)",
            letterSpacing: "-0.010em", margin: 0, maxWidth: 380,
          }}>{question}</p>
        </header>

        <div style={{
          width: "100%",
          border: "1px solid var(--lt-border-default)",
          borderRadius: 12, background: "var(--lt-bg-surface)",
          padding: "8px 4px",
          display: "flex", flexDirection: "column",
        }}>
          {STEPS.map((label, i) => {
            const state = i < done ? "done" : i === done ? "active" : "pending";
            return (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 14px",
              }}>
                <span style={{
                  flex: "0 0 auto", width: 18, height: 18,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                }}>
                  {state === "done" ? (
                    <span style={{
                      width: 18, height: 18, borderRadius: 999,
                      background: "var(--lt-accent)", color: "var(--lt-bg-surface)",
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Icon name="check" size={11} color="currentColor" />
                    </span>
                  ) : state === "active" ? (
                    <span className="lt-spinner" />
                  ) : (
                    <span style={{
                      width: 8, height: 8, borderRadius: 999,
                      background: "var(--lt-bg-active)",
                    }} />
                  )}
                </span>
                <span style={{
                  font: "500 13px/1.3 var(--lt-font-sans)", letterSpacing: "-0.010em",
                  color: state === "pending" ? "var(--lt-text-tertiary)" : "var(--lt-text-primary)",
                  transition: "color 200ms var(--lt-ease-out)",
                }}>{label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}

/* ── Step indicator ─────────────────────────────────────────────────────── */
function StepIndicator({ step }) {
  const idx = step === "ask" ? 0 : 1;
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
      font: "500 11px/1 var(--lt-font-sans)",
      letterSpacing: "0.06em", textTransform: "uppercase",
      color: "var(--lt-text-tertiary)",
    }}>
      <span>Step {idx + 1} of 2</span>
      <span style={{ display: "inline-flex", gap: 4 }}>
        {[0, 1].map(i => (
          <span key={i} style={{
            width: i === idx ? 18 : 6, height: 6, borderRadius: 999,
            background: i <= idx ? "var(--lt-accent)" : "var(--lt-bg-active)",
            transition: "width 220ms var(--lt-ease-out), background 220ms var(--lt-ease-out)",
          }} />
        ))}
      </span>
    </div>
  );
}

/* ── Step 1: Ask ────────────────────────────────────────────────────────── */
function AskStep({ question, setQuestion, onNext }) {
  const [focus, setFocus] = useStateRQ(false);
  const isEmpty = !question.trim();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, alignItems: "center" }}>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
        <label htmlFor="rq-input" style={{
          font: "500 13px/1 var(--lt-font-sans)",
          letterSpacing: "-0.010em", color: "var(--lt-text-secondary)",
        }}>Research question</label>

        <div style={{
          borderRadius: 10,
          background: "var(--lt-bg-surface)",
          border: "1px solid var(--lt-border-input)",
          boxShadow: focus ? "var(--lt-focus-ring)" : "none",
          transition: "var(--lt-transition-colors)",
        }}>
          <textarea
            id="rq-input"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
            placeholder="e.g. What is the relationship between income inequality and economic growth?"
            style={{
              width: "100%", boxSizing: "border-box",
              border: 0, outline: "none", background: "transparent", resize: "vertical",
              padding: 20,
              font: "var(--lt-body)", letterSpacing: "-0.010em",
              color: "var(--lt-text-primary)", minHeight: 160,
            }}
          />
        </div>

      </div>

      {isEmpty && (
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{
            font: "500 10.5px/1 var(--lt-font-sans)",
            letterSpacing: "0.10em", textTransform: "uppercase",
            color: "var(--lt-text-tertiary)",
          }}>Or start from an example</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {EXAMPLE_QUESTIONS.map((q, i) => (
              <ExampleStarter key={i} text={q} onPick={setQuestion} />
            ))}
          </div>
        </div>
      )}

      <Button
        variant="primary" rightIcon="arrow-right"
        onClick={onNext} disabled={isEmpty}
      >Suggest search terms</Button>
    </div>
  );
}

function ExampleStarter({ text, onPick }) {
  const [hover, setHover] = useStateRQ(false);
  return (
    <button
      onClick={() => onPick(text)}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        textAlign: "left",
        background: hover ? "var(--lt-bg-active)" : "var(--lt-bg-stone)",
        border: "1px solid var(--lt-border-subtle)",
        borderRadius: 8, padding: "10px 12px", cursor: "pointer",
        display: "flex", alignItems: "flex-start", gap: 10,
        font: "var(--lt-body-sm)", letterSpacing: "-0.010em",
        color: "var(--lt-text-primary)",
        transition: "var(--lt-transition-colors)",
      }}>
      <span style={{
        flex: "0 0 auto", marginTop: 1,
        color: hover ? "var(--lt-accent)" : "var(--lt-text-tertiary)",
        transition: "color 120ms ease", display: "inline-flex",
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </span>
      <span style={{ flex: 1 }}>{text}</span>
    </button>
  );
}

/* ── Step 2: Refine ─────────────────────────────────────────────────────── */
function RefineStep({ question, groups, setGroups, boolText, setBoolText, onBack, onRun }) {
  /* Derived boolean from groups (used when user hasn't manually overridden) */
  const derivedBool = useMemoRQ(() => groupsToBoolean(groups), [groups]);
  const currentBool = boolText ?? derivedBool;

  /* Fake result count — scales mildly with term count for "live" feel */
  const termCount = groups.reduce((n, g) => n + g.terms.length, 0);
  const resultCount = Math.max(80, Math.round(2400 * Math.pow(0.94, termCount - 7)));
  const formattedCount = resultCount.toLocaleString();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Read-only question with edit affordance */}
      <div style={{
        display: "flex", alignItems: "flex-start", gap: 12,
        padding: "14px 16px",
        background: "var(--lt-bg-stone)",
        borderRadius: 10,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            font: "500 11px/1 var(--lt-font-sans)",
            letterSpacing: "0.10em", textTransform: "uppercase",
            color: "var(--lt-text-tertiary)", marginBottom: 6,
          }}>Your question</div>
          <div style={{
            font: "var(--lt-body)", letterSpacing: "-0.010em",
            color: "var(--lt-text-primary)",
          }}>{question}</div>
        </div>
        <button onClick={onBack}
          aria-label="Edit research question"
          style={{
            flex: "0 0 auto", marginTop: 16,
            display: "inline-flex", alignItems: "center", gap: 4,
            background: "transparent", border: 0, padding: "4px 6px",
            cursor: "pointer", borderRadius: 6,
            font: "500 12px/1 var(--lt-font-sans)",
            letterSpacing: "-0.010em", color: "var(--lt-accent)",
          }}>
          <Icon name="pencil-line" size={12} color="currentColor" />
          Edit
        </button>
      </div>

      {/* Section header with regenerate */}
      <div style={{
        display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        gap: 12,
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <div style={{
            font: "500 14px/1.2 var(--lt-font-sans)",
            letterSpacing: "-0.015em",
            color: "var(--lt-text-primary)",
          }}>Search terms</div>
          <div style={{
            font: "var(--lt-body-sm)", color: "var(--lt-text-tertiary)",
            letterSpacing: "-0.005em",
          }}>Keywords we'll search for — add synonyms to find more, remove to narrow.</div>
        </div>
        <RegenerateButton onClick={() => { setGroups(DEMO_GROUPS); setBoolText(null); }} />
      </div>

      <GroupedTerms groups={groups} setGroups={setGroups} onEdited={() => setBoolText(null)} />

      <BooleanDisclosure
        value={currentBool}
        derived={derivedBool}
        onChange={setBoolText}
        onReset={() => setBoolText(null)}
      />

      {/* Footer: result count + run */}
      <ResultCount count={resultCount} />

      <div style={{
        display: "flex", alignItems: "center", justifyContent: "flex-end",
        gap: 12, paddingTop: 4,
      }}>
        <button onClick={onBack}
          style={{
            background: "transparent", border: 0, cursor: "pointer", padding: "0 4px",
            font: "500 14px/1 var(--lt-font-sans)",
            letterSpacing: "-0.010em", color: "var(--lt-text-secondary)",
          }}>Back</button>
        <Button variant="primary" rightIcon="arrow-right" onClick={() => onRun(resultCount)}>Run search</Button>
      </div>
    </div>
  );
}

/* Build a boolean from groups: (a OR b) AND (c OR d) AND (e). */
function groupsToBoolean(groups) {
  const clauses = groups
    .filter(g => g.terms.length > 0)
    .map(g => {
      const quoted = g.terms.map(t => /\s/.test(t) ? `"${t}"` : t);
      return quoted.length === 1 ? quoted[0] : `(${quoted.join(" OR ")})`;
    });
  return clauses.join(" AND ");
}

/* Two sibling strategies derived from the same groups, for the optional
   multi-strategy search. Precise = primary term of each group only (tightest
   recall, highest precision). Broad = all terms plus truncation wildcards on
   single words (widest recall). Balanced is groupsToBoolean (the default). */
function preciseFromGroups(groups) {
  const clauses = groups
    .filter(g => g.terms.length > 0)
    .map(g => { const t = g.terms[0]; return /\s/.test(t) ? `"${t}"` : t; });
  return clauses.join(" AND ");
}
function broadFromGroups(groups) {
  // Broaden via truncation: trim the trailing word of each term to a stem + "*"
  // so "economic inequality" → "economic inequal*". Real librarian technique,
  // and visibly distinct from the balanced (quoted) variant.
  const trunc = (t) => {
    const parts = t.split(/\s+/);
    const last = parts[parts.length - 1];
    if (last.length <= 4) return t;
    parts[parts.length - 1] = last.slice(0, Math.max(4, last.length - 2)) + "*";
    return parts.join(" ");
  };
  const clauses = groups
    .filter(g => g.terms.length > 0)
    .map(g => {
      const expanded = g.terms.map(trunc);
      return expanded.length === 1 ? expanded[0] : `(${expanded.join(" OR ")})`;
    });
  return clauses.join(" AND ");
}

/* ── Result count + advisory ──────────────────────────────────────────────── */
function assessCount(n) {
  if (n < 200)  return { label: "Very narrow",  hint: "consider broadening with more synonyms", color: "var(--lt-warn, #b25c2a)" };
  if (n > 3000) return { label: "Very broad",   hint: "consider narrowing scope or adding constraints", color: "var(--lt-warn, #b25c2a)" };
  return            { label: "Good range",   hint: "focused enough to review, broad enough to find evidence", color: "var(--lt-text-tertiary)" };
}

function ResultCount({ count }) {
  const a = assessCount(count);
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 12,
      padding: "16px 16px",
      borderTop: "1px solid var(--lt-border-subtle)",
      borderBottom: "1px solid var(--lt-border-subtle)",
    }}>
      <div style={{ flex: "0 0 auto", marginTop: 2, color: "var(--lt-text-tertiary)", display: "inline-flex" }}>
        <Icon name="files" size={16} color="currentColor" />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
          <span style={{
            font: "600 18px/1 var(--lt-font-sans)",
            letterSpacing: "-0.020em", color: "var(--lt-text-primary)",
          }}>≈ {count.toLocaleString()}</span>
          <span style={{
            font: "var(--lt-body-sm)", color: "var(--lt-text-tertiary)",
            letterSpacing: "-0.010em",
          }}>papers in EBSCO</span>
          <span style={{
            font: "500 11px/1 var(--lt-font-sans)",
            letterSpacing: "0.04em", textTransform: "uppercase",
            color: a.color, marginLeft: "auto",
          }}>{a.label}</span>
        </div>
        <div style={{
          font: "var(--lt-body-sm)", color: "var(--lt-text-tertiary)",
          letterSpacing: "-0.010em",
        }}>{a.hint}</div>
      </div>
    </div>
  );
}

function RegenerateButton({ onClick }) {
  const [hover, setHover] = useStateRQ(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        background: "transparent",
        border: "1px solid var(--lt-border-default)",
        borderRadius: 6, padding: "5px 10px",
        cursor: "pointer",
        font: "500 12px/1 var(--lt-font-sans)",
        letterSpacing: "-0.010em",
        color: hover ? "var(--lt-text-primary)" : "var(--lt-text-secondary)",
        transition: "var(--lt-transition-colors)",
      }}>
      <Icon name="refresh-cw" size={12} color="currentColor" />
      Regenerate
    </button>
  );
}

/* ── Grouped term chips view ────────────────────────────────────────────── */
/* Concept groups are model-generated and read-only: user can only add/remove
   synonyms inside an existing group. Keeps the backend contract simple — flat
   OR-clauses joined by AND — and avoids exposing phantom power. */
function GroupedTerms({ groups, setGroups, onEdited }) {
  const updateGroup = (id, patch) => {
    setGroups(groups.map(g => g.id === id ? { ...g, ...patch } : g));
    onEdited();
  };
  const removeTerm = (gid, i) => updateGroup(gid, {
    terms: groups.find(g => g.id === gid).terms.filter((_, j) => j !== i),
  });
  const addTerm = (gid, t) => updateGroup(gid, {
    terms: [...groups.find(g => g.id === gid).terms, t],
  });
  const regenerateGroup = (gid) => {
    const orig = DEMO_GROUPS.find(g => g.id === gid);
    if (orig) updateGroup(gid, { terms: [...orig.terms] });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {groups.map((g, i) => (
        <React.Fragment key={g.id}>
          {i > 0 && <AndDivider />}
          <ConceptGroup
            group={g}
            onRemoveTerm={(idx) => removeTerm(g.id, idx)}
            onAddTerm={(t) => addTerm(g.id, t)}
            onRegenerate={() => regenerateGroup(g.id)}
          />
        </React.Fragment>
      ))}
    </div>
  );
}

function AndDivider() {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "0 2px",
    }}>
      <span style={{ flex: 1, height: 1, background: "var(--lt-border-subtle)" }} />
      <span style={{
        font: "500 10px/1 var(--lt-font-sans)",
        letterSpacing: "0.08em", textTransform: "uppercase",
        color: "var(--lt-text-tertiary)",
      }}>and</span>
      <span style={{ flex: 1, height: 1, background: "var(--lt-border-subtle)" }} />
    </div>
  );
}

function ConceptGroup({ group, onRemoveTerm, onAddTerm, onRegenerate }) {
  const [adding, setAdding] = useStateRQ(false);
  const [draft, setDraft] = useStateRQ("");
  const inputRef = useRefRQ(null);
  useEffectRQ(() => { if (adding && inputRef.current) inputRef.current.focus(); }, [adding]);

  const commit = () => {
    const t = draft.trim();
    if (t) onAddTerm(t);
    setDraft("");
    setAdding(false);
  };

  const isEmpty = group.terms.length === 0;

  return (
    <div style={{
      border: "1px solid var(--lt-border-default)",
      borderRadius: 10, padding: "12px 14px",
      background: isEmpty ? "var(--lt-bg-stone)" : "var(--lt-bg-surface)",
      opacity: isEmpty ? 0.75 : 1,
      display: "flex", flexDirection: "column", gap: 10,
      transition: "opacity 160ms ease, background 160ms ease",
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
      }}>
        <span style={{
          font: "500 11px/1 var(--lt-font-sans)",
          letterSpacing: "0.10em", textTransform: "uppercase",
          color: "var(--lt-text-tertiary)",
        }}>{group.name}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            font: "var(--lt-body-sm)",
            color: isEmpty ? "var(--lt-warn, #b25c2a)" : "var(--lt-text-tertiary)",
            letterSpacing: "-0.010em",
          }}>{
            isEmpty
              ? "Won't be used in search"
              : group.terms.length === 1 ? "1 synonym" : group.terms.length + " synonyms"
          }</span>
          <GroupRegenButton onClick={onRegenerate} />
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {group.terms.map((t, i) => (
          <TermChip key={i} term={t} onRemove={() => onRemoveTerm(i)} />
        ))}
        {adding ? (
          <input
            ref={inputRef} value={draft}
            onChange={e => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={e => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") { setDraft(""); setAdding(false); }
            }}
            placeholder="add synonym"
            style={{
              height: 26, padding: "0 10px",
              border: "1px solid var(--lt-border-input)",
              background: "var(--lt-bg-surface)",
              borderRadius: 9999, outline: "none",
              font: "var(--lt-body-sm)", letterSpacing: "-0.010em",
              color: "var(--lt-text-primary)", width: 140,
            }}
          />
        ) : (
          <button onClick={() => setAdding(true)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              height: 26, padding: "0 10px",
              border: "1px dashed var(--lt-border-input)",
              background: "transparent", borderRadius: 9999, cursor: "pointer",
              font: "500 11px/1 var(--lt-font-sans)",
              letterSpacing: "-0.010em", color: "var(--lt-text-tertiary)",
              transition: "var(--lt-transition-colors)",
            }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add
          </button>
        )}
      </div>
    </div>
  );
}

function GroupRegenButton({ onClick }) {
  const [hover, setHover] = useStateRQ(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      aria-label="Regenerate this concept"
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: 22, height: 22, borderRadius: 6,
        background: hover ? "var(--lt-bg-hover)" : "transparent",
        border: 0, padding: 0, cursor: "pointer",
        color: hover ? "var(--lt-text-secondary)" : "var(--lt-text-tertiary)",
        transition: "var(--lt-transition-colors)",
      }}>
      <Icon name="refresh-cw" size={12} color="currentColor" />
    </button>
  );
}

function TermChip({ term, onRemove }) {
  const [hover, setHover] = useStateRQ(false);
  return (
    <span
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        height: 26, padding: "0 4px 0 10px",
        background: "var(--lt-bg-stone)", color: "var(--lt-text-primary)",
        borderRadius: 9999,
        font: "500 12px/1 var(--lt-font-sans)", letterSpacing: "-0.010em",
        transition: "background var(--lt-dur-fast) var(--lt-ease-out)",
      }}>
      {term}
      <button onClick={onRemove}
        aria-label={"Remove " + term}
        style={{
          width: 16, height: 16, display: "inline-flex",
          alignItems: "center", justifyContent: "center",
          background: hover ? "var(--lt-bg-hover)" : "transparent",
          border: 0, borderRadius: 9999, cursor: "pointer",
          color: "var(--lt-text-tertiary)",
          transition: "background var(--lt-dur-fast) var(--lt-ease-out)",
        }}>
        <Icon name="x" size={10} color="currentColor" />
      </button>
    </span>
  );
}

/* ── Boolean disclosure ─────────────────────────────────────────────────── */
/* Power-user affordance: collapsed by default, expands to a syntax-highlighted
   textarea showing the same query as the chips above. Edits override the derived
   form until "Revert to suggested" is clicked. */
function BooleanDisclosure({ value, derived, onChange, onReset }) {
  const [open, setOpen] = useStateRQ(false);
  const isDirty = value !== derived;
  return (
    <div style={{
      borderTop: "1px solid var(--lt-border-subtle)",
      paddingTop: 14,
    }}>
      <button onClick={() => setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          width: "100%",
          background: "transparent", border: 0, padding: 0, cursor: "pointer",
          font: "500 12px/1 var(--lt-font-sans)",
          letterSpacing: "-0.010em", color: "var(--lt-text-secondary)",
          textAlign: "left",
        }}>
        <span style={{
          flex: "0 0 auto",
          display: "inline-flex",
          transform: open ? "rotate(0deg)" : "rotate(-90deg)",
          transition: "transform 160ms var(--lt-ease-out)",
        }}>
          <Icon name="chevron-down" size={14} color="currentColor" />
        </span>
        <span style={{ flex: "0 0 auto" }}>View as boolean query</span>
        {isDirty && (
          <span style={{
            flex: "0 0 auto",
            display: "inline-block", width: 6, height: 6, borderRadius: 999,
            background: "var(--lt-accent)",
          }} />
        )}
        {!open && (
          <span style={{
            flex: 1, minWidth: 0,
            font: "12px/1.4 ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace",
            letterSpacing: 0,
            color: "var(--lt-text-tertiary)",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }} title={value}>{value}</span>
        )}
      </button>
      {open && <BooleanEditor value={value} onChange={onChange} derived={derived} onReset={onReset} />}
    </div>
  );
}

function BooleanEditor({ value, onChange, derived, onReset }) {
  const isDirty = value !== derived;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
      <BoolBox value={value} onChange={onChange} minHeight={120} rows={4} />

      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 12,
      }}>
        <div style={{
          font: "var(--lt-body-sm)", color: "var(--lt-text-tertiary)",
          letterSpacing: "-0.010em",
        }}>Use <code>AND</code>, <code>OR</code>, <code>NOT</code> and parentheses. Quote multi-word phrases.</div>
        {isDirty && (
          <button onClick={onReset}
            style={{
              background: "transparent", border: 0, cursor: "pointer", padding: 0,
              font: "500 12px/1 var(--lt-font-sans)",
              letterSpacing: "-0.010em", color: "var(--lt-accent)",
            }}>Revert to suggested</button>
        )}
      </div>
    </div>
  );
}

/* Reusable highlighted boolean editor box — a transparent textarea over a
   syntax-highlighted preview, so the caret/selection work while colors render
   underneath. Shared by the balanced editor and the broad/precise variants. */
function BoolBox({ value, onChange, minHeight = 96, rows = 3 }) {
  const [focus, setFocus] = useStateRQ(false);
  return (
    <div style={{
      position: "relative",
      borderRadius: 10,
      background: "var(--lt-bg-surface)",
      border: "1px solid var(--lt-border-input)",
      boxShadow: focus ? "var(--lt-focus-ring)" : "none",
      transition: "var(--lt-transition-colors)",
      minHeight,
    }}>
      <div aria-hidden="true" style={{
        position: "absolute", inset: 0,
        padding: "12px 14px",
        font: "13px/1.65 ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace",
        whiteSpace: "pre-wrap", wordBreak: "break-word",
        pointerEvents: "none",
      }}>
        {tokenizeBoolean(value).map((tok, i) => (
          <span key={i} style={tok.style}>{tok.text}</span>
        ))}
      </div>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        rows={rows}
        spellCheck={false}
        style={{
          position: "relative",
          width: "100%", boxSizing: "border-box",
          border: 0, outline: "none", background: "transparent",
          resize: "vertical",
          padding: "12px 14px",
          font: "13px/1.65 ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace",
          color: "transparent", caretColor: "var(--lt-text-primary)",
          minHeight,
        }}
      />
    </div>
  );
}

/* Lightweight syntax highlighter for boolean queries.
   Operators (AND OR NOT) in accent; quoted phrases in primary; parens in tertiary. */
function tokenizeBoolean(text) {
  if (!text) return [];
  const tokens = [];
  const re = /("[^"]*")|(\bAND\b|\bOR\b|\bNOT\b)|([()])|(\s+)|([^\s()"]+)/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m[1]) tokens.push({ text: m[1], style: { color: "var(--lt-text-primary)" } });
    else if (m[2]) tokens.push({ text: m[2], style: { color: "var(--lt-accent)", fontWeight: 600 } });
    else if (m[3]) tokens.push({ text: m[3], style: { color: "var(--lt-text-tertiary)" } });
    else if (m[4]) tokens.push({ text: m[4], style: {} });
    else if (m[5]) tokens.push({ text: m[5], style: { color: "var(--lt-text-secondary)" } });
  }
  return tokens;
}

Object.assign(window, { ResearchQuestionPage });
