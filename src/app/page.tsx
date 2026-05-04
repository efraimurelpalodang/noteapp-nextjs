import { createClient } from '@/lib/supabase/server'
import TopicCard from '@/components/TopicCard'
import AddTopicForm from '@/components/AddTopicForm'
import { Topic } from '@/lib/types'
import { Sparkles, FolderPlus } from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()
  
  const { data: topics } = await supabase
    .from('topics')
    .select('*, subchapters(count)')
    .order('created_at', { ascending: false })

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 sm:py-12">
      <div className="flex flex-col gap-12">
        {/* Hero / Header Section */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-bold tracking-widest uppercase text-xs">
              <Sparkles className="h-4 w-4" />
              Perpustakaan Pribadi Anda
            </div>
            <h1 className="text-4xl font-extrabold text-foreground tracking-tight sm:text-5xl">
              StudyNote
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed">
              Atur pengetahuan Anda, lacak kemajuan Anda, dan kuasai materi apa pun dengan alur kerja belajar yang terstruktur.
            </p>
          </div>
          <div className="shrink-0">
            <AddTopicForm />
          </div>
        </div>

        {/* Grid Section */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {topics && topics.length > 0 ? (
            topics.map((topic: any) => (
              <TopicCard key={topic.id} topic={topic as Topic} />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-muted bg-muted/5 py-24 px-6 text-center animate-in fade-in zoom-in duration-500">
              <div className="rounded-2xl bg-muted/50 p-6 mb-6 shadow-inner transition-transform hover:scale-110">
                <FolderPlus className="h-12 w-12 text-muted-foreground/60" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Rak Anda masih kosong</h3>
              <p className="mt-2 text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Mulai bangun basis pengetahuan Anda dengan membuat topik belajar pertama Anda.
              </p>
              <div className="mt-8">
                <AddTopicForm />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
