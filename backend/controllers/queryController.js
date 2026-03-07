const Crawl = require('../models/Crawl');
const Index = require('../models/Index');
const Query = require('../models/Query');
const { normalizeQuery, rank } = require('../services/ranker');

// @desc  Process a search query and return ranked results
// @route POST /api/query/search
const processQuery = async (req, res) => {
    const startTime = Date.now();

    try {
        const { query, page = 1, limit = 10 } = req.body;

        if (!query || !query.trim()) {
            return res.status(400).json({ success: false, message: 'Query is required' });
        }

        // 1. Normalize query into stemmed tokens
        const tokens = normalizeQuery(query);

        if (tokens.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Query contains only stopwords or is too short',
            });
        }

        // 2. Fetch index entries for each token
        const indexEntries = await Index.find({ term: { $in: tokens } });

        if (indexEntries.length === 0) {
            // Save the query log even if no results
            await Query.create({ rawQuery: query, tokens, resultCount: 0, responseTimeMs: Date.now() - startTime });
            return res.json({
                success: true,
                data: { results: [], total: 0, page, query, tokens },
            });
        }

        // 3. Get total document count for IDF calculation
        const totalDocs = await Crawl.countDocuments({ status: 'crawled' });

        // 4. Rank results
        const ranked = rank(tokens, indexEntries, totalDocs);
        const total = ranked.length;

        // 5. Paginate
        const skip = (page - 1) * limit;
        const paged = ranked.slice(skip, skip + limit);

        // 6. Enrich with crawl metadata (title/snippet)
        const urlList = paged.map((r) => r.url);
        const crawls = await Crawl.find({ url: { $in: urlList } }).select('url content crawledAt');
        const crawlMap = Object.fromEntries(crawls.map((c) => [c.url, c]));

        const results = paged.map(({ url, score }) => {
            const crawl = crawlMap[url] || {};
            const content = crawl.content || '';
            const snippet = content.length > 200 ? content.slice(0, 200) + '…' : content;
            // Use first line / first sentence as a rough "title"
            const title = content.split(/[\n.!?]/)[0].slice(0, 80) || url;
            return { url, score: +score.toFixed(4), title, snippet, crawledAt: crawl.crawledAt };
        });

        const responseTimeMs = Date.now() - startTime;

        // 7. Persist query log
        await Query.create({ rawQuery: query, tokens, resultCount: total, responseTimeMs });

        return res.json({
            success: true,
            data: {
                results,
                total,
                page,
                pages: Math.ceil(total / limit),
                query,
                tokens,
                responseTimeMs,
            },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// @desc  Get recent query history
// @route GET /api/query/history
const getQueryHistory = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const queries = await Query.find().sort({ createdAt: -1 }).limit(limit);
        return res.json({ success: true, data: queries });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { processQuery, getQueryHistory };
