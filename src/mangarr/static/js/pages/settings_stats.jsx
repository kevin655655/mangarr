// Stats + Settings pages

function StatsPage() {
  const { SERIES, HISTORY } = window.MANGARR_DATA;
  const totalCh = SERIES.reduce((n,s) => n + s.ch, 0);
  const haveCh  = SERIES.reduce((n,s) => n + s.have, 0);
  const monCount = SERIES.filter(s => s.mon).length;

  // generate plausible daily grab histogram (14 days)
  const daily = [4, 7, 3, 9, 12, 6, 8, 14, 11, 5, 8, 13, 10, 9];
  const byGenre = {};
  SERIES.forEach(s => s.g.forEach(g => byGenre[g] = (byGenre[g]||0)+1));
  const genres = Object.entries(byGenre).sort((a,b) => b[1]-a[1]).slice(0, 8);
  const maxGenre = Math.max(...genres.map(g => g[1]));

  const groups = {};
  HISTORY.filter(h => h.event === "imported").forEach(h => groups[h.group] = (groups[h.group]||0)+1);
  const topGroups = Object.entries(groups).sort((a,b) => b[1]-a[1]).slice(0, 5);

  return (
    <>
      <div className="page__head">
        <div className="page__title">Stats</div>
        <div className="page__subtitle mono">Library insights · updated 3m ago</div>
        <div className="page__actions">
          <button className="btn btn--ghost">Last 30 days</button>
        </div>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="label">Series</div>
          <div className="value">{SERIES.length}</div>
          <div className="delta up">+3 this month</div>
        </div>
        <div className="stat-card">
          <div className="label">Chapters</div>
          <div className="value">{haveCh.toLocaleString()}<span className="dim" style={{ fontSize: 15, fontWeight: 400 }}> / {totalCh.toLocaleString()}</span></div>
          <div className="delta up">+148 downloaded · {Math.round((haveCh/totalCh)*100)}% complete</div>
        </div>
        <div className="stat-card">
          <div className="label">Monitored</div>
          <div className="value">{monCount}</div>
          <div className="delta">{SERIES.length - monCount} unmonitored</div>
        </div>
        <div className="stat-card">
          <div className="label">Disk used</div>
          <div className="value mono" style={{ fontSize: 22 }}>412 <span className="dim" style={{ fontSize: 14, fontWeight: 400 }}>GB</span></div>
          <div className="delta">of 2000 GB · 20.6%</div>
        </div>
      </div>

      <div style={{ padding: "16px 24px", display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
        <div className="chart-card">
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <h3>Chapters grabbed per day</h3>
            <span className="sub">last 14 days</span>
            <span className="sub" style={{ marginLeft: "auto" }}>avg {(daily.reduce((a,b) => a+b,0)/daily.length).toFixed(1)}/day</span>
          </div>
          <div className="bar-chart" style={{ marginTop: 16 }}>
            {daily.map((v, i) => (
              <div key={i} className="bar" style={{ height: (v / Math.max(...daily)) * 100 + "%" }} title={`${v} on D-${daily.length - i}`}>
                {i === daily.length - 1 ? <span className="v">{v}</span> : null}
                {i % 3 === 0 ? <span className="x">-{daily.length - i}d</span> : null}
              </div>
            ))}
          </div>
        </div>
        <div className="chart-card">
          <h3>Top scanlation groups</h3>
          <span className="sub">by successful imports</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 6 }}>
            {topGroups.map(([g, n]) => (
              <div key={g} style={{ display: "grid", gridTemplateColumns: "1fr 50px auto", gap: 8, alignItems: "center", fontSize: 12 }}>
                <div>{g}</div>
                <div style={{ height: 4, background: "var(--bg-4)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: (n / topGroups[0][1]) * 100 + "%", background: "var(--accent)" }}/>
                </div>
                <span className="mono dim" style={{ width: 24, textAlign: "right" }}>{n}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: "0 24px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="chart-card">
          <h3>Genres distribution</h3>
          <span className="sub">across your library</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
            {genres.map(([g, n]) => (
              <div key={g} style={{ display: "grid", gridTemplateColumns: "120px 1fr 40px", gap: 10, alignItems: "center", fontSize: 12 }}>
                <div className="mono dim" style={{ fontSize: 11 }}>{g}</div>
                <div style={{ height: 12, background: "var(--bg-4)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: (n/maxGenre)*100 + "%", background: `oklch(0.7 0.14 ${140 + (g.length*13)%200})` }}/>
                </div>
                <span className="mono" style={{ textAlign: "right", fontSize: 11 }}>{n}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="chart-card">
          <h3>Activity</h3>
          <span className="sub">last 24 hours · grab/import ratio</span>
          <Sparkline data={[3,5,4,8,6,9,12,7,10,14,11,8,6,9]} height={48} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 8, fontSize: 12 }}>
            <div><div className="label">Grabbed</div><div className="mono" style={{ fontSize: 18, fontWeight: 600 }}>24</div></div>
            <div><div className="label">Imported</div><div className="mono s-good" style={{ fontSize: 18, fontWeight: 600 }}>22</div></div>
            <div><div className="label">Failed</div><div className="mono s-bad" style={{ fontSize: 18, fontWeight: 600 }}>2</div></div>
          </div>
        </div>
      </div>
    </>
  );
}

function SettingsPage() {
  const [tab, setTab] = useState("indexers");
  const tabs = [
    { id: "general",   label: "General",        icon: "settings" },
    { id: "indexers",  label: "Indexers",       icon: "cloud" },
    { id: "downloads", label: "Download Clients", icon: "download" },
    { id: "folders",   label: "Root Folders",    icon: "folder" },
    { id: "profiles",  label: "Quality Profiles", icon: "star" },
    { id: "sync",      label: "Anilist / MAL",   icon: "link" },
    { id: "notify",    label: "Notifications",   icon: "bell" },
    { id: "advanced",  label: "Advanced",        icon: "command" },
  ];
  return (
    <div className="settings">
      <div className="settings-nav">
        {tabs.map(t => (
          <div key={t.id} className={"navitem" + (tab === t.id ? " is-active" : "")} onClick={() => setTab(t.id)}>
            <Icon name={t.icon}/>
            <span className="label">{t.label}</span>
          </div>
        ))}
      </div>
      <div className="settings-body">
        {tab === "indexers" && <SettingsIndexers/>}
        {tab === "downloads" && <SettingsDownloads/>}
        {tab === "folders" && <SettingsFolders/>}
        {tab === "profiles" && <SettingsProfiles/>}
        {tab === "sync" && <SettingsSync/>}
        {tab === "general" && <SettingsGeneral/>}
        {tab === "notify" && <EmptySettings name="Notifications"/>}
        {tab === "advanced" && <EmptySettings name="Advanced"/>}
      </div>
    </div>
  );
}

function EmptySettings({ name }) {
  return (
    <div className="settings-section">
      <h2>{name}</h2>
      <p className="hint">Configure {name.toLowerCase()} here. Left unwired in this prototype.</p>
    </div>
  );
}

function SettingsIndexers() {
  const indexers = [
    { name: "MangaDex",      url: "https://api.mangadex.org",      status: "ok",   prio: 1, tag: "MDX" },
    { name: "Bato.to",       url: "https://bato.to",               status: "ok",   prio: 2, tag: "BAT" },
    { name: "MangaSee",      url: "https://mangasee123.com",       status: "warn", prio: 3, tag: "MSE" },
    { name: "ComicK",        url: "https://api.comick.app",        status: "ok",   prio: 4, tag: "CMK" },
    { name: "Kavita (local)",url: "http://10.0.0.42:5000",         status: "off",  prio: 99, tag: "KAV" },
  ];
  return (
    <div className="settings-section">
      <h2>Indexers</h2>
      <p className="hint">Sources Mangarr queries for chapter releases. Order by priority — ties break by scanlation group preference.</p>
      {indexers.map((ix) => (
        <div className="index-card" key={ix.name}>
          <div className="logo">{ix.tag}</div>
          <div className="meta">
            <div className="name">{ix.name} <span className="mono dim" style={{ fontSize: 10, marginLeft: 6 }}>priority {ix.prio}</span></div>
            <div className="url">{ix.url}</div>
          </div>
          <div className="actions">
            <span className={"status-dot " + (ix.status === "ok" ? "imported" : ix.status === "warn" ? "searching" : "missing")}/>
            <span className="mono" style={{ fontSize: 11, color: ix.status === "ok" ? "var(--accent)" : ix.status === "warn" ? "var(--warn)" : "var(--fg-4)" }}>
              {ix.status === "ok" ? "connected" : ix.status === "warn" ? "rate limited" : "disabled"}
            </span>
            <button className="btn btn--sm">Test</button>
            <button className="btn btn--sm btn--ghost"><Icon name="more" size={12}/></button>
          </div>
        </div>
      ))}
      <div style={{ marginTop: 12 }}>
        <button className="btn btn--primary"><Icon name="plus" size={13}/>Add Indexer</button>
      </div>
    </div>
  );
}

function SettingsDownloads() {
  return (
    <div className="settings-section">
      <h2>Download Clients</h2>
      <p className="hint">Where Mangarr sends grabbed chapters. HTTP and torrent clients supported.</p>
      <div className="index-card">
        <div className="logo">FLD</div>
        <div className="meta">
          <div className="name">FlareDownloader <span className="mono dim" style={{ fontSize: 10, marginLeft: 6 }}>default</span></div>
          <div className="url">http://10.0.0.42:8081/api · category: manga</div>
        </div>
        <div className="actions">
          <span className="status-dot imported"/>
          <span className="mono s-good" style={{ fontSize: 11 }}>connected</span>
          <button className="btn btn--sm">Test</button>
          <button className="btn btn--sm btn--ghost"><Icon name="more" size={12}/></button>
        </div>
      </div>
      <div className="index-card">
        <div className="logo">QBT</div>
        <div className="meta">
          <div className="name">qBittorrent</div>
          <div className="url">http://10.0.0.42:8080 · category: manga-pack</div>
        </div>
        <div className="actions">
          <span className="status-dot imported"/>
          <span className="mono s-good" style={{ fontSize: 11 }}>connected</span>
          <button className="btn btn--sm">Test</button>
          <button className="btn btn--sm btn--ghost"><Icon name="more" size={12}/></button>
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <button className="btn btn--primary"><Icon name="plus" size={13}/>Add Client</button>
      </div>
    </div>
  );
}

function SettingsFolders() {
  return (
    <div className="settings-section">
      <h2>Root Folders</h2>
      <p className="hint">Where series libraries live on disk. Mangarr writes CBZ per chapter by default.</p>
      <div className="index-card">
        <div className="logo"><Icon name="folder" size={16}/></div>
        <div className="meta">
          <div className="name">/mnt/tank/manga</div>
          <div className="url">1.6 TB free · 412 GB in 24 series · primary</div>
        </div>
        <div className="actions">
          <button className="btn btn--sm">Open</button>
          <button className="btn btn--sm btn--ghost btn--danger">Remove</button>
        </div>
      </div>
      <div className="index-card">
        <div className="logo"><Icon name="folder" size={16}/></div>
        <div className="meta">
          <div className="name">/mnt/tank/manga/archive</div>
          <div className="url">used for completed series · 82 GB</div>
        </div>
        <div className="actions">
          <button className="btn btn--sm">Open</button>
          <button className="btn btn--sm btn--ghost btn--danger">Remove</button>
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <button className="btn btn--primary"><Icon name="plus" size={13}/>Add Folder</button>
      </div>
    </div>
  );
}

function SettingsProfiles() {
  const [prefer, setPrefer] = useState(["NullScan","Paperback Lanterns","Verdigris Group","Kuro Ink"]);
  const [block, setBlock] = useState(["MTL Bros", "QuickTL"]);
  return (
    <>
      <div className="settings-section">
        <h2>Quality Profile · Default</h2>
        <p className="hint">Which chapter variants are allowed and in what order. Applied to new series unless overridden.</p>
        <div className="field"><label>Minimum resolution</label>
          <select className="select"><option>1600px</option><option>1200px</option><option>1080px</option></select>
        </div>
        <div className="field"><label>Prefer language</label>
          <div style={{ display: "flex", gap: 6 }}>
            <span className="facet is-on">EN</span>
            <span className="facet">JP</span>
            <span className="facet">ES</span>
            <span className="facet">FR</span>
          </div>
        </div>
        <div className="field"><label>File format</label>
          <Segmented value="cbz" onChange={()=>{}} options={[{v:"cbz",label:"CBZ"},{v:"pdf",label:"PDF"},{v:"folder",label:"Folder"}]}/>
        </div>
        <div className="field"><label>Upgrade existing</label>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Switch on={true} onChange={()=>{}}/>
            <span className="mono dim" style={{ fontSize: 11 }}>replace when a preferred group releases the same chapter</span>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h2>Scanlation Group Preferences</h2>
        <p className="hint">Preferred groups are chosen before others when multiple scanlations exist for the same chapter.</p>
        <div className="field"><label>Preferred (in order)</label>
          <div className="facets">
            {prefer.map((g,i) => (
              <span key={g} className="facet is-on">
                <span className="mono dim" style={{ fontSize: 10 }}>{i+1}</span>
                {g}
                <span className="x">×</span>
              </span>
            ))}
            <span className="facet"><Icon name="plus" size={11}/>Add group</span>
          </div>
        </div>
        <div className="field"><label>Blocked</label>
          <div className="facets">
            {block.map(g => <span key={g} className="facet" style={{ color: "var(--bad)", borderColor: "color-mix(in oklch, var(--bad) 40%, var(--line))" }}>{g} <span className="x">×</span></span>)}
            <span className="facet"><Icon name="plus" size={11}/>Block group</span>
          </div>
        </div>
      </div>
    </>
  );
}

function SettingsSync() {
  return (
    <div className="settings-section">
      <h2>AniList · MAL sync</h2>
      <p className="hint">Two-way sync of library, progress, and ratings.</p>
      <div className="index-card">
        <div className="logo">ANI</div>
        <div className="meta">
          <div className="name">AniList <span className="mono dim" style={{ marginLeft: 6, fontSize: 10 }}>@haruki_self</span></div>
          <div className="url">Last sync 2m ago · 24 series synced · 0 conflicts</div>
        </div>
        <div className="actions">
          <span className="status-dot imported"/>
          <span className="mono s-good" style={{ fontSize: 11 }}>linked</span>
          <button className="btn btn--sm">Sync now</button>
          <button className="btn btn--sm btn--ghost btn--danger">Unlink</button>
        </div>
      </div>
      <div className="index-card">
        <div className="logo">MAL</div>
        <div className="meta">
          <div className="name">MyAnimeList</div>
          <div className="url">Not connected</div>
        </div>
        <div className="actions">
          <span className="status-dot missing"/>
          <span className="mono dim" style={{ fontSize: 11 }}>disconnected</span>
          <button className="btn btn--sm btn--primary">Connect</button>
        </div>
      </div>
      <div className="field"><label>Write progress on</label>
        <Segmented value="import" onChange={()=>{}} options={[{v:"import",label:"Import"},{v:"manual",label:"Manual"},{v:"off",label:"Off"}]}/>
      </div>
      <div className="field"><label>Pull rating changes</label>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Switch on={true} onChange={()=>{}}/>
          <span className="mono dim" style={{ fontSize: 11 }}>update Mangarr rating when you rate on AniList</span>
        </div>
      </div>
    </div>
  );
}

function SettingsGeneral() {
  return (
    <div className="settings-section">
      <h2>General</h2>
      <p className="hint">Basic server behavior and scan schedule.</p>
      <div className="field"><label>Scan interval</label>
        <select className="select"><option>Every 30 minutes</option><option>Every hour</option><option>Every 6 hours</option></select>
      </div>
      <div className="field"><label>Run scans on launch</label>
        <Switch on={true} onChange={()=>{}}/>
      </div>
      <div className="field"><label>Auto-import on grab</label>
        <Switch on={true} onChange={()=>{}}/>
      </div>
      <div className="field"><label>Port</label>
        <input className="input mono" defaultValue="8686" style={{ maxWidth: 120 }}/>
      </div>
      <div className="field"><label>API key</label>
        <input className="input mono" defaultValue="d5f7c3e1a94b21e07ca8" readOnly style={{ maxWidth: 260 }}/>
      </div>
    </div>
  );
}

Object.assign(window, { StatsPage, SettingsPage });
