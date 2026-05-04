import { createClient } from '@/lib/supabase/server'
import TopicSearchWrapper from '@/components/TopicSearchWrapper'
import { notFound } from 'next/navigation'
import { Info, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default async function TopicDetailPage({
  params,
}: {
  params: Promise<{ topicId: string }>
}) {
  const { topicId } = await params
  const supabase = await createClient()

  const { data: topic } = await supabase
    .from('topics')
    .select('*, subchapters(*)')
    .eq('id', topicId)
    .single()

  if (!topic) {
    notFound()
  }

  const subchapters = topic.subchapters || []

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 sm:py-16">
      <div className="flex flex-col gap-10">
        {/* Header Section with Breadcrumbs beside Title using justify-between */}
        <div className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-baseline sm:justify-between">
            <h1 className="text-4xl font-black text-foreground tracking-tight sm:text-5xl">
              {topic.title}
            </h1>
            
            {/* Breadcrumbs on the far right, non-bold */}
            <nav className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground/40 shrink-0 mb-1">
              <Link href="/" className="hover:text-primary transition-colors">
                Beranda
              </Link>
              <ChevronRight className="h-2.5 w-2.5" />
              <span className="text-muted-foreground/30">Detail Topik</span>
            </nav>
          </div>
          
          <p className="text-lg text-muted-foreground/60 leading-relaxed font-medium max-w-3xl">
            {topic.description || 'Jelajahi koleksi materi pelajaran dan catatan penelitian yang dikurasi.'}
          </p>
        </div>

        {/* Search & List Wrapper */}
        <TopicSearchWrapper subchapters={subchapters} topicId={topicId} />

        {/* Footer Info */}
        <div className="pt-8 flex items-center justify-center gap-2 text-muted-foreground/30 border-t">
          <Info className="h-4 w-4" />
          <span className="text-xs font-bold uppercase tracking-tighter">Database Penelitian StudyNote • 2026</span>
        </div>
      </div>
    </div>
  )
}
