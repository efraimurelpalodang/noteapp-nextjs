# StudyNote

A knowledge base application built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Project Roadmap

### Stage 1: Setup & Initialization ✅ Done
- [x] Initialize Next.js 16 project with TypeScript and App Router
- [x] Install Supabase dependencies (`@supabase/supabase-js`, `@supabase/ssr`)
- [x] Clean up default boilerplate and assets
- [x] Verify local development environment

### Stage 2: Authentication ✅ Done
- [x] Setup Supabase client for SSR (Server & Browser)
- [x] Implement Auth Callback route for OAuth
- [x] Protect private routes using `proxy.ts` (Next.js 16 convention)
- [x] Build Login and Register pages
- [x] Add Logout functionality in Navbar

### Stage 4: Topics Feature ✅ Done
- [x] Create shared TypeScript types for Topic and Subchapter
- [x] Build Topics dashboard with Server Components
- [x] Implement interactive `TopicCard` and `AddTopicForm`
- [x] Set up API routes for Topic CRUD operations
- [x] Enable Row Level Security (RLS) for data protection

## Getting Started

1.  **Clone the repository**
2.  **Install dependencies**: `npm install`
3.  **Configure environment**: Rename `.env.example` to `.env.local` and fill in your Supabase credentials.
4.  **Start the dev server**: `npm run dev`

## Tech Stack
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
