const mongoose = require('mongoose');

const querySchema = new mongoose.Schema(
    {
        rawQuery: {
            type: String,
            required: true,
            trim: true,
        },
        tokens: {
            type: [String],
            default: [],
        },
        resultCount: {
            type: Number,
            default: 0,
        },
        responseTimeMs: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

const Query = mongoose.model('Query', querySchema);

module.exports = Query;
