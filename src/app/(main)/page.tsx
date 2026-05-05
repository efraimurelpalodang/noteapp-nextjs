import { createClient } from '@/lib/supabase/server'
import TopicList from '@/components/TopicList'

export const metadata = {
  title: 'Library — StudyNote',
  description: 'Browse all your study topics and knowledge collections.',
}

export default async function HomePage() {
  const supabase = await createClient()
  const { data: topics } = await supabase
    .from('topics')
    .select('*, subchapters(count)')
    .order('updated_at', { ascending: false })

  return <TopicList topics={topics ?? []} />
}
