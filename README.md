# 🔍 Distributed Search Engine

A full-stack **Distributed Search Engine** built with the **MERN stack** (MongoDB, Express.js, React.js, Node.js) following strict **MVC architecture**. It crawls web pages, builds an inverted index using TF-IDF scoring, processes search queries, and ranks results.

![Tech Stack](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)

---

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [MVC Breakdown](#-mvc-breakdown)
- [Data Flow](#-data-flow)
- [API Reference](#-api-reference)
- [Database Schema](#-database-schema)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Tech Stack](#-tech-stack)

---

## ✨ Features

- 🕷 **Web Crawler** — BFS-based crawler using `cheerio` + `node-fetch`, configurable depth (0–3)
- 📚 **Inverted Indexer** — Tokenizes, removes stopwords, stems with Porter Stemmer, computes TF scores
- 🔎 **Query Processor** — Normalizes queries, looks up the inverted index
- 📊 **TF-IDF Ranker** — Ranks results using smoothed TF-IDF scoring
- 💅 **Modern React UI** — Dark-themed search interface with Crawler and Indexer control panels
- 📄 **Paginated Results** — Search results with domain, title, snippet, TF-IDF score badge
- 📝 **Query History** — Every search is logged with response time and result count

---

## 🏛 Architecture

The project strictly follows **MVC (Model-View-Controller)** pattern across all components:

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (React.js)                    │
│   SearchBar  →  SearchPage  →  ResultsList/ResultCard   │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP (axios / Vite proxy)
┌────────────────────────▼────────────────────────────────┐
│                  SERVER (Express.js)                    │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Crawler    │  │   Indexer    │  │    Query     │  │
│  │   Service    │  │   Service    │  │  Processor   │  │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤  │
│  │   Routes     │  │   Routes     │  │   Routes     │  │  ← View (Router)
│  │ Controllers  │  │ Controllers  │  │ Controllers  │  │  ← Controller
│  │   Models     │  │   Models     │  │   Models     │  │  ← Model
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                         │                               │
│              ┌──────────▼──────────┐                    │
│              │    Ranker Service   │  (TF-IDF scoring)  │
│              └─────────────────────┘                    │
└────────────────────────┬────────────────────────────────┘
                         │ Mongoose ODM
┌────────────────────────▼────────────────────────────────┐
│                   MongoDB Database                      │
│   crawls collection  │  indexes collection  │  queries  │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
Distributed-Search-Engine/
│
├── backend/                          # Node.js + Express.js API
│   ├── server.js                     # App entry point, middleware, routes
│   ├── package.json
│   ├── .env.example                  # Environment variable template
│   │
│   ├── config/
│   │   └── db.js                     # MongoDB connection (auto-retry)
│   │
│   ├── models/                       # ← M in MVC (Mongoose schemas)
│   │   ├── Crawl.js                  # Crawled page schema
│   │   ├── Index.js                  # Inverted index schema
│   │   └── Query.js                  # Search query log schema
│   │
│   ├── controllers/                  # ← C in MVC (business logic)
│   │   ├── crawlerController.js      # BFS web crawling logic
│   │   ├── indexerController.js      # Tokenization + TF computation
│   │   └── queryController.js        # Query normalization + ranking
│   │
│   ├── routes/                       # ← V in MVC (Express routers)
│   │   ├── crawlerRoutes.js
│   │   ├── indexerRoutes.js
│   │   └── queryRoutes.js
│   │
│   └── services/
│       └── ranker.js                 # TF-IDF ranking algorithm
│
└── frontend/                         # React.js (Vite)
    ├── index.html
    ├── vite.config.js                # Vite + proxy to :5000
    ├── package.json
    │
    └── src/
        ├── main.jsx                  # App entry point
        ├── App.jsx
        ├── index.css                 # Dark-theme design system
        │
        ├── services/
        │   └── api.js                # Axios API service layer
        │
        ├── components/
        │   ├── SearchBar.jsx         # Search input + submit
        │   ├── ResultCard.jsx        # Single result card
        │   └── ResultsList.jsx       # Paginated results list
        │
        └── pages/
            └── SearchPage.jsx        # Main page (search + panels)
```

---

## 🧱 MVC Breakdown

### Crawler Service
| Layer | File | Responsibility |
|---|---|---|
| Model | `models/Crawl.js` | Schema: `url`, `content`, `links`, `status`, `depth`, `crawledAt` |
| Controller | `controllers/crawlerController.js` | BFS crawl, HTML parsing with cheerio, upsert crawl records |
| Route | `routes/crawlerRoutes.js` | REST endpoints for crawl operations |

### Indexer Service
| Layer | File | Responsibility |
|---|---|---|
| Model | `models/Index.js` | Schema: `term`, `documents[{url, tf, positions}]`, `df` |
| Controller | `controllers/indexerController.js` | Tokenize text, remove stopwords, stem, compute TF, upsert index |
| Route | `routes/indexerRoutes.js` | REST endpoints for index operations |

### Query Processor
| Layer | File | Responsibility |
|---|---|---|
| Model | `models/Query.js` | Schema: `rawQuery`, `tokens`, `resultCount`, `responseTimeMs` |
| Controller | `controllers/queryController.js` | Normalize query → index lookup → rank → paginate → log |
| Route | `routes/queryRoutes.js` | REST endpoints for search |

### Ranker Service
| File | Responsibility |
|---|---|
| `services/ranker.js` | `normalizeQuery()` — stem + filter stopwords. `rank()` — smoothed TF-IDF scoring: `score = TF × (log((N+1)/(df+1)) + 1)` |

---

## 🔄 Data Flow

```
User types query
       │
       ▼
[React SearchBar]
       │  POST /api/query/search { query }
       ▼
[queryController.processQuery]
   1. normalizeQuery()  →  stem + remove stopwords
   2. Index.find({ term: { $in: tokens } })
   3. Crawl.countDocuments()  →  total N docs
   4. ranker.rank(tokens, indexEntries, N)
      └─ TF-IDF score per URL, sorted descending
   5. Paginate results
   6. Enrich with snippet + title from Crawl collection
   7. Query.create()  →  log the search
       │
       ▼
[React ResultsList + ResultCard]
   Shows: domain, favicon, title, snippet, TF-IDF score

─────────────────────────────────────────────────────

Crawler Pipeline:
  POST /api/crawler/start { url, depth }
       │
       ▼
  crawlBFS()  (async, BFS up to depth 3)
       │  cheerio parses HTML → extract text + links
       ▼
  Crawl.findOneAndUpdate()  →  saves page to MongoDB
       │
       ▼
  POST /api/indexer/build
       │
       ▼
  indexerController.buildIndex()
       │  Porter Stemmer + stopword removal
       ▼
  Index.upsert()  →  inverted index in MongoDB
```

---

## 📡 API Reference

### Crawler

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `POST` | `/api/crawler/start` | `{ url, depth }` | Start BFS crawl from seed URL |
| `GET` | `/api/crawler/all` | `?page=1&limit=20` | List all crawled pages |
| `GET` | `/api/crawler/status/:id` | — | Get status of specific crawl |
| `DELETE` | `/api/crawler/:id` | — | Delete a crawl record |

**Example:**
```bash
curl -X POST http://localhost:5000/api/crawler/start \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","depth":1}'
```

**Response:**
```json
{
  "success": true,
  "message": "Crawl job started",
  "data": { "seedUrl": "https://example.com", "maxDepth": 1 }
}
```

---

### Indexer

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/indexer/build` | Build / update inverted index from all crawled pages |
| `GET` | `/api/indexer/stats` | Get index statistics (totalTerms, totalDocuments) |
| `GET` | `/api/indexer/term/:term` | Look up a specific term in the index |

**Example:**
```bash
curl -X POST http://localhost:5000/api/indexer/build
```

**Response:**
```json
{
  "success": true,
  "message": "Index built successfully",
  "data": { "documentsProcessed": 5, "totalTermsAdded": 1247 }
}
```

---

### Query / Search

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `POST` | `/api/query/search` | `{ query, page, limit }` | Search and get ranked results |
| `GET` | `/api/query/history` | `?limit=20` | Get recent query history |

**Example:**
```bash
curl -X POST http://localhost:5000/api/query/search \
  -H "Content-Type: application/json" \
  -d '{"query":"distributed search","page":1,"limit":10}'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "url": "https://example.com",
        "score": 0.3421,
        "title": "Example Domain",
        "snippet": "This domain is for use in illustrative examples...",
        "crawledAt": "2026-03-07T01:00:00Z"
      }
    ],
    "total": 3,
    "page": 1,
    "pages": 1,
    "tokens": ["distribut", "search"],
    "responseTimeMs": 42
  }
}
```

---

### Health Check

```bash
curl http://localhost:5000/api/health
# → { "status": "OK", "timestamp": "2026-03-07T..." }
```

---

## 🗄 Database Schema

### `crawls` collection
```json
{
  "_id": "ObjectId",
  "url": "https://example.com",
  "content": "raw extracted page text",
  "links": ["https://example.com/about", "..."],
  "status": "crawled",
  "depth": 1,
  "errorMessage": null,
  "crawledAt": "2026-03-07T01:00:00Z",
  "createdAt": "2026-03-07T01:00:00Z"
}
```

### `indexes` collection
```json
{
  "_id": "ObjectId",
  "term": "search",
  "df": 3,
  "documents": [
    {
      "url": "https://example.com",
      "tf": 0.0512,
      "positions": [2, 17, 43],
      "totalTerms": 214
    }
  ]
}
```

### `queries` collection
```json
{
  "_id": "ObjectId",
  "rawQuery": "distributed search engine",
  "tokens": ["distribut", "search", "engin"],
  "resultCount": 7,
  "responseTimeMs": 38,
  "createdAt": "2026-03-07T02:00:00Z"
}
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- npm

### 1. Clone the repository
```bash
git clone https://github.com/merna112/Distributed-Search-Engine.git
cd Distributed-Search-Engine
```

### 2. Setup Backend
```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI
npm install
npm run dev
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Open the app
```
http://localhost:5173
```

### 5. Test the full pipeline
1. **Crawl** — Enter a URL in the Crawler panel → click **Crawl**
2. **Index** — Click **Build Index** after crawl completes (~10s)
3. **Search** — Type a query in the search bar → hit **Search**

---

## 🔧 Environment Variables

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/distributed_search_engine
NODE_ENV=development
```

For MongoDB Atlas:
```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/distributed_search_engine?retryWrites=true&w=majority
```

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React.js 18 + Vite | Search UI |
| Styling | Vanilla CSS | Dark-theme design system |
| HTTP Client | Axios | API calls from React |
| Backend | Node.js + Express.js | REST API server |
| Database | MongoDB + Mongoose | Document storage |
| Crawler | node-fetch + cheerio | HTTP fetch + HTML parsing |
| NLP | natural (Porter Stemmer) | Tokenization + stemming |
| Ranking | TF-IDF (custom) | Document scoring |
| Dev Server | Nodemon | Auto-restart on changes |

---

## 📐 Ranking Algorithm

The ranker uses **smoothed TF-IDF** scoring:

```
TF(t, d)  = (count of term t in doc d) / (total terms in d)
IDF(t)    = log((N + 1) / (df(t) + 1)) + 1
TF-IDF    = TF × IDF
```

Where:
- `N` = total number of crawled documents
- `df(t)` = number of documents containing term `t`
- Smoothing `+1` prevents division by zero and reduces impact of very rare terms

For multi-word queries, scores are **summed** across all query terms per document, then sorted descending.

---

## 👤 Author

**Merna** — [@merna112](https://github.com/merna112)

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.
