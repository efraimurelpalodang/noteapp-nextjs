# StudyNote

A knowledge base application built with Next.js, TypeScript, Tailwind CSS, Prisma, and Supabase.

## Project Roadmap

### Stage 1: Setup & Initialization ✅ Done
- [x] Initialize Next.js 16 project with TypeScript and App Router
- [x] Install Supabase dependencies (`@supabase/supabase-js`, `@supabase/ssr`)
- [x] Install and initialize Prisma ORM
- [x] Configure environment variables in `.env.local`
- [x] Clean up default boilerplate and assets
- [x] Verify local development environment

## Getting Started

1.  **Clone the repository**
2.  **Install dependencies**: `npm install`
3.  **Configure environment**: Rename `.env.example` to `.env.local` and fill in your Supabase credentials.
4.  **Run migrations**: `npx prisma migrate dev` (once models are defined)
5.  **Start the dev server**: `npm run dev`

## Tech Stack
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **ORM**: Prisma
- **Auth**: Supabase Auth
