import { useState, useCallback } from 'react';
import SearchBar from '../components/SearchBar';
import ResultsList from '../components/ResultsList';
import { search, startCrawl, buildIndex } from '../services/api';

const INITIAL_STATE = {
    results: [],
    total: 0,
    page: 1,
    pages: 0,
    responseTimeMs: null,
    query: '',
    tokens: [],
};

const SearchPage = () => {
    const [searchState, setSearchState] = useState(INITIAL_STATE);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);

    // Crawler panel state
    const [crawlUrl, setCrawlUrl] = useState('');
    const [crawlDepth, setCrawlDepth] = useState(1);
    const [crawlLoading, setCrawlLoading] = useState(false);
    const [crawlMsg, setCrawlMsg] = useState(null);

    // Indexer state
    const [indexLoading, setIndexLoading] = useState(false);
    const [indexMsg, setIndexMsg] = useState(null);

    // ── Search ──────────────────────────────────────────────────
    const handleSearch = useCallback(async (query, page = 1) => {
        setLoading(true);
        setError(null);
        setHasSearched(true);

        try {
            const data = await search(query, page);
            setSearchState({
                results: data.data.results,
                total: data.data.total,
                page: data.data.page,
                pages: data.data.pages,
                responseTimeMs: data.data.responseTimeMs,
                query: data.data.query,
                tokens: data.data.tokens,
            });
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Search failed';
            setError(msg);
        } finally {
            setLoading(false);
        }
    }, []);

    const handlePageChange = (newPage) => {
        handleSearch(searchState.query, newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ── Crawler ──────────────────────────────────────────────────
    const handleCrawl = async () => {
        if (!crawlUrl.trim()) {
            setCrawlMsg({ type: 'error', text: 'Please enter a URL' });
            return;
        }
        setCrawlLoading(true);
        setCrawlMsg(null);
        try {
            await startCrawl(crawlUrl.trim(), crawlDepth);
            setCrawlMsg({ type: 'success', text: `✓ Crawl started for ${crawlUrl.trim()} (depth ${crawlDepth})` });
            setCrawlUrl('');
        } catch (err) {
            setCrawlMsg({ type: 'error', text: err.response?.data?.message || 'Crawl failed' });
        } finally {
            setCrawlLoading(false);
        }
    };

    // ── Indexer ──────────────────────────────────────────────────
    const handleBuildIndex = async () => {
        setIndexLoading(true);
        setIndexMsg(null);
        try {
            const res = await buildIndex();
            setIndexMsg({
                type: 'success',
                text: `✓ Index built — ${res.data.documentsProcessed} docs processed, ${res.data.totalTermsAdded} new terms`,
            });
        } catch (err) {
            setIndexMsg({ type: 'error', text: err.response?.data?.message || 'Indexing failed' });
        } finally {
            setIndexLoading(false);
        }
    };

    const showEmpty = hasSearched && !loading && searchState.results.length === 0 && !error;

    return (
        <div className="page">
            {/* ── Hero ── */}
            <div className="hero">
                <div className="hero-badge">🕸 MERN · MVC · TF-IDF</div>
                <h1 className="hero-title">Distributed<br />Search Engine</h1>
                <p className="hero-subtitle">
                    Crawl, index, and search the web with TF-IDF ranking —
                    built on the MERN stack with strict MVC architecture.
                </p>
            </div>

            {/* ── Search Bar ── */}
            <SearchBar onSearch={handleSearch} loading={loading} />

            {/* ── Stats ── */}
            {searchState.tokens.length > 0 && (
                <div className="stats-row">
                    <span>
                        <span className="stats-dot" />
                        Tokens: {searchState.tokens.join(', ')}
                    </span>
                </div>
            )}

            {/* ── Loading ── */}
            {loading && (
                <div className="spinner-wrap">
                    <div className="spinner" />
                    <span className="spinner-label">Ranking results…</span>
                </div>
            )}

            {/* ── Error ── */}
            {error && !loading && (
                <div className="results-section">
                    <div className="state-box">
                        <span className="state-icon">⚠️</span>
                        <p className="state-title">Something went wrong</p>
                        <p className="state-msg">{error}</p>
                    </div>
                </div>
            )}

            {/* ── No Results ── */}
            {showEmpty && (
                <div className="results-section">
                    <div className="state-box">
                        <span className="state-icon">🔎</span>
                        <p className="state-title">No results found</p>
                        <p className="state-msg">
                            No indexed pages match &ldquo;{searchState.query}&rdquo;. Try crawling some URLs first, then build the index.
                        </p>
                    </div>
                </div>
            )}

            {/* ── Results ── */}
            {!loading && (
                <ResultsList
                    results={searchState.results}
                    total={searchState.total}
                    page={searchState.page}
                    pages={searchState.pages}
                    responseTimeMs={searchState.responseTimeMs}
                    onPageChange={handlePageChange}
                />
            )}

            {/* ── Divider ── */}
            <div className="divider" />

            {/* ── Crawler Panel ── */}
            <div className="panel" id="crawler-panel">
                <p className="panel-title">🕷 Crawler</p>
                <div className="crawler-form">
                    <input
                        id="crawl-url-input"
                        className="crawler-input"
                        type="url"
                        placeholder="https://example.com"
                        value={crawlUrl}
                        onChange={(e) => setCrawlUrl(e.target.value)}
                    />
                    <select
                        id="crawl-depth-select"
                        className="crawler-input"
                        style={{ flex: '0 0 120px' }}
                        value={crawlDepth}
                        onChange={(e) => setCrawlDepth(Number(e.target.value))}
                    >
                        <option value={0}>Depth 0</option>
                        <option value={1}>Depth 1</option>
                        <option value={2}>Depth 2</option>
                        <option value={3}>Depth 3</option>
                    </select>
                    <button
                        id="crawl-btn"
                        className="btn-accent"
                        onClick={handleCrawl}
                        disabled={crawlLoading}
                    >
                        {crawlLoading ? 'Crawling…' : 'Crawl'}
                    </button>
                </div>
                {crawlMsg && (
                    <div className={`toast ${crawlMsg.type}`}>{crawlMsg.text}</div>
                )}
            </div>

            {/* ── Indexer Panel ── */}
            <div className="panel" id="indexer-panel" style={{ marginTop: 20 }}>
                <p className="panel-title">📚 Indexer</p>
                <div className="crawler-form">
                    <button
                        id="build-index-btn"
                        className="btn-accent"
                        onClick={handleBuildIndex}
                        disabled={indexLoading}
                    >
                        {indexLoading ? 'Building Index…' : 'Build Index'}
                    </button>
                    <span className="btn-secondary" style={{ cursor: 'default', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Processes all crawled pages → TF-IDF inverted index
                    </span>
                </div>
                {indexMsg && (
                    <div className={`toast ${indexMsg.type}`}>{indexMsg.text}</div>
                )}
            </div>

            {/* ── Footer ── */}
            <footer className="footer">
                Distributed Search Engine · MERN Stack · MVC Pattern
            </footer>
        </div>
    );
};

export default SearchPage;
