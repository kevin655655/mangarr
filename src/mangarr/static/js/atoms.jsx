// Mangarr — icon set + small atoms.
// Icons are outline, 16x16 stroke-1.5, currentColor.

const Icon = ({ name, size = 16, stroke = 1.5 }) => {
  const common = {
    width: size, height: size, viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor",
    strokeWidth: stroke, strokeLinecap: "round", strokeLinejoin: "round",
    className: "ico",
  };
  const paths = {
    library:   (<><rect x="3" y="4" width="5" height="16" rx="1"/><rect x="10" y="4" width="5" height="16" rx="1"/><path d="M17 5l3 14"/></>),
    series:    (<><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="9" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>),
    plus:      (<><path d="M12 5v14M5 12h14"/></>),
    search:    (<><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></>),
    wanted:    (<><path d="M12 3l8 4v6a9 9 0 0 1-8 8 9 9 0 0 1-8-8V7z"/><path d="M9 12l2 2 4-4"/></>),
    history:   (<><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3 2"/></>),
    calendar:  (<><rect x="3" y="5" width="18" height="16" rx="1"/><path d="M3 9h18M8 3v4M16 3v4"/></>),
    stats:     (<><path d="M3 20h18"/><rect x="5" y="10" width="3" height="8"/><rect x="10" y="6" width="3" height="12"/><rect x="15" y="13" width="3" height="5"/></>),
    settings:  (<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></>),
    download:  (<><path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M5 21h14"/></>),
    grid:      (<><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></>),
    list:      (<><path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></>),
    banner:    (<><rect x="3" y="4" width="18" height="6" rx="1"/><rect x="3" y="14" width="18" height="6" rx="1"/></>),
    filter:    (<><path d="M4 5h16l-6 8v6l-4-2v-4z"/></>),
    sort:      (<><path d="M7 4v16M7 4l-3 3M7 4l3 3"/><path d="M17 20V4M17 20l-3-3M17 20l3-3"/></>),
    close:     (<><path d="M6 6l12 12M18 6L6 18"/></>),
    refresh:   (<><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v5h-5"/></>),
    chevron:   (<><path d="M9 6l6 6-6 6"/></>),
    chevronD:  (<><path d="M6 9l6 6 6-6"/></>),
    check:     (<><path d="M4 12l5 5 11-11"/></>),
    star:      (<><path d="M12 3l2.9 6 6.6.6-5 4.5L18 21l-6-3.4L6 21l1.5-6.9-5-4.5L9.1 9z"/></>),
    link:      (<><path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></>),
    folder:    (<><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></>),
    server:    (<><rect x="3" y="4" width="18" height="7" rx="1"/><rect x="3" y="13" width="18" height="7" rx="1"/><circle cx="7" cy="7.5" r=".5" fill="currentColor"/><circle cx="7" cy="16.5" r=".5" fill="currentColor"/></>),
    plug:      (<><path d="M9 2v4M15 2v4"/><path d="M7 6h10v6a5 5 0 0 1-10 0z"/><path d="M12 17v5"/></>),
    cloud:     (<><path d="M7 18a5 5 0 0 1 1-9.9 6 6 0 0 1 11.5 2A4 4 0 0 1 18 18z"/></>),
    bell:      (<><path d="M6 8a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9z"/><path d="M10 21a2 2 0 0 0 4 0"/></>),
    command:   (<><path d="M9 9h6v6H9z"/><path d="M9 9V6a3 3 0 1 0-3 3h3zM15 9V6a3 3 0 1 1 3 3h-3zM9 15v3a3 3 0 1 1-3-3h3zM15 15v3a3 3 0 1 0 3-3h-3z"/></>),
    eye:       (<><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></>),
    pin:       (<><path d="M12 17v5"/><path d="M8 2h8l-1 6 3 4H6l3-4z"/></>),
    more:      (<><circle cx="5" cy="12" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="19" cy="12" r="1.2" fill="currentColor"/></>),
    bookmark:  (<><path d="M7 3h10v18l-5-4-5 4z"/></>),
    sun:       (<><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>),
    moon:      (<><path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z"/></>),
    sidebar:   (<><rect x="3" y="4" width="18" height="16" rx="1"/><path d="M9 4v16"/></>),
  };
  return <svg {...common}>{paths[name] || null}</svg>;
};

const Chip = ({ children, kind, dot = true }) => (
  <span className={"chip " + (dot ? "chip--dot " : "") + (kind ? "chip--" + kind : "")}>
    {children}
  </span>
);

const Tag = ({ children }) => <span className="chip">{children}</span>;

const Progress = ({ pct, kind }) => (
  <div className={"progress " + (kind || "")}>
    <span style={{ width: Math.max(0, Math.min(100, pct)) + "%" }} />
  </div>
);

const Switch = ({ on, onChange }) => (
  <div className={"switch" + (on ? " is-on" : "")} onClick={() => onChange && onChange(!on)} role="switch" aria-checked={on} tabIndex={0} />
);

const Segmented = ({ value, onChange, options }) => (
  <div className="segmented">
    {options.map((o) => (
      <button
        key={o.v}
        className={value === o.v ? "is-active" : ""}
        onClick={() => onChange && onChange(o.v)}
        title={o.title || o.label}
      >
        {o.icon ? <Icon name={o.icon} size={13} /> : null}
        {o.label ? <span>{o.label}</span> : null}
      </button>
    ))}
  </div>
);

/* Cover placeholder — diagonal stripes tinted by hue + title overlay */
const Cover = ({ title, hue = 220, code, badge, kind = "stripes" }) => {
  const tint = `oklch(0.45 0.15 ${hue})`;
  // Two-letter code for top-left
  const initials = code || (title || "??").split(" ").filter(w => /[A-Za-z]/.test(w[0])).slice(0, 2).map(w => w[0].toUpperCase()).join("");
  return (
    <div className="cover" style={{ "--cover-tint": tint }}>
      <div className="cover__bg" />
      <div className="cover__veil" />
      <div className="cover__mark">{initials}</div>
      {badge ? <div className="cover__badge">{badge}</div> : null}
      <div className="cover__title">{title}</div>
    </div>
  );
};

const MiniCover = ({ hue = 220 }) => (
  <span className="mini-cover" style={{
    background: `repeating-linear-gradient(135deg, oklch(0.45 0.15 ${hue} / 0.7) 0 3px, oklch(0.28 0.10 ${hue} / 0.7) 3px 6px)`
  }} />
);

/* Simple sparkline from number array */
const Sparkline = ({ data, color = "var(--accent)", height = 32 }) => {
  if (!data || !data.length) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const w = 100, h = height;
  const step = w / (data.length - 1 || 1);
  const pts = data.map((v, i) => {
    const x = i * step;
    const y = h - ((v - min) / (max - min || 1)) * (h - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return (
    <svg className="spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={pts} />
    </svg>
  );
};

Object.assign(window, { Icon, Chip, Tag, Progress, Switch, Segmented, Cover, MiniCover, Sparkline });
