// Mangarr — app shell: sidebar, topbar, router, tweaks panel.

const { useState, useEffect, useMemo, useRef, useCallback } = React;

const NAV = [
  { id: "library",  label: "Library",  icon: "library",  group: "Content" },
  { id: "add",      label: "Add New",  icon: "plus",     group: "Content" },
];

/* ---------------- Sidebar ---------------- */
function Sidebar({ active, onNav, collapsed, onToggle }) {
  const grouped = {};
  NAV.forEach(n => { (grouped[n.group] = grouped[n.group] || []).push(n); });
  return (
    <aside className="side">
      <div className="side__brand">
        <div className="brandmark" aria-hidden="true" />
        <div className="name">Mangarr</div>
        <div className="ver">v0.8.2</div>
      </div>
      <nav className="side__nav">
        {Object.entries(grouped).map(([sec, items]) => (
          <React.Fragment key={sec}>
            <div className="side__section">{sec}</div>
            {items.map(n => (
              <div
                key={n.id}
                className={"navitem" + (active === n.id ? " is-active" : "")}
                onClick={() => onNav(n.id)}
                title={n.label}
              >
                <Icon name={n.icon} />
                <span className="label">{n.label}</span>
                {n.badge ? <span className="count mono">{n.badge}</span> : null}
              </div>
            ))}
          </React.Fragment>
        ))}
      </nav>
    </aside>
  );
}

/* ---------------- Topbar ---------------- */
function Topbar({ onToggleSide, state, setState, route }) {
  const showLibControls = route === "library";
  return (
    <div className="topbar">
      <button className="btn btn--ghost btn--icon" onClick={onToggleSide} title="Toggle sidebar">
        <Icon name="sidebar" />
      </button>
      <div className="search">
        <Icon name="search" />
        <input placeholder="Search series, chapters, scanlators…" />
        <kbd>⌘K</kbd>
      </div>
      <div className="topbar__controls">
        {showLibControls && (
          <>
            <Segmented
              value={state.libraryView}
              onChange={(v) => setState({ libraryView: v })}
              options={[
                { v: "grid",   icon: "grid",   title: "Grid view" },
                { v: "banner", icon: "banner", title: "Banner view" },
                { v: "table",  icon: "list",   title: "Table view" },
              ]}
            />
            <Segmented
              value={state.density}
              onChange={(v) => setState({ density: v })}
              options={[
                { v: "compact", label: "Compact" },
                { v: "normal",  label: "Normal" },
                { v: "comfy",   label: "Comfy" },
              ]}
            />
          </>
        )}
        <button
          className="btn btn--ghost btn--icon"
          onClick={() => setState({ theme: state.theme === "dark" ? "light" : "dark" })}
          title={state.theme === "dark" ? "Switch to light" : "Switch to dark"}
        >
          <Icon name={state.theme === "dark" ? "sun" : "moon"} />
        </button>
      </div>
      <div className="topbar__meta"></div>
    </div>
  );
}

/* ---------------- Library controls bar (cover size) ---------------- */
function LibraryControls({ state, setState }) {
  if (state.libraryView !== "grid") return null;
  return (
    <div className="lib-controls">
      <label className="lib-controls__label">Cover size</label>
      <input
        type="range" min="110" max="220" step="2"
        value={state.cardSize}
        onChange={(e) => setState({ cardSize: +e.target.value })}
      />
      <span className="lib-controls__value mono">{state.cardSize}px</span>
    </div>
  );
}

/* ---------------- Tweaks panel ---------------- */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "dark",
  "density": "normal",
  "libraryView": "grid",
  "sidebarCollapsed": false,
  "cardSize": 156
}/*EDITMODE-END*/;

function TweaksPanel({ state, setState, onClose }) {
  return (
    <div className="tweaks" role="dialog" aria-label="Tweaks">
      <div className="tweaks__head">
        <span className="dot" />
        <span className="title">Tweaks</span>
        <button className="btn btn--ghost btn--icon btn--sm" style={{ marginLeft: "auto" }} onClick={onClose}>
          <Icon name="close" size={14} />
        </button>
      </div>
      <div className="tweaks__body">
        <div className="tweak">
          <div className="tweak__label">Theme</div>
          <Segmented
            value={state.theme}
            onChange={(v) => setState({ theme: v })}
            options={[
              { v: "dark",  label: "Dark",  icon: "moon" },
              { v: "light", label: "Light", icon: "sun" },
            ]}
          />
        </div>
        <div className="tweak">
          <div className="tweak__label">Density</div>
          <Segmented
            value={state.density}
            onChange={(v) => setState({ density: v })}
            options={[
              { v: "compact", label: "Compact" },
              { v: "normal",  label: "Normal" },
              { v: "comfy",   label: "Comfy" },
            ]}
          />
        </div>
        <div className="tweak">
          <div className="tweak__label">Library view</div>
          <Segmented
            value={state.libraryView}
            onChange={(v) => setState({ libraryView: v })}
            options={[
              { v: "grid",   label: "Grid",   icon: "grid" },
              { v: "banner", label: "Banner", icon: "banner" },
              { v: "table",  label: "Table",  icon: "list" },
            ]}
          />
        </div>
        <div className="tweak">
          <div className="tweak__label">
            <span>Cover size</span>
            <span className="mono">{state.cardSize}px</span>
          </div>
          <input
            type="range" min="110" max="220" step="2"
            value={state.cardSize}
            onChange={(e) => setState({ cardSize: +e.target.value })}
            style={{ width: "100%" }}
          />
        </div>
        <div className="tweak">
          <div className="tweak__label">Sidebar</div>
          <Segmented
            value={state.sidebarCollapsed ? "collapsed" : "expanded"}
            onChange={(v) => setState({ sidebarCollapsed: v === "collapsed" })}
            options={[
              { v: "expanded",  label: "Expanded" },
              { v: "collapsed", label: "Collapsed" },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

/* ---------------- App shell ---------------- */
function Shell() {
  const [route, setRoute] = useState(() => localStorage.getItem("mangarr.route") || "library");
  const [seriesFocus, setSeriesFocus] = useState(() => localStorage.getItem("mangarr.series") || null);
  const [tweaksOn, setTweaksOn] = useState(false);
  const [state, setStateRaw] = useState(() => {
    try {
      const s = localStorage.getItem("mangarr.state");
      return s ? { ...TWEAK_DEFAULTS, ...JSON.parse(s) } : { ...TWEAK_DEFAULTS };
    } catch { return { ...TWEAK_DEFAULTS }; }
  });
  const setState = useCallback((patch) => {
    setStateRaw((prev) => {
      const next = { ...prev, ...patch };
      try { localStorage.setItem("mangarr.state", JSON.stringify(next)); } catch {}
      try { window.parent.postMessage({ type: "__edit_mode_set_keys", edits: patch }, "*"); } catch {}
      return next;
    });
  }, []);

  // Host edit-mode protocol
  useEffect(() => {
    const onMsg = (e) => {
      const d = e.data || {};
      if (d.type === "__activate_edit_mode") setTweaksOn(true);
      else if (d.type === "__deactivate_edit_mode") setTweaksOn(false);
    };
    window.addEventListener("message", onMsg);
    try { window.parent.postMessage({ type: "__edit_mode_available" }, "*"); } catch {}
    return () => window.removeEventListener("message", onMsg);
  }, []);

  useEffect(() => { localStorage.setItem("mangarr.route", route); }, [route]);
  useEffect(() => {
    if (seriesFocus) localStorage.setItem("mangarr.series", seriesFocus);
    else localStorage.removeItem("mangarr.series");
  }, [seriesFocus]);

  const openSeries = (t) => { setSeriesFocus(t); setRoute("series"); };

  const appCls = [
    "app",
    state.sidebarCollapsed ? "sidebar-collapsed" : "",
    "theme-" + state.theme,
    "density-" + state.density,
  ].join(" ");

  return (
    <div className={appCls}>
      <Sidebar
        active={route === "series" ? "library" : route}
        onNav={(r) => { setRoute(r); setSeriesFocus(null); }}
        collapsed={state.sidebarCollapsed}
        onToggle={() => setState({ sidebarCollapsed: !state.sidebarCollapsed })}
      />
      <div className="main">
        <Topbar
          onToggleSide={() => setState({ sidebarCollapsed: !state.sidebarCollapsed })}
          state={state}
          setState={setState}
          route={route}
        />
        <div className="page">
          {route === "library" && (
            <>
              <LibraryPage
                view={state.libraryView}
                cardSize={state.cardSize}
                onOpen={openSeries}
                controls={<LibraryControls state={state} setState={setState} />}
              />
            </>
          )}
          {route === "series" && (
            <SeriesDetailPage
              title={seriesFocus}
              onBack={() => setRoute("library")}
              onOpen={openSeries}
            />
          )}
          {route === "add" && <AddPage />}
        </div>
      </div>
      {tweaksOn && (
        <TweaksPanel state={state} setState={setState} onClose={() => setTweaksOn(false)} />
      )}
    </div>
  );
}

Object.assign(window, { Shell, NAV });
