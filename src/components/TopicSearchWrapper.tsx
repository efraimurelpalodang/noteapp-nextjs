'use client'

import { useState, useMemo } from 'react'
import { Subchapter } from '@/lib/types'
import SubchapterList from './SubchapterList'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import AddSubchapterForm from './AddSubchapterForm'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

interface TopicSearchWrapperProps {
  subchapters: Subchapter[]
  topicId: string
}

export default function TopicSearchWrapper({ subchapters, topicId }: TopicSearchWrapperProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 7

  const filteredSubchapters = useMemo(() => {
    if (!searchQuery.trim()) return subchapters
    
    const query = searchQuery.toLowerCase()
    return subchapters.filter(s => 
      s.title.toLowerCase().includes(query) || 
      (s.content?.toLowerCase().includes(query))
    )
  }, [searchQuery, subchapters])

  const paginatedSubchapters = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredSubchapters.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredSubchapters, currentPage])

  const totalPages = Math.ceil(filteredSubchapters.length / ITEMS_PER_PAGE)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden gap-6">
      {/* Search Bar Section */}
      <div className="space-y-6 shrink-0">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none transition-colors group-focus-within:text-primary">
            <Search className="h-5 w-5 text-muted-foreground/40" />
          </div>
          <Input 
            type="text" 
            placeholder="Cari catatan atau bab..." 
            value={searchQuery}
            onChange={handleSearch}
            className="h-14 w-full pl-12 rounded-xl border-border/60 bg-card shadow-none transition-all focus:ring-4 focus:ring-primary/5 focus:border-primary/30"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <AddSubchapterForm topicId={topicId} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
            Menampilkan {filteredSubchapters.length} hasil
          </p>
        </div>
      </div>

      {/* List Section */}
      <div className="flex-1 overflow-y-auto pb-4">
        <SubchapterList initialSubchapters={paginatedSubchapters} topicId={topicId} />
      </div>

      {/* Pagination */}
      {filteredSubchapters.length > ITEMS_PER_PAGE && (
        <div className="shrink-0 pb-8 mt-auto">
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
