// Wanted + History pages

function WantedPage({ onOpen }) {
  const { WANTED, SERIES } = window.MANGARR_DATA;
  const hueFor = (t) => (SERIES.find(s => s.t === t)?.hue ?? 220);
  const [filter, setFilter] = useState("All");
  const rows = filter === "All" ? WANTED : WANTED.filter(r => r.status === filter.toLowerCase());

  const counts = { All: WANTED.length };
  ["missing","searching","queued","failed"].forEach(k => counts[k[0].toUpperCase()+k.slice(1)] = WANTED.filter(w => w.status === k).length);

  return (
    <>
      <div className="page__head">
        <div className="page__title">Wanted</div>
        <div className="page__subtitle mono">{WANTED.length} missing chapters across {new Set(WANTED.map(w=>w.series)).size} series</div>
        <div className="page__actions">
          <button className="btn"><Icon name="refresh" size={13}/>Refresh Monitored</button>
          <button className="btn btn--primary"><Icon name="search" size={13}/>Search All</button>
        </div>
      </div>
      <div className="toolbar">
        <div className="facets">
          {["All","Missing","Searching","Queued","Failed"].map(f => (
            <button key={f} className={"facet" + (filter === f ? " is-on" : "")} onClick={() => setFilter(f)}>
              {f} <span className="dim" style={{ marginLeft: 4 }}>{counts[f] ?? 0}</span>
            </button>
          ))}
        </div>
        <div className="sep"/>
        <button className="btn btn--ghost"><Icon name="filter" size={13}/>Group by series</button>
        <div style={{ marginLeft: "auto" }} className="mono dim">{rows.length} shown</div>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 36 }}></th>
              <th>Series</th>
              <th style={{ width: 60 }}>Ch</th>
              <th>Title</th>
              <th style={{ width: 120 }}>Age</th>
              <th style={{ width: 140 }}>Status</th>
              <th style={{ width: 260 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} onClick={() => onOpen && onOpen(r.series)}>
                <td><Icon name="bookmark" size={13} style={{ color: "var(--accent)" }}/></td>
                <td>
                  <MiniCover hue={hueFor(r.series)} />
                  <span style={{ verticalAlign: "middle" }}>{r.series}</span>
                </td>
                <td className="mono">{r.ch}</td>
                <td className="dim" style={{ whiteSpace: "normal" }}>{r.title}</td>
                <td className="mono dim">{r.age}</td>
                <td>
                  <span className={"status-dot " + r.status}/>
                  <span className="mono" style={{ fontSize: 11, color: r.status === "failed" ? "var(--bad)" : r.status === "queued" ? "var(--info)" : r.status === "searching" ? "var(--warn)" : "var(--fg-3)" }}>
                    {r.status}
                  </span>
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  <button className="btn btn--sm"><Icon name="search" size={12}/>Search</button>{" "}
                  <button className="btn btn--sm btn--ghost"><Icon name="download" size={12}/>Manual</button>{" "}
                  <button className="btn btn--sm btn--ghost"><Icon name="more" size={12}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function HistoryPage({ onOpen }) {
  const { HISTORY, SERIES } = window.MANGARR_DATA;
  const hueFor = (t) => (SERIES.find(s => s.t === t)?.hue ?? 220);
  const [filter, setFilter] = useState("All");
  const rows = filter === "All" ? HISTORY : HISTORY.filter(r => r.event === filter.toLowerCase());

  return (
    <>
      <div className="page__head">
        <div className="page__title">History</div>
        <div className="page__subtitle mono">Last 24 hours · {HISTORY.length} events</div>
        <div className="page__actions">
          <button className="btn btn--ghost"><Icon name="refresh" size={13}/>Refresh</button>
          <button className="btn btn--ghost"><Icon name="more" size={13}/></button>
        </div>
      </div>
      <div className="toolbar">
        <div className="facets">
          {["All","Grabbed","Imported","Failed","Deleted"].map(f => (
            <button key={f} className={"facet" + (filter === f ? " is-on" : "")} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>
        <div className="sep"/>
        <button className="btn btn--ghost"><Icon name="filter" size={13}/>Last 24h</button>
        <div style={{ marginLeft: "auto" }} className="mono dim">{rows.length} events</div>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 110 }}>When</th>
              <th style={{ width: 120 }}>Event</th>
              <th>Series</th>
              <th style={{ width: 60 }}>Ch</th>
              <th>Group</th>
              <th style={{ width: 110 }}>Source</th>
              <th style={{ width: 100, textAlign: "right" }}>Size</th>
              <th style={{ width: 40 }}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} onClick={() => onOpen && onOpen(r.series)}>
                <td className="mono dim">{r.when}</td>
                <td>
                  <span className={"status-dot " + r.event}/>
                  <span className="mono" style={{ fontSize: 11, color: r.event === "failed" ? "var(--bad)" : r.event === "imported" ? "var(--accent)" : "var(--info)" }}>{r.event}</span>
                </td>
                <td>
                  <MiniCover hue={hueFor(r.series)} />
                  <span style={{ verticalAlign: "middle" }}>{r.series}</span>
                </td>
                <td className="mono">{r.ch}</td>
                <td className="mono dim">{r.group}</td>
                <td className="mono dim">{r.src}</td>
                <td className="mono" style={{ textAlign: "right" }}>{r.size}</td>
                <td><Icon name="more" size={14}/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

Object.assign(window, { WantedPage, HistoryPage });
