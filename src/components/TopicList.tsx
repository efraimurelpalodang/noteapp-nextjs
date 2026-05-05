'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { TopicCard } from '@/components/TopicCard'
import { createBrowserClient } from '@supabase/ssr'
import { toast } from 'sonner'

const ITEMS_PER_PAGE = 5

export default function TopicList({ topics: initialTopics }: { topics: any[] }) {
  const [topics, setTopics] = useState(initialTopics)
  const [page, setPage] = useState(1)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
  }, [supabase.auth])

  const totalPages = Math.ceil(topics.length / ITEMS_PER_PAGE)
  const paginatedTopics = topics.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const handleAddTopic = async () => {
    if (!title.trim() || !user) return
    setLoading(true)
    const toastId = toast.loading('Creating topic...')
    const { data, error } = await supabase
      .from('topics')
      .insert({ 
        title: title.trim(), 
        description: description.trim() || null,
        user_id: user.id
      })
      .select('*, subchapters(count)')
      .single()
    
    setLoading(false)
    toast.dismiss(toastId)
    
    if (error) {
      console.error('Error creating topic:', error)
      toast.error(`Failed to create topic: ${error.message}`)
    } else {
      toast.success('Topic created')
      setTopics(prev => [data, ...prev])
      setTitle('')
      setDescription('')
      setShowAddDialog(false)
    }
  }

  const handleTopicDeleted = (topicId: string) => {
    setTopics(prev => prev.filter(t => t.id !== topicId))
    if (paginatedTopics.length === 1 && page > 1) {
      setPage(p => p - 1)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Topic list */}
      <div className="flex flex-col gap-3">
        {paginatedTopics.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg font-medium">No topics yet</p>
            <p className="text-sm mt-1">Click the + button to create your first topic</p>
          </div>
        ) : (
          paginatedTopics.map(topic => (
            <TopicCard
              key={topic.id}
              topic={topic}
              onDeleted={() => handleTopicDeleted(topic.id)}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => { e.preventDefault(); setPage(p => Math.max(1, p - 1)) }}
                  aria-disabled={page === 1}
                  className={page === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              <PaginationItem>
                <span className="px-4 text-sm">Page {page} of {totalPages}</span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => { e.preventDefault(); setPage(p => Math.min(totalPages, p + 1)) }}
                  aria-disabled={page === totalPages}
                  className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* FAB */}
      <Button
        className="fixed bottom-6 right-6 h-14 w-14 rounded-2xl shadow-lg z-50"
        size="icon"
        onClick={() => setShowAddDialog(true)}
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Add Topic Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Topic</DialogTitle>
            <DialogDescription className="sr-only">
              Create a new topic to organize your notes.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="topic-title">Title</Label>
              <Input
                id="topic-title"
                placeholder="e.g. Artificial Intelligence"
                value={title}
                onChange={e => setTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddTopic()}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="topic-description">Description</Label>
              <Textarea
                id="topic-description"
                placeholder="Short description (optional)"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddTopic} disabled={loading || !title.trim()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
