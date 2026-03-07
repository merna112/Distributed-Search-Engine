import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' },
    timeout: 30000,
});

// ─── Search ────────────────────────────────────────────────
export const search = (query, page = 1, limit = 10) =>
    api.post('/query/search', { query, page, limit }).then((r) => r.data);

export const getQueryHistory = (limit = 10) =>
    api.get(`/query/history?limit=${limit}`).then((r) => r.data);

// ─── Crawler ────────────────────────────────────────────────
export const startCrawl = (url, depth = 1) =>
    api.post('/crawler/start', { url, depth }).then((r) => r.data);

export const getAllCrawls = (page = 1, limit = 20) =>
    api.get(`/crawler/all?page=${page}&limit=${limit}`).then((r) => r.data);

// ─── Indexer ────────────────────────────────────────────────
export const buildIndex = () =>
    api.post('/indexer/build').then((r) => r.data);

export const getIndexStats = () =>
    api.get('/indexer/stats').then((r) => r.data);

// ─── Health ────────────────────────────────────────────────
export const healthCheck = () =>
    api.get('/health').then((r) => r.data);
