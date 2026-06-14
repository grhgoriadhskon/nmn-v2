# NMN v2 — Nail Me Now

Beauty services marketplace. Customers book nail/beauty professionals; pros manage their schedule.

## Structure

```
nmn-v2/
├── server/   # Node.js + Express + SQLite API
└── web/      # React + Vite frontend
```

## Getting started

### Backend
```bash
cd server
cp .env.example .env
npm install
npm run dev
```

### Frontend
```bash
cd web
npm install
npm run dev
```

## Branching

- `main` — production only
- `develop` — integration branch
- `feature/*` — one branch per feature, PR into develop
