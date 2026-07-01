import { useState, useRef, useEffect, type FormEvent, type CSSProperties } from 'react';
import { searchShows } from './services/streamingApi';
import type { Show, StreamingOption } from './types/streaming';

// ─── design tokens ────────────────────────────────────────────────────────────
const C = {
  bg: '#0d0d0d',
  surface: '#161616',
  surfaceHover: '#1e1e1e',
  border: '#2a2a2a',
  accent: '#d4f542',
  accentDim: 'rgba(212,245,66,0.12)',
  text: '#f0f0f0',
  muted: '#888',
  red: '#e53935',
} as const;

// ─── service brand colours (fallback when API doesn't provide one) ─────────────
const SERVICE_COLORS: Record<string, string> = {
  netflix: '#E50914',
  prime: '#00A8E1',
  amazon: '#00A8E1',
  disney: '#113CCF',
  appletv: '#555',
  apple: '#555',
  canal: '#EE0000',
  showmax: '#EE0000',
  hulu: '#1CE783',
  hbo: '#5822F6',
  max: '#5822F6',
  paramount: '#0064FF',
  peacock: '#0040FF',
  mubi: '#FF6B35',
};

function serviceColor(serviceId: string, themeColor?: string): string {
  if (themeColor && themeColor !== '#000000') return themeColor;
  const key = serviceId.toLowerCase().replace(/[^a-z]/g, '');
  for (const [k, v] of Object.entries(SERVICE_COLORS)) {
    if (key.includes(k)) return v;
  }
  return '#555';
}

function typeBadgeStyle(type: StreamingOption['type']): CSSProperties {
  const styles: Record<string, CSSProperties> = {
    subscription: { background: 'rgba(46,204,113,0.18)', color: '#2ecc71' },
    free: { background: `rgba(212,245,66,0.18)`, color: C.accent },
    rent: { background: 'rgba(52,152,219,0.18)', color: '#3498db' },
    buy: { background: 'rgba(155,89,182,0.18)', color: '#9b59b6' },
    addon: { background: 'rgba(230,126,34,0.18)', color: '#e67e22' },
  };
  return styles[type] ?? styles.subscription;
}

// ─── ShowCard ─────────────────────────────────────────────────────────────────
function ShowCard({ show }: { show: Show }) {
  const [imgError, setImgError] = useState(false);
  const poster = show.imageSet?.verticalPoster?.w360;
  const zaOptions = show.streamingOptions?.za ?? [];
  const isAvailable = zaOptions.length > 0;

  // deduplicate streaming options by service id
  const seen = new Set<string>();
  const unique = zaOptions.filter((o) => {
    const key = o.service.id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const rating = show.rating ? (show.rating / 10).toFixed(1) : null;
  const meta = [
    show.releaseYear,
    show.showType === 'series'
      ? show.seasonCount
        ? `${show.seasonCount}S`
        : 'Series'
      : show.runtime
        ? `${show.runtime}m`
        : 'Movie',
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div style={styles.card}>
      {/* poster */}
      <div style={styles.posterWrap}>
        {poster && !imgError ? (
          <img
            src={poster}
            alt={show.title}
            style={styles.poster}
            onError={() => setImgError(true)}
          />
        ) : (
          <div style={styles.posterFallback}>
            <span style={{ fontSize: 36, opacity: 0.3 }}>🎬</span>
          </div>
        )}
        {rating && (
          <div style={styles.ratingBadge}>
            ★ {rating}
          </div>
        )}
        {!isAvailable && (
          <div style={styles.unavailableOverlay}>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5 }}>
              NOT IN ZA
            </span>
          </div>
        )}
      </div>

      {/* info */}
      <div style={styles.cardBody}>
        <p style={styles.cardTitle}>{show.title}</p>
        <p style={styles.cardMeta}>{meta}</p>

        {isAvailable ? (
          <div style={styles.pillsRow}>
            {unique.map((opt) => {
              const bg = serviceColor(opt.service.id, opt.service.themeColorCode);
              return (
                <a
                  key={opt.service.id + opt.type}
                  href={opt.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ ...styles.servicePill, background: bg }}
                  title={`${opt.service.name} · ${opt.type}`}
                >
                  {opt.service.name}
                  <span style={{ ...typeBadgeStyle(opt.type), ...styles.typeTag }}>
                    {opt.type}
                  </span>
                </a>
              );
            })}
          </div>
        ) : (
          <p style={{ ...styles.cardMeta, color: C.red, marginTop: 6 }}>
            Not available in South Africa
          </p>
        )}
      </div>
    </div>
  );
}

// ─── StreamCheck app ──────────────────────────────────────────────────────────
export default function StreamCheck() {
  const [query, setQuery] = useState('');
  const [shows, setShows] = useState<Show[]>([]);
  const [filter, setFilter] = useState<'all' | 'movie' | 'series'>('all');
  const [loading, setLoading] = useState(false);
  const [loadSecs, setLoadSecs] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading) { setLoadSecs(0); return; }
    const t = setInterval(() => setLoadSecs((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [loading]);

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const results = await searchShows(query);
      setShows(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setShows([]);
    } finally {
      setLoading(false);
    }
  }

  const movieCount  = shows.filter((s) => s.showType === 'movie').length;
  const seriesCount = shows.filter((s) => s.showType === 'series').length;
  const visible = filter === 'all' ? shows : shows.filter((s) => s.showType === filter);
  const zaAvailable = visible.filter((s) => (s.streamingOptions?.za?.length ?? 0) > 0).length;

  return (
    <div style={styles.root}>
      {/* header */}
      <header style={styles.header}>
        <div style={styles.logo}>
          <span style={styles.logoAccent}>Stream</span>
          <span style={styles.logoWhite}>Check</span>
          <span style={styles.logoFlag}>🇿🇦</span>
        </div>
        <p style={styles.tagline}>Find what's streaming in South Africa</p>
      </header>

      {/* search bar */}
      <form onSubmit={handleSearch} style={styles.searchForm}>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movies & shows…"
          style={styles.searchInput}
          autoFocus
          autoComplete="off"
          spellCheck={false}
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          style={{
            ...styles.searchBtn,
            ...(loading || !query.trim() ? styles.searchBtnDisabled : {}),
          }}
        >
          {loading ? `${loadSecs}s…` : 'Search'}
        </button>
      </form>

      {/* filter tabs */}
      {searched && !loading && !error && shows.length > 0 && (
        <div style={styles.filterRow}>
          {([
            { key: 'all',    label: 'All',    count: shows.length },
            { key: 'movie',  label: 'Movies', count: movieCount },
            { key: 'series', label: 'Series', count: seriesCount },
          ] as const).map((tab) => {
            const active = filter === tab.key;
            const disabled = tab.count === 0;
            return (
              <button
                key={tab.key}
                onClick={() => !disabled && setFilter(tab.key)}
                disabled={disabled}
                style={{
                  ...styles.filterTab,
                  ...(active ? styles.filterTabActive : {}),
                  ...(disabled ? styles.filterTabDisabled : {}),
                }}
              >
                {tab.label}
                <span style={{ ...styles.filterCount, ...(active ? styles.filterCountActive : {}) }}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* status bar */}
      {searched && !loading && !error && (
        <p style={styles.statusBar}>
          {shows.length === 0
            ? 'No results found.'
            : `${visible.length} showing · `}
          {shows.length > 0 && (
            <span>
              <span style={{ color: C.accent }}>{zaAvailable}</span> available in ZA
            </span>
          )}
        </p>
      )}

      {/* error */}
      {error && (
        <div style={styles.errorBox}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* results grid */}
      {visible.length > 0 && (
        <div style={styles.grid}>
          {visible.map((show) => (
            <ShowCard key={show.id} show={show} />
          ))}
        </div>
      )}

      {/* empty state */}
      {!searched && (
        <div style={styles.emptyState}>
          <p style={{ color: C.muted, fontSize: 15 }}>
            Type a title above and press Search to find streaming options in South Africa.
          </p>
          <div style={styles.suggestionsRow}>
            {['Dexter', 'Squid Game', 'The Boys', 'Interstellar'].map((s) => (
              <button
                key={s}
                style={styles.suggestionChip}
                onClick={() => {
                  setQuery(s);
                  setTimeout(() => inputRef.current?.form?.requestSubmit(), 50);
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── styles ───────────────────────────────────────────────────────────────────
const styles: Record<string, CSSProperties> = {
  root: {
    minHeight: '100vh',
    background: C.bg,
    color: C.text,
    fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
    padding: '0 16px 60px',
  },
  header: {
    textAlign: 'center',
    padding: '52px 0 32px',
  },
  logo: {
    fontSize: 40,
    fontWeight: 800,
    letterSpacing: -1,
    lineHeight: 1,
    marginBottom: 8,
  },
  logoAccent: { color: C.accent },
  logoWhite: { color: C.text },
  logoFlag: { marginLeft: 8, fontSize: 32 },
  tagline: {
    color: C.muted,
    fontSize: 15,
    margin: 0,
  },
  searchForm: {
    display: 'flex',
    gap: 10,
    maxWidth: 560,
    margin: '0 auto 20px',
  },
  searchInput: {
    flex: 1,
    background: C.surface,
    border: `1.5px solid ${C.border}`,
    borderRadius: 10,
    color: C.text,
    fontSize: 16,
    padding: '12px 16px',
    outline: 'none',
    transition: 'border-color 0.15s',
  },
  searchBtn: {
    background: C.accent,
    color: '#0d0d0d',
    border: 'none',
    borderRadius: 10,
    fontWeight: 700,
    fontSize: 15,
    padding: '12px 24px',
    cursor: 'pointer',
    transition: 'opacity 0.15s',
  },
  searchBtnDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  filterRow: {
    display: 'flex',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  filterTab: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: 'transparent',
    border: `1.5px solid ${C.border}`,
    color: C.text,
    borderRadius: 20,
    padding: '6px 14px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  filterTabActive: {
    background: C.accent,
    color: '#0d0d0d',
    borderColor: C.accent,
  },
  filterTabDisabled: {
    opacity: 0.35,
    cursor: 'not-allowed',
  },
  filterCount: {
    background: C.border,
    color: C.muted,
    fontSize: 11,
    fontWeight: 700,
    padding: '1px 7px',
    borderRadius: 10,
    minWidth: 20,
    textAlign: 'center' as const,
  },
  filterCountActive: {
    background: 'rgba(13,13,13,0.25)',
    color: '#0d0d0d',
  },
  statusBar: {
    textAlign: 'center',
    color: C.muted,
    fontSize: 14,
    marginBottom: 24,
  },
  errorBox: {
    background: 'rgba(229,57,53,0.12)',
    border: '1px solid rgba(229,57,53,0.3)',
    color: '#ef9a9a',
    borderRadius: 10,
    padding: '12px 16px',
    maxWidth: 560,
    margin: '0 auto 24px',
    fontSize: 14,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: 16,
    maxWidth: 1200,
    margin: '0 auto',
  },
  card: {
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: 12,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.15s, border-color 0.15s',
    cursor: 'default',
  },
  posterWrap: {
    position: 'relative',
    paddingTop: '150%', // 2:3 aspect ratio
    background: '#111',
    overflow: 'hidden',
  },
  poster: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  posterFallback: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#1a1a1a',
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    background: 'rgba(0,0,0,0.75)',
    color: C.accent,
    fontSize: 11,
    fontWeight: 700,
    padding: '3px 7px',
    borderRadius: 6,
    backdropFilter: 'blur(4px)',
  },
  unavailableOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'rgba(229,57,53,0.8)',
    color: '#fff',
    textAlign: 'center',
    padding: '5px 0',
    fontSize: 10,
  },
  cardBody: {
    padding: '10px 12px 12px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  cardTitle: {
    margin: 0,
    fontWeight: 600,
    fontSize: 14,
    color: C.text,
    lineHeight: 1.3,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  } as CSSProperties,
  cardMeta: {
    margin: 0,
    fontSize: 12,
    color: C.muted,
  },
  pillsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 6,
  },
  servicePill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '3px 8px',
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 600,
    color: '#fff',
    textDecoration: 'none',
    lineHeight: 1.4,
    whiteSpace: 'nowrap' as const,
  },
  typeTag: {
    fontSize: 9,
    fontWeight: 700,
    padding: '1px 5px',
    borderRadius: 4,
    letterSpacing: 0.3,
    textTransform: 'uppercase' as const,
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 16px',
  },
  suggestionsRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: 10,
    flexWrap: 'wrap',
    marginTop: 20,
  },
  suggestionChip: {
    background: C.accentDim,
    border: `1px solid rgba(212,245,66,0.25)`,
    color: C.accent,
    borderRadius: 20,
    padding: '6px 16px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
};
