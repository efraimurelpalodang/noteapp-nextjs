'use client'

import { useState, useMemo } from 'react'
import { Subchapter } from '@/lib/types'
import SubchapterList from './SubchapterList'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import AddSubchapterForm from './AddSubchapterForm'

interface TopicSearchWrapperProps {
  subchapters: Subchapter[]
  topicId: string
}

export default function TopicSearchWrapper({ subchapters, topicId }: TopicSearchWrapperProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredSubchapters = useMemo(() => {
    if (!searchQuery.trim()) return subchapters
    
    const query = searchQuery.toLowerCase()
    return subchapters.filter(s => 
      s.title.toLowerCase().includes(query) || 
      (s.content?.toLowerCase().includes(query))
    )
  }, [searchQuery, subchapters])

  return (
    <div className="space-y-6">
      {/* Search Bar Section */}
      <div className="space-y-6">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none transition-colors group-focus-within:text-primary">
            <Search className="h-5 w-5 text-muted-foreground/40" />
          </div>
          <Input 
            type="text" 
            placeholder="Cari catatan atau bab..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
      <div className="space-y-6">
        <SubchapterList initialSubchapters={filteredSubchapters} topicId={topicId} />
      </div>
    </div>
  )
}
