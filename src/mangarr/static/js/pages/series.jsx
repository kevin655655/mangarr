// Series detail page

function SeriesDetailPage({ title, onBack, onOpen }) {
  const { SERIES, chaptersFor } = window.MANGARR_DATA;
  const series = useMemo(() => SERIES.find(s => s.t === title) || SERIES[0], [SERIES, title]);
  const [tab, setTab] = useState("chapters");
  const chapters = useMemo(() => chaptersFor(series), [series]);
  const pct = Math.round((series.have / series.ch) * 100);

  // Group chapters by volume
  const byVol = {};
  chapters.forEach(c => { (byVol[c.vol] = byVol[c.vol] || []).push(c); });
  const vols = Object.keys(byVol).map(Number).sort((a,b) => b - a);

  return (
    <>
      <div className="page__head">
        <button className="btn btn--ghost btn--icon" onClick={onBack} title="Back to library">
          <Icon name="chevron" size={14} style={{ transform: "rotate(180deg)" }} />
        </button>
        <div className="page__title">{series.t}</div>
        <div className="page__subtitle mono">{series.a} · {series.y}</div>
        <div className="page__actions">
          <button className="btn"><Icon name="refresh" size={13}/>Refresh</button>
          <button className="btn"><Icon name="search" size={13}/>Search All</button>
          <button className="btn"><Icon name="eye" size={13}/>Monitor</button>
          <button className="btn btn--ghost btn--icon"><Icon name="more"/></button>
        </div>
      </div>

      <div className="sd-hero" style={{ "--hero-tint": `oklch(0.5 0.2 ${series.hue})` }}>
        <div className="sd-hero__bg" />
        <div className="sd-hero__cover">
          <Cover title={series.t} hue={series.hue} />
        </div>
        <div className="sd-hero__meta">
          <div>
            <div className="sd-title">{series.t}</div>
            <div className="sd-alt">a.k.a. "{series.t.toLowerCase().replace(/\s+/g, "-")}-jp" · OL{String(1234567 + series.y)}</div>
          </div>
          <div className="sd-chips">
            <Chip kind={series.s}>{series.s}</Chip>
            <Tag>{series.y}</Tag>
            <Tag>Vol {Math.ceil(series.ch/6)}</Tag>
            <Tag>EN · JP</Tag>
            {series.g.map(g => <Tag key={g}>{g}</Tag>)}
            <Tag>{series.src}</Tag>
          </div>
          <div className="sd-stats">
            <div><div className="sd-stat__label">Chapters</div>
              <div className="sd-stat__value">
                <span className={series.have === series.ch ? "s-good" : "s-warn"}>{series.have}</span>
                <span className="dim" style={{ fontWeight: 400, fontSize: 14 }}> / {series.ch}</span>
              </div>
              <div className="sd-stat__sub">{pct}% complete</div>
            </div>
            <div><div className="sd-stat__label">Rating</div>
              <div className="sd-stat__value">{series.rt.toFixed(1)}<span className="dim" style={{ fontWeight: 400, fontSize: 14 }}>/10</span></div>
              <div className="sd-stat__sub">4,128 votes</div>
            </div>
            <div><div className="sd-stat__label">Size on disk</div>
              <div className="sd-stat__value mono">{(series.have * 0.024).toFixed(2)} GB</div>
              <div className="sd-stat__sub">avg 24 MB/ch</div>
            </div>
            <div><div className="sd-stat__label">Next chapter</div>
              <div className="sd-stat__value mono" style={{ fontSize: 14 }}>Ch {series.ch + 1}</div>
              <div className="sd-stat__sub">est. in 4 days</div>
            </div>
            <div><div className="sd-stat__label">Preferred group</div>
              <div className="sd-stat__value mono" style={{ fontSize: 14 }}>NullScan</div>
              <div className="sd-stat__sub">2 alternates</div>
            </div>
          </div>
          <div className="sd-desc">
            A quiet, data-driven chronicle of {series.g[0].toLowerCase()} set against the backdrop of the {series.y}s. Weekly serialization, {series.s === "completed" ? "archived" : "actively tracked"} on {series.src}. Mangarr cross-references AniList and MAL on every scan.
          </div>
        </div>
      </div>

      <div className="sd-tabs">
        {[
          { id: "chapters", label: "Chapters", count: chapters.length },
          { id: "files",    label: "Files",    count: series.have },
          { id: "history",  label: "History",  count: 48 },
          { id: "related",  label: "Related",  count: 6 },
          { id: "editor",   label: "Editor",   count: null },
        ].map(t => (
          <button key={t.id} className={"sd-tab" + (tab === t.id ? " is-active" : "")} onClick={() => setTab(t.id)}>
            {t.label}{t.count != null ? <span className="count mono">{t.count}</span> : null}
          </button>
        ))}
      </div>

      {tab === "chapters" && (
        <div style={{ padding: "0 0 32px" }}>
          <div className="toolbar" style={{ borderTop: 0 }}>
            <div className="facets">
              <button className="facet is-on">All</button>
              <button className="facet">Missing only</button>
              <button className="facet">Monitored</button>
              <button className="facet">English</button>
            </div>
            <div className="sep" />
            <button className="btn btn--ghost"><Icon name="sort" size={13}/>Newest first</button>
            <div style={{ marginLeft: "auto" }}>
              <button className="btn btn--primary btn--sm"><Icon name="search" size={13}/>Search Missing</button>
            </div>
          </div>
          <table className="ch-table">
            <thead>
              <tr>
                <th style={{ width: 32 }}></th>
                <th style={{ width: 60 }}>#</th>
                <th>Title</th>
                <th style={{ width: 150 }}>Group</th>
                <th style={{ width: 60 }}>Lang</th>
                <th style={{ width: 80, textAlign: "right" }}>Size</th>
                <th style={{ width: 100 }}>Age</th>
                <th style={{ width: 120 }}>Status</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {vols.map(v => (
                <React.Fragment key={v}>
                  <tr className="vol-header"><td colSpan="9">Volume {v}</td></tr>
                  {byVol[v].map(c => (
                    <tr key={c.n} className={c.have ? "" : "ch--missing"}>
                      <td><Icon name="bookmark" size={13} style={{ color: c.monitor ? "var(--accent)" : "var(--fg-4)" }} /></td>
                      <td className="mono">{c.n}</td>
                      <td className="ch-title">{c.title}</td>
                      <td className="mono dim">{c.group}</td>
                      <td className="mono dim">{c.lang}</td>
                      <td className="mono dim" style={{ textAlign: "right" }}>{c.size}</td>
                      <td className="mono dim">{c.age}</td>
                      <td>
                        {c.have
                          ? <><span className="status-dot imported"/><span className="s-good mono" style={{ fontSize: 11 }}>downloaded</span></>
                          : <><span className="status-dot missing"/><span className="dim mono" style={{ fontSize: 11 }}>missing</span></>
                        }
                      </td>
                      <td>{c.have ? <Icon name="more" size={14}/> : <Icon name="search" size={14}/>}</td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab !== "chapters" && (
        <div className="empty">
          <h3>{tab[0].toUpperCase() + tab.slice(1)}</h3>
          <p>This tab would show {tab} for this series.</p>
        </div>
      )}
    </>
  );
}

Object.assign(window, { SeriesDetailPage });
