import ResultCard from './ResultCard';

const ResultsList = ({ results, total, page, pages, responseTimeMs, onPageChange }) => {
    if (!results || results.length === 0) return null;

    const startRank = (page - 1) * 10 + 1;

    return (
        <div className="results-section" id="results-section">
            {/* Header */}
            <div className="results-header">
                <p className="results-count">
                    About <strong>{total.toLocaleString()}</strong> result{total !== 1 ? 's' : ''}
                </p>
                {responseTimeMs != null && (
                    <span className="results-time">({(responseTimeMs / 1000).toFixed(3)} seconds)</span>
                )}
            </div>

            {/* Cards */}
            {results.map((result, i) => (
                <ResultCard key={result.url} result={result} rank={startRank + i} />
            ))}

            {/* Pagination */}
            {pages > 1 && (
                <div className="pagination" id="pagination">
                    <button
                        className="page-btn"
                        disabled={page <= 1}
                        onClick={() => onPageChange(page - 1)}
                    >
                        ← Prev
                    </button>

                    {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
                        const p = i + 1;
                        return (
                            <button
                                key={p}
                                className={`page-btn${page === p ? ' active' : ''}`}
                                onClick={() => onPageChange(p)}
                            >
                                {p}
                            </button>
                        );
                    })}

                    <button
                        className="page-btn"
                        disabled={page >= pages}
                        onClick={() => onPageChange(page + 1)}
                    >
                        Next →
                    </button>
                </div>
            )}
        </div>
    );
};

export default ResultsList;
