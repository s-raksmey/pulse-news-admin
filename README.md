# Pulse News (Next.js + TypeScript + Tailwind + ShadCN UI + GraphQL + PostgreSQL)

## Stack
- Next.js App Router (TypeScript)
- Tailwind CSS
- ShadCN UI-style components (minimal set included)
- GraphQL API via GraphQL Yoga (`/api/graphql`)
- PostgreSQL + Prisma ORM
- Editor.js for CMS authoring (stores JSON blocks)

## Quick Start

1) Install deps
```bash
npm install
```

2) Start Postgres (Docker)
```bash
docker compose up -d
```

3) Configure env
```bash
cp .env.example .env
```

4) Migrate DB + generate Prisma client
```bash
npm run prisma:migrate
```

5) Seed sample data (optional)
```bash
npm run seed
```

6) Run dev
```bash
npm run dev
```

## Routes
- Public:
  - `/` Home
  - `/news/[slug]` Article
  - `/category/[slug]` Category listing
- Admin:
  - `/admin` Dashboard
  - `/admin/articles` Articles list
  - `/admin/articles/new` Create (Editor.js)
  - `/admin/articles/[id]/edit` Edit (Editor.js)

## GraphQL
- Endpoint: `/api/graphql`
- Introspection enabled in dev
- See `src/graphql/schema.ts` for types and resolvers
