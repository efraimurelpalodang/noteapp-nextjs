import { createClient } from '@/lib/supabase/server'
import SubchapterLayout from '@/components/SubchapterLayout'
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

  // Get user for layout
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <SubchapterLayout 
      topicId={topicId}
      topicTitle={topic.title}
      subchapter={subchapter}
      userEmail={user?.email || 'User'}
    />
  )
}
