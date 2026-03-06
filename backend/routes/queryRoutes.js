const express = require('express');
const router = express.Router();
const { processQuery, getQueryHistory } = require('../controllers/queryController');

// POST  /api/query/search     → Process search query, return ranked results
router.post('/search', processQuery);

// GET   /api/query/history    → Get recent query history
router.get('/history', getQueryHistory);

module.exports = router;
