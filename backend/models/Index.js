const mongoose = require('mongoose');

const documentEntrySchema = new mongoose.Schema(
    {
        url: { type: String, required: true },
        tf: { type: Number, required: true },          // Term Frequency in this doc
        positions: { type: [Number], default: [] },    // Character/word positions
        totalTerms: { type: Number, default: 0 },      // Total terms in document
    },
    { _id: false }
);

const indexSchema = new mongoose.Schema(
    {
        term: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        documents: [documentEntrySchema],
        df: {
            type: Number,
            default: 0,  // Document frequency (number of docs containing this term)
        },
    },
    { timestamps: true }
);

// Index on term for fast lookups
indexSchema.index({ term: 1 });

const Index = mongoose.model('Index', indexSchema);

module.exports = Index;
