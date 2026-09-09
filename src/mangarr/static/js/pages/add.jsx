// Add new series / search page

function AddPage() {
  const { SEARCH_RESULTS } = window.MANGARR_DATA;
  const [q, setQ] = useState("under the northbound");
  const [src, setSrc] = useState("All sources");

  return (
    <>
      <div className="add-hero">
        <h1>Add a new series</h1>
        <p>Search indexers and metadata providers (MangaDex, AniList, MAL) to add series to your library. Monitored series are checked for new chapters on every scan interval.</p>
        <div className="add-searchbar">
          <select value={src} onChange={(e) => setSrc(e.target.value)}>
            <option>All sources</option>
            <option>MangaDex</option>
            <option>AniList</option>
            <option>MAL</option>
            <option>Bato</option>
          </select>
          <input placeholder="Search by title, author, or AniList/MAL ID" value={q} onChange={(e) => setQ(e.target.value)} />
          <button className="btn btn--primary" style={{ height: 32 }}>
            <Icon name="search" size={13}/>Search
          </button>
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
          <span className="label">Filters:</span>
          <span className="facet is-on">EN translations</span>
          <span className="facet">Ongoing</span>
          <span className="facet">Rating ≥ 7.5</span>
          <span className="facet">Not in library</span>
        </div>
      </div>
      <div className="add-list">
        <div className="mono dim" style={{ padding: "0 4px", fontSize: 11 }}>
          {SEARCH_RESULTS.length} results · 0.28s · sources: MangaDex, AniList, MAL
        </div>
        {SEARCH_RESULTS.map(r => (
          <div className="add-row" key={r.t}>
            <Cover title={r.t} hue={r.hue} />
            <div className="add-row__body">
              <div className="add-row__title">{r.t}</div>
              <div className="add-row__meta">
                {r.a} · {r.y} · {r.s} · {r.ch} chapters · {r.src} · rating {r.rt.toFixed(1)}
              </div>
              <div style={{ display: "flex", gap: 5, marginBottom: 8, flexWrap: "wrap" }}>
                {r.g.map(g => <span key={g} className="chip" style={{ height: 18, fontSize: 9.5 }}>{g}</span>)}
              </div>
              <div className="add-row__desc">
                An {r.g[0].toLowerCase()} series serialized on {r.src}. Sample summary pulled from metadata: a quiet chronicle of small lives set against an enormous backdrop, with {r.ch} chapters currently available.
              </div>
            </div>
            <div className="add-row__actions">
              {r.added
                ? <><span className="chip chip--dot chip--completed" style={{ background: "transparent" }}>In library</span>
                    <button className="btn btn--sm" disabled style={{ opacity: 0.5 }}>Added</button></>
                : <><span className="mono dim" style={{ fontSize: 10.5 }}>ID: {Math.floor(Math.random()*99999)}</span>
                    <button className="btn btn--primary btn--sm"><Icon name="plus" size={12}/>Add</button>
                    <button className="btn btn--sm btn--ghost"><Icon name="link" size={12}/>Preview</button></>
              }
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

Object.assign(window, { AddPage });
