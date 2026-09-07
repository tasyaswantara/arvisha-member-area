# Arvisha Member Area

Initial project structure for a custom Arvisha member area.

## Tech stack

- Next.js with the App Router
- JavaScript
- Tailwind CSS
- Supabase client packages (`@supabase/supabase-js` and `@supabase/ssr`)
- Lucide React
- Vercel-ready configuration

## Folder structure

```text
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── (member)/
│   │   └── member/
│   │       ├── dashboard/
│   │       └── products/
│   ├── layout.js
│   └── page.js
├── components/
│   ├── ui/
│   ├── layout/
│   └── shared/
├── features/
│   ├── auth/
│   ├── member/
│   └── products/
├── lib/
│   ├── supabase/
│   └── utils/
└── styles/

public/
├── images/
└── icons/

supabase/
├── migrations/
└── seed.sql
```

## Installation

```bash
npm install
```

Copy `.env.example` to `.env.local` and add the Supabase project values when they are available:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Real credentials must stay out of Git. `.env.local` is ignored by the repository.

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser.

Other useful commands:

```bash
npm run lint
npm run build
npm run start
```

## Supabase local development

The `supabase/migrations` directory and `supabase/seed.sql` are prepared for future local development. No database tables, migrations, seed data, RLS policies, or Supabase client logic have been created yet.

## Current status

This repository contains the initial application scaffold and minimal route placeholders only. Authentication, database schema, RLS, session handling, password reset, Lynk.id integration, webhooks, transaction handling, product mapping, mock data, and CMS/admin functionality are intentionally not implemented.
