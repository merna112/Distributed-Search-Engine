const getDomain = (url) => {
    try {
        return new URL(url).hostname;
    } catch {
        return url;
    }
};

const ResultCard = ({ result, rank }) => {
    const { url, title, snippet, score, crawledAt } = result;
    const domain = getDomain(url);

    const crawledDate = crawledAt
        ? new Date(crawledAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
        : null;

    return (
        <a
            className="result-card"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            id={`result-${rank}`}
        >
            <span className="result-rank">#{rank}</span>

            {/* Domain line */}
            <div className="result-domain">
                <img
                    className="result-favicon"
                    src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                    alt=""
                    onError={(e) => { e.target.style.display = 'none'; }}
                />
                <span>{domain}</span>
                {crawledDate && <span>· {crawledDate}</span>}
            </div>

            {/* Title */}
            <div className="result-title">{title || url}</div>

            {/* Snippet */}
            {snippet && <p className="result-snippet">{snippet}</p>}

            {/* TF-IDF score badge */}
            <span className="result-score">
                ⚡ TF-IDF {score}
            </span>
        </a>
    );
};

export default ResultCard;
