const express = require('express');
const router = express.Router();
const {
    startCrawl,
    getCrawlStatus,
    getAllCrawls,
    deleteCrawl,
} = require('../controllers/crawlerController');

// POST   /api/crawler/start        → Start a crawl from seed URL
router.post('/start', startCrawl);

// GET    /api/crawler/all          → Get all crawl records (paginated)
router.get('/all', getAllCrawls);

// GET    /api/crawler/status/:id   → Get status of a specific crawl
router.get('/status/:id', getCrawlStatus);

// DELETE /api/crawler/:id          → Delete a crawl record
router.delete('/:id', deleteCrawl);

module.exports = router;
