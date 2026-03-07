const express = require('express');
const router = express.Router();
const { buildIndex, getIndexEntry, getIndexStats } = require('../controllers/indexerController');

// POST  /api/indexer/build          → Build / rebuild inverted index
router.post('/build', buildIndex);

// GET   /api/indexer/stats          → Index statistics
router.get('/stats', getIndexStats);

// GET   /api/indexer/term/:term     → Look up a term in the index
router.get('/term/:term', getIndexEntry);

module.exports = router;
