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

### Stage 5: Sub-chapters Feature ✅ Done
- [x] Install `@dnd-kit` for drag & drop functionality
- [x] Build Topic Detail page with dynamic routing
- [x] Implement `SubchapterList` with sortable reordering
- [x] Build `SubchapterCard` and `AddSubchapterForm` components
- [x] Create API routes for Sub-chapter management
- [x] Ensure order persistence in Supabase

### Stage 6: Note Editor Feature ✅ Done
- [x] Build premium `NoteEditor` component with manual save
- [x] Implement "Unsaved changes" detection and feedback
- [x] Create dynamic Note page with parallel data fetching
- [x] Implement hierarchical breadcrumb navigation
- [x] Ensure content persistence in Supabase

### Stage 9: Topic Detail Page Rebuild ✅ Done
- [x] Dynamic navbar with back arrow and truncated title
- [x] Topic description header below navbar
- [x] Accordion-based subchapter list with single-item focus
- [x] Full CRUD for sub-chapters via Dialogs and AlertDialog
- [x] Client-side pagination (7 items per page)

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
