const natural = require('natural');

const stemmer = natural.PorterStemmer;

const STOPWORDS = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'is', 'was', 'are', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does',
    'did', 'will', 'would', 'could', 'should', 'may', 'might', 'shall', 'can', 'this',
    'that', 'these', 'those', 'it', 'its', 'from', 'by', 'as', 'not', 'no', 'so',
]);

const tokenizer = new natural.WordTokenizer();

/**
 * Normalize a raw query into stemmed tokens.
 * @param {string} rawQuery
 * @returns {string[]} stemmed tokens
 */
const normalizeQuery = (rawQuery) => {
    const tokens = tokenizer.tokenize(rawQuery.toLowerCase());
    const filtered = tokens.filter((t) => t.length > 2 && !STOPWORDS.has(t));
    return filtered.map((t) => stemmer.stem(t));
};

/**
 * Rank documents for a set of query tokens using TF-IDF.
 *
 * @param {string[]} tokens   - stemmed query tokens
 * @param {object[]} indexEntries - array of Index documents from MongoDB
 * @param {number}   totalDocs    - total number of crawled documents (N)
 * @returns {Array<{url, score, snippet?}>} sorted descending by TF-IDF score
 */
const rank = (tokens, indexEntries, totalDocs) => {
    const scores = {};  // url → cumulative TF-IDF score

    for (const entry of indexEntries) {
        const idf = Math.log((totalDocs + 1) / (entry.df + 1)) + 1;  // smoothed IDF

        for (const doc of entry.documents) {
            const tfidf = doc.tf * idf;
            if (!scores[doc.url]) scores[doc.url] = { url: doc.url, score: 0 };
            scores[doc.url].score += tfidf;
        }
    }

    // Sort descending by cumulative TF-IDF score
    return Object.values(scores).sort((a, b) => b.score - a.score);
};

module.exports = { normalizeQuery, rank };
