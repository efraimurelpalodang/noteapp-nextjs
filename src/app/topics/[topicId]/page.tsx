import { createClient } from '@/lib/supabase/server'
import SubchapterList from '@/components/SubchapterList'
import AddSubchapterForm from '@/components/AddSubchapterForm'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function TopicDetailPage({
  params,
}: {
  params: Promise<{ topicId: string }>
}) {
  const { topicId } = await params
  const supabase = await createClient()

  // Fetch topic details
  const { data: topic } = await supabase
    .from('topics')
    .select('*')
    .eq('id', topicId)
    .single()

  if (!topic) {
    notFound()
  }

  // Fetch subchapters ordered by 'order'
  const { data: subchapters } = await supabase
    .from('subchapters')
    .select('*')
    .eq('topic_id', topicId)
    .order('order', { ascending: true })

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-slate-500">
          <Link href="/" className="hover:text-indigo-400 transition-colors">
            Dashboard
          </Link>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-slate-300 truncate">{topic.title}</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              {topic.title}
            </h1>
            <p className="mt-2 text-lg text-slate-400">
              {topic.description || 'Manage sub-chapters for this topic.'}
            </p>
          </div>
          <AddSubchapterForm topicId={topicId} />
        </div>

        {/* Sub-chapters Section */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Sub-chapters</h2>
            <span className="text-sm text-slate-500">
              {subchapters?.length || 0} items
            </span>
          </div>
          
          <SubchapterList 
            initialSubchapters={subchapters ?? []} 
            topicId={topicId} 
          />
        </div>
      </div>
    </div>
  )
}
