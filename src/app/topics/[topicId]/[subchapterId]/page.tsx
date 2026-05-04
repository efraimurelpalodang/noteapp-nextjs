import { createClient } from '@/lib/supabase/server'
import NoteEditor from '@/components/NoteEditor'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function NotePage({
  params,
}: {
  params: Promise<{ topicId: string; subchapterId: string }>
}) {
  const { topicId, subchapterId } = await params
  const supabase = await createClient()

  // Fetch topic and subchapter in parallel
  const [topicRes, subchapterRes] = await Promise.all([
    supabase.from('topics').select('title').eq('id', topicId).single(),
    supabase.from('subchapters').select('*').eq('id', subchapterId).single(),
  ])

  if (!subchapterRes.data || !topicRes.data) {
    notFound()
  }

  const topic = topicRes.data
  const subchapter = subchapterRes.data

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
          <Link href="/" className="hover:text-indigo-400 transition-colors">
            Dashboard
          </Link>
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <Link href={`/topics/${topicId}`} className="hover:text-indigo-400 transition-colors max-w-[150px] truncate">
            {topic.title}
          </Link>
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-slate-300 truncate max-w-[200px]">
            {subchapter.title}
          </span>
        </nav>

        {/* Page Title */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            {subchapter.title}
          </h1>
          <p className="text-sm text-slate-400">
            Last updated: {new Date(subchapter.updated_at).toLocaleDateString()}
          </p>
        </div>

        {/* Editor */}
        <NoteEditor
          subchapterId={subchapterId}
          topicId={topicId}
          initialContent={subchapter.content ?? ''}
        />
      </div>
    </div>
  )
}
