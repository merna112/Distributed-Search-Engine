const natural = require('natural');
const Crawl = require('../models/Crawl');
const Index = require('../models/Index');

const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;

// Common English stopwords
const STOPWORDS = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'is', 'was', 'are', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does',
    'did', 'will', 'would', 'could', 'should', 'may', 'might', 'shall', 'can', 'this',
    'that', 'these', 'those', 'it', 'its', 'from', 'by', 'as', 'not', 'no', 'so',
]);

// Tokenize, remove stopwords, and stem all tokens
const processText = (text) => {
    const tokens = tokenizer.tokenize(text.toLowerCase());
    return tokens.filter((t) => t.length > 2 && !STOPWORDS.has(t));
};

// Compute Term Frequency for a token list
const computeTF = (tokens, term) => {
    const count = tokens.filter((t) => t === term).length;
    return count / tokens.length;
};

// Build the inverted index from all crawled (not-yet-indexed) documents
const buildIndex = async (req, res) => {
    try {
        const crawls = await Crawl.find({ status: 'crawled', content: { $ne: '' } });

        if (crawls.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No crawled documents available to index',
            });
        }

        let termsIndexed = 0;

        for (const crawl of crawls) {
            const rawTokens = processText(crawl.content);
            const stemTokens = rawTokens.map((t) => stemmer.stem(t));
            const uniqueTerms = [...new Set(stemTokens)];

            for (const term of uniqueTerms) {
                const tf = computeTF(stemTokens, term);
                const positions = stemTokens.reduce((acc, t, i) => {
                    if (t === term) acc.push(i);
                    return acc;
                }, []);

                const docEntry = {
                    url: crawl.url,
                    tf,
                    positions,
                    totalTerms: stemTokens.length,
                };

                // Upsert: add or update this doc in the term's posting list
                const existing = await Index.findOne({ term });

                if (existing) {
                    const docIndex = existing.documents.findIndex((d) => d.url === crawl.url);
                    if (docIndex >= 0) {
                        existing.documents[docIndex] = docEntry;
                    } else {
                        existing.documents.push(docEntry);
                    }
                    existing.df = existing.documents.length;
                    await existing.save();
                } else {
                    await Index.create({ term, documents: [docEntry], df: 1 });
                    termsIndexed++;
                }
            }
        }

        return res.json({
            success: true,
            message: 'Index built successfully',
            data: {
                documentsProcessed: crawls.length,
                totalTermsAdded: termsIndexed,
            },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// @desc  Get index entry for a specific term
// @route GET /api/indexer/term/:term
const getIndexEntry = async (req, res) => {
    try {
        const term = stemmer.stem(req.params.term.toLowerCase().trim());
        const entry = await Index.findOne({ term });

        if (!entry) {
            return res.status(404).json({ success: false, message: `Term "${req.params.term}" not in index` });
        }

        return res.json({ success: true, data: entry });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// @desc  Get index stats
// @route GET /api/indexer/stats
const getIndexStats = async (req, res) => {
    try {
        const totalTerms = await Index.countDocuments();
        const totalDocs = await Crawl.countDocuments({ status: 'crawled' });
        return res.json({ success: true, data: { totalTerms, totalDocuments: totalDocs } });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { buildIndex, getIndexEntry, getIndexStats };
