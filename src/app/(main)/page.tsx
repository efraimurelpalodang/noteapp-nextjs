import { createClient } from '@/lib/supabase/server'
import AddTopicForm from '@/components/AddTopicForm'
import TopicList from '@/components/TopicList'

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch all topics since we're filtering on the client now
  const { data: topics } = await supabase
    .from('topics')
    .select('*, subchapters(count)')
    .order('created_at', { ascending: false })

  return (
    <div className="mx-auto max-w-3xl px-4 pt-8 pb-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-950 h-[calc(100vh-64px)] flex flex-col">
      <div className="flex flex-col gap-8 flex-1 overflow-hidden">
        <div className="flex items-center justify-between shrink-0">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Publications
          </h1>
          <AddTopicForm />
        </div>

        <TopicList initialTopics={topics || []} />
      </div>
    </div>
  )
}
