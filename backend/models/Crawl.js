const mongoose = require('mongoose');

const crawlSchema = new mongoose.Schema(
    {
        url: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        content: {
            type: String,
            default: '',
        },
        links: {
            type: [String],
            default: [],
        },
        status: {
            type: String,
            enum: ['pending', 'crawled', 'failed'],
            default: 'pending',
        },
        depth: {
            type: Number,
            default: 0,
        },
        errorMessage: {
            type: String,
            default: null,
        },
        crawledAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

const Crawl = mongoose.model('Crawl', crawlSchema);

module.exports = Crawl;
