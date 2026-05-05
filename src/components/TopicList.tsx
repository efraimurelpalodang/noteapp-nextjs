'use client'

import { useState, useMemo } from 'react'
import { Search, FolderPlus, SlidersHorizontal } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Topic } from '@/lib/types'
import TopicCard from '@/components/TopicCard'
import AddTopicForm from '@/components/AddTopicForm'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

interface TopicListProps {
  initialTopics: Topic[]
}

const ITEMS_PER_PAGE = 7

export default function TopicList({ initialTopics }: TopicListProps) {
  const [query, setQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const filtered = useMemo(() => {
    if (!query) return initialTopics
    return initialTopics.filter(t => 
      t.title.toLowerCase().includes(query.toLowerCase())
    )
  }, [initialTopics, query])

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filtered.slice(start, start + ITEMS_PER_PAGE)
  }, [filtered, currentPage])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    setCurrentPage(1) // Reset to page 1 on search
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Search area is shrink-0 */}
      <div className="shrink-0 pb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <Input 
            type="text" 
            placeholder="Search research database..." 
            className="pl-10 py-6 bg-transparent border-slate-200 dark:border-slate-800 rounded-xl text-base shadow-sm focus-visible:ring-1 focus-visible:ring-indigo-500"
            value={query}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0 mt-4">
          <span>Latest Entries ({filtered.length})</span>
          <button className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 hover:opacity-80 transition-opacity">
            <SlidersHorizontal className="h-4 w-4" />
            Refine
          </button>
        </div>

        {/* Scrollable card list */}
        <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800 overflow-y-auto flex-1 pt-4 pb-4">
          {paginated.length > 0 ? (
            paginated.map((topic) => (
              <TopicCard key={topic.id} topic={topic} />
            ))
          ) : query ? (
            <div className="col-span-full flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
              No topics found matching "{query}"
            </div>
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

      {/* Pagination */}
      {filtered.length > ITEMS_PER_PAGE && (
        <div className="mt-4 pb-8 shrink-0">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className={currentPage <= 1 ? 'pointer-events-none opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }).map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink 
                    onClick={() => setCurrentPage(i + 1)}
                    isActive={currentPage === i + 1}
                    className="cursor-pointer"
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className={currentPage >= totalPages ? 'pointer-events-none opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}
