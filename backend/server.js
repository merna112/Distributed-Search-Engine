require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

// Route imports
const crawlerRoutes = require('./routes/crawlerRoutes');
const indexerRoutes = require('./routes/indexerRoutes');
const queryRoutes = require('./routes/queryRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// DB readiness check — return 503 instantly instead of buffering
app.use('/api/crawler', (req, res, next) => {
    if (mongoose.connection.readyState !== 1)
        return res.status(503).json({ success: false, message: 'Database not connected. Please wait and try again.' });
    next();
});
app.use('/api/indexer', (req, res, next) => {
    if (mongoose.connection.readyState !== 1)
        return res.status(503).json({ success: false, message: 'Database not connected. Please wait and try again.' });
    next();
});
app.use('/api/query', (req, res, next) => {
    if (mongoose.connection.readyState !== 1)
        return res.status(503).json({ success: false, message: 'Database not connected. Please wait and try again.' });
    next();
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/crawler', crawlerRoutes);
app.use('/api/indexer', indexerRoutes);
app.use('/api/query', queryRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
