import { useRef } from 'react';

const SearchBar = ({ onSearch, loading }) => {
    const inputRef = useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        const val = inputRef.current.value.trim();
        if (val) onSearch(val);
    };

    return (
        <div className="search-wrapper">
            <form className="search-form" onSubmit={handleSubmit} id="search-form">
                <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>🔍</span>
                <input
                    id="search-input"
                    ref={inputRef}
                    className="search-input"
                    type="text"
                    placeholder="Search the web…"
                    autoComplete="off"
                    autoFocus
                />
                <button
                    id="search-btn"
                    className="search-btn"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <span
                                style={{
                                    width: 14,
                                    height: 14,
                                    border: '2px solid rgba(255,255,255,0.4)',
                                    borderTopColor: '#fff',
                                    borderRadius: '50%',
                                    display: 'inline-block',
                                    animation: 'spin 0.6s linear infinite',
                                }}
                            />
                            Searching…
                        </>
                    ) : (
                        'Search'
                    )}
                </button>
            </form>
        </div>
    );
};

export default SearchBar;
