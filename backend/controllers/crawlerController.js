const fetch = require('node-fetch');
const cheerio = require('cheerio');
const Crawl = require('../models/Crawl');

// Helper: extract text and links from HTML
const parseHTML = (html, baseUrl) => {
    const $ = cheerio.load(html);

    // Extract visible text
    $('script, style, noscript, nav, footer').remove();
    const content = $('body').text().replace(/\s+/g, ' ').trim();

    // Extract links
    const links = [];
    $('a[href]').each((_, el) => {
        try {
            const href = $(el).attr('href');
            const absolute = new URL(href, baseUrl).href;
            if (absolute.startsWith('http')) links.push(absolute);
        } catch (_) { }
    });

    return { content, links: [...new Set(links)] };
};

// Helper: BFS crawl up to a given depth
const crawlBFS = async (seedUrl, maxDepth) => {
    const queue = [{ url: seedUrl, depth: 0 }];
    const visited = new Set();

    while (queue.length > 0) {
        const { url, depth } = queue.shift();

        if (visited.has(url) || depth > maxDepth) continue;
        visited.add(url);

        // Check if already in DB
        const existing = await Crawl.findOne({ url });
        if (existing && existing.status === 'crawled') continue;

        // Upsert a pending record
        await Crawl.findOneAndUpdate(
            { url },
            { url, status: 'pending', depth },
            { upsert: true, new: true }
        );

        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 10000);

            const response = await fetch(url, {
                signal: controller.signal,
                headers: { 'User-Agent': 'DistributedSearchBot/1.0' },
            });
            clearTimeout(timeout);

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const html = await response.text();
            const { content, links } = parseHTML(html, url);

            await Crawl.findOneAndUpdate(
                { url },
                { content, links, status: 'crawled', crawledAt: new Date() },
                { new: true }
            );

            // Enqueue child links for next depth
            if (depth < maxDepth) {
                for (const link of links.slice(0, 10)) {
                    if (!visited.has(link)) queue.push({ url: link, depth: depth + 1 });
                }
            }
        } catch (err) {
            await Crawl.findOneAndUpdate(
                { url },
                { status: 'failed', errorMessage: err.message },
                { new: true }
            );
        }
    }
};

// @desc  Start a crawl job from a seed URL
// @route POST /api/crawler/start
// @access Public
const startCrawl = async (req, res) => {
    try {
        const { url, depth = 1 } = req.body;

        if (!url) {
            return res.status(400).json({ success: false, message: 'URL is required' });
        }

        // Validate URL
        try {
            new URL(url);
        } catch {
            return res.status(400).json({ success: false, message: 'Invalid URL format' });
        }

        // Run crawl asynchronously (don't await — respond immediately)
        crawlBFS(url, Math.min(depth, 3)).catch(console.error);

        return res.status(202).json({
            success: true,
            message: 'Crawl job started',
            data: { seedUrl: url, maxDepth: depth },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// @desc  Get status of a specific crawl by ID
// @route GET /api/crawler/status/:id
// @access Public
const getCrawlStatus = async (req, res) => {
    try {
        const crawl = await Crawl.findById(req.params.id).select('-content');
        if (!crawl) {
            return res.status(404).json({ success: false, message: 'Crawl record not found' });
        }
        return res.json({ success: true, data: crawl });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// @desc  Get all crawled pages (paginated)
// @route GET /api/crawler/all
// @access Public
const getAllCrawls = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const [crawls, total] = await Promise.all([
            Crawl.find().select('-content').sort({ createdAt: -1 }).skip(skip).limit(limit),
            Crawl.countDocuments(),
        ]);

        return res.json({
            success: true,
            data: crawls,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// @desc  Delete a crawl record
// @route DELETE /api/crawler/:id
// @access Public
const deleteCrawl = async (req, res) => {
    try {
        const crawl = await Crawl.findByIdAndDelete(req.params.id);
        if (!crawl) {
            return res.status(404).json({ success: false, message: 'Crawl record not found' });
        }
        return res.json({ success: true, message: 'Crawl record deleted' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { startCrawl, getCrawlStatus, getAllCrawls, deleteCrawl };
