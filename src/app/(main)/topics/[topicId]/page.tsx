import { createClient } from '@/lib/supabase/server'
import SubchapterList from '@/components/SubchapterList'
import DetailNavbar from '@/components/DetailNavbar'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = await params
  const supabase = await createClient()
  const { data: topic } = await supabase.from('topics').select('title').eq('id', topicId).single()
  return {
    title: topic ? `${topic.title} — StudyNote` : 'Topic — StudyNote',
  }
}

export default async function TopicDetailPage({ params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = await params
  const supabase = await createClient()

  const { data: topic } = await supabase
    .from('topics')
    .select('*')
    .eq('id', topicId)
    .single()

  if (!topic) return notFound()

  const { data: subchapters } = await supabase
    .from('subchapters')
    .select('*')
    .eq('topic_id', topicId)
    .order('order', { ascending: true })

  return (
    <>
      <DetailNavbar title={topic.title} />
      <main className="pt-5 px-4 pb-24 max-w-2xl mx-auto">
        {/* Description section below navbar */}
        {topic.description && (
          <p className="text-muted-foreground italic text-lg my-6 leading-relaxed">
            {topic.description}
          </p>
        )}
        <SubchapterList topic={topic} subchapters={subchapters ?? []} />
      </main>
    </>
  )
}
