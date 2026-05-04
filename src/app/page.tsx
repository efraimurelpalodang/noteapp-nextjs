import { createClient } from '@/lib/supabase/server'
import TopicCard from '@/components/TopicCard'
import AddTopicForm from '@/components/AddTopicForm'
import { Topic } from '@/lib/types'
import { FolderPlus, Search, SlidersHorizontal } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

export default async function HomePage({ searchParams }: { searchParams: { page?: string } }) {
  const supabase = await createClient()
  
  const page = Number(searchParams?.page) || 1
  const limit = 6
  const start = (page - 1) * limit
  const end = start + limit - 1

  const { data: topics, count } = await supabase
    .from('topics')
    .select('*, subchapters(count)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(start, end)

  const totalPages = Math.ceil((count || 0) / limit)

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 bg-white dark:bg-slate-950 min-h-screen">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Publications
          </h1>
          <AddTopicForm />
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <Input 
            type="text" 
            placeholder="Search research database..." 
            className="pl-10 py-6 bg-transparent border-slate-200 dark:border-slate-800 rounded-xl text-base shadow-sm focus-visible:ring-1 focus-visible:ring-indigo-500"
          />
        </div>

        <div className="flex flex-col">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pb-4 border-b border-slate-100 dark:border-slate-800">
            <span>Latest Entries ({count || 0})</span>
            <button className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 hover:opacity-80 transition-opacity">
              <SlidersHorizontal className="h-4 w-4" />
              Refine
            </button>
          </div>

          <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
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

        {/* Pagination Section */}
        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href={page > 1 ? `/?page=${page - 1}` : '#'} 
                    className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }).map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink 
                      href={`/?page=${i + 1}`}
                      isActive={page === i + 1}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext 
                    href={page < totalPages ? `/?page=${page + 1}` : '#'}
                    className={page >= totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  )
}
