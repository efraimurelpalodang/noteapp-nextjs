import { createClient } from '@/lib/supabase/server'
import SubchapterList from '@/components/SubchapterList'
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

  return <SubchapterList topic={topic} subchapters={subchapters ?? []} />
}
