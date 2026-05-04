import { createClient } from '@/lib/supabase/server'
import TopicCard from '@/components/TopicCard'
import AddTopicForm from '@/components/AddTopicForm'
import { Topic } from '@/lib/types'

export default async function HomePage() {
  const supabase = await createClient()
  
  const { data: topics } = await supabase
    .from('topics')
    .select('*, subchapters(count)')
    .order('created_at', { ascending: false })

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              My Knowledge Base
            </h1>
            <p className="mt-2 text-lg text-slate-400">
              Manage your topics and study notes
            </p>
          </div>
          <AddTopicForm />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {topics && topics.length > 0 ? (
            topics.map((topic: any) => (
              <TopicCard key={topic.id} topic={topic as Topic} />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-800 py-20 text-center">
              <div className="rounded-full bg-slate-800/50 p-4 mb-4">
                <svg className="h-10 w-10 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white">No topics yet</h3>
              <p className="mt-2 text-slate-400">Create your first topic to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
