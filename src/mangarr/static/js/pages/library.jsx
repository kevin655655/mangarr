// Library page — 3 view variations controlled by `view` prop.

const LIBRARY_FACETS = ["All", "Monitored", "Missing", "Ongoing", "Completed", "Hiatus"];

function LibraryPage({ view = "grid", cardSize = 156, onOpen, controls }) {
  const { SERIES } = window.MANGARR_DATA;
  const [facet, setFacet] = useState("All");
  const [sort, setSort] = useState("added");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    let list = SERIES.slice();
    if (facet === "Monitored") list = list.filter(s => s.mon);
    else if (facet === "Missing") list = list.filter(s => s.have < s.ch);
    else if (facet === "Ongoing") list = list.filter(s => s.s === "ongoing");
    else if (facet === "Completed") list = list.filter(s => s.s === "completed");
    else if (facet === "Hiatus") list = list.filter(s => s.s === "hiatus");
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(s => s.t.toLowerCase().includes(q) || s.a.toLowerCase().includes(q));
    }
    if (sort === "title") list.sort((a,b) => a.t.localeCompare(b.t));
    else if (sort === "rating") list.sort((a,b) => b.rt - a.rt);
    else if (sort === "chapters") list.sort((a,b) => b.ch - a.ch);
    return list;
  }, [SERIES, facet, sort, query]);

  const missingCount = SERIES.reduce((n,s) => n + (s.ch - s.have), 0);

  return (
    <>
      <div className="page__head">
        <div className="page__title">Library</div>
        <div className="page__subtitle mono">{SERIES.length} series · {missingCount} missing chapters · 412 GB</div>
        <div className="page__actions">
          <button className="btn"><Icon name="refresh" size={13}/>Refresh</button>
          <button className="btn btn--primary"><Icon name="plus" size={13}/>Add Series</button>
        </div>
      </div>
      <div className="toolbar">
        <div className="facets">
          {LIBRARY_FACETS.map(f => (
            <button key={f} className={"facet" + (facet === f ? " is-on" : "")} onClick={() => setFacet(f)}>
              {f}
            </button>
          ))}
        </div>
        <div className="sep" />
        <div className="input" style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 10px", minWidth: 220 }}>
          <Icon name="search" size={13} />
          <input
            style={{ background: "transparent", border: 0, outline: "none", flex: 1, color: "inherit", fontSize: 12 }}
            placeholder="Filter in library…"
            value={query} onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {controls}
        <select className="select" value={sort} onChange={(e)=>setSort(e.target.value)}>
          <option value="added">Sort: Date Added</option>
          <option value="title">Sort: Title</option>
          <option value="rating">Sort: Rating</option>
          <option value="chapters">Sort: Chapters</option>
        </select>
        <div className="sep" />
        <button className="btn btn--ghost"><Icon name="filter" size={13}/>More filters</button>
        <div style={{ marginLeft: "auto" }} className="mono dim">{filtered.length} shown</div>
      </div>

      {view === "grid" && <LibraryGrid list={filtered} cardSize={cardSize} onOpen={onOpen} />}
      {view === "banner" && <LibraryBanner list={filtered} onOpen={onOpen} />}
      {view === "table" && <LibraryTable list={filtered} onOpen={onOpen} />}
    </>
  );
}

function LibraryGrid({ list, cardSize, onOpen }) {
  return (
    <div className="lib-grid" style={{ "--cover-w": cardSize + "px" }}>
      {list.map(s => {
        const pct = Math.round((s.have / s.ch) * 100);
        return (
          <div key={s.t} className="lib-card" onClick={() => onOpen && onOpen(s.t)}>
            <Cover
              title={s.t}
              hue={s.hue}
              badge={s.have < s.ch ? `+${s.ch - s.have}` : null}
            />
            <div className="lib-card__title">{s.t}</div>
            <div className="lib-card__meta">
              <span className={"chip chip--dot chip--" + s.s} style={{ height: 18, fontSize: 9.5 }}>
                {s.s}
              </span>
              <span>·</span>
              <span>{s.have}/{s.ch} ch</span>
            </div>
            <div className="lib-card__bar">
              <Progress pct={pct} kind={pct < 100 ? (pct < 90 ? "warn" : "") : ""} />
              <span className="lib-card__pct">{pct}%</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LibraryBanner({ list, onOpen }) {
  return (
    <div className="lib-banner-grid">
      {list.map(s => {
        const pct = Math.round((s.have / s.ch) * 100);
        return (
          <div key={s.t} className="banner-card" onClick={() => onOpen && onOpen(s.t)}>
            <Cover title={s.t} hue={s.hue} />
            <div className="banner-card__body">
              <div className="banner-card__title">{s.t}</div>
              <div className="banner-card__row">
                <Chip kind={s.s}>{s.s}</Chip>
                <span className="mono dim" style={{ fontSize: 10.5 }}>{s.a} · {s.y}</span>
              </div>
              <div className="banner-card__row" style={{ gap: 4 }}>
                {s.g.slice(0,2).map(g => <span key={g} className="chip" style={{ height: 18, fontSize: 9.5 }}>{g}</span>)}
              </div>
              <div className="banner-card__stats">
                <div><b>{s.have}</b>/{s.ch}<div className="dim">chapters</div></div>
                <div><b>{s.rt.toFixed(1)}</b><div className="dim">rating</div></div>
                <div><b>{s.src}</b><div className="dim">source</div></div>
              </div>
              <div className="lib-card__bar" style={{ marginTop: 4 }}>
                <Progress pct={pct} kind={pct < 100 ? (pct < 90 ? "warn" : "") : ""} />
                <span className="lib-card__pct">{pct}%</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LibraryTable({ list, onOpen }) {
  return (
    <div style={{ padding: "0 24px 32px", overflowX: "auto" }}>
      <table className="lib-table">
        <thead>
          <tr>
            <th style={{ width: 40 }}></th>
            <th>Title</th>
            <th>Author</th>
            <th>Status</th>
            <th>Genres</th>
            <th style={{ textAlign: "right" }}>Chapters</th>
            <th style={{ width: 140 }}>Progress</th>
            <th>Source</th>
            <th style={{ textAlign: "right" }}>Rating</th>
            <th style={{ width: 40 }}></th>
          </tr>
        </thead>
        <tbody>
          {list.map(s => {
            const pct = Math.round((s.have / s.ch) * 100);
            return (
              <tr key={s.t} onClick={() => onOpen && onOpen(s.t)}>
                <td><Icon name="bookmark" size={13} /></td>
                <td className="t-title">
                  <MiniCover hue={s.hue} />
                  {s.t}
                </td>
                <td className="mono dim">{s.a}</td>
                <td><Chip kind={s.s}>{s.s}</Chip></td>
                <td className="mono dim" style={{ fontSize: 11 }}>{s.g.join(" · ")}</td>
                <td className="mono" style={{ textAlign: "right" }}>
                  <span className={s.have === s.ch ? "s-good" : "s-warn"}>{s.have}</span>
                  <span className="dim"> / {s.ch}</span>
                </td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Progress pct={pct} kind={pct < 100 ? (pct < 90 ? "warn" : "") : ""} />
                    <span className="mono dim" style={{ fontSize: 10.5, width: 32, textAlign: "right" }}>{pct}%</span>
                  </div>
                </td>
                <td className="mono dim">{s.src}</td>
                <td className="mono" style={{ textAlign: "right" }}>{s.rt.toFixed(1)}</td>
                <td><Icon name="more" size={14}/></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

Object.assign(window, { LibraryPage });
