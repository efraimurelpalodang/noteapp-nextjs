'use client'

import { useState, useMemo, useEffect } from 'react'
import { Plus, Pencil, Trash2, MoreVertical, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const ITEMS_PER_PAGE = 7

type Subchapter = {
  id: string
  title: string
  content: string | null
  order: number
}

type Props = {
  topic: any
  subchapters: Subchapter[]
}

export default function SubchapterList({ topic, subchapters: initialSubs }: Props) {
  const [subs, setSubs] = useState<Subchapter[]>(initialSubs)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchVisible, setIsSearchVisible] = useState(false)

  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Form states
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [editId, setEditId] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [deleteId, setDeleteId] = useState('')

  const supabase = createClient()

  // Listen for search event from Navbar
  useEffect(() => {
    const handleSearchEvent = () => {
      setIsSearchVisible(prev => !prev)
    }
    window.addEventListener('toggle-topic-search', handleSearchEvent)
    return () => window.removeEventListener('toggle-topic-search', handleSearchEvent)
  }, [])

  // Filtered subchapters
  const filteredSubs = useMemo(() => {
    return subs.filter(sub =>
      sub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sub.content?.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }, [subs, searchQuery])

  // Pagination logic
  const totalPages = Math.ceil(filteredSubs.length / ITEMS_PER_PAGE)
  const paginatedSubs = filteredSubs.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const handleAddSubchapter = async () => {
    if (!newTitle.trim()) return
    setLoading(true)
    const { data, error } = await supabase
      .from('subchapters')
      .insert({
        topic_id: topic.id,
        user_id: topic.user_id,
        title: newTitle.trim(),
        content: newContent.trim() || null,
        order: subs.length,
      })
      .select()
      .single()

    setLoading(false)
    if (error) {
      console.error('Error adding subchapter:', error)
      toast.error('Something went wrong')
    } else {
      toast.success('Sub-chapter created')
      setSubs(prev => [...prev, data])
      setNewTitle('')
      setNewContent('')
      setShowAddDialog(false)
    }
  }

  const handleEdit = (sub: Subchapter) => {
    setEditId(sub.id)
    setEditTitle(sub.title)
    setEditContent(sub.content || '')
    setShowEditDialog(true)
  }

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) return
    setLoading(true)
    const { error } = await supabase
      .from('subchapters')
      .update({
        title: editTitle.trim(),
        content: editContent.trim() || null,
      })
      .eq('id', editId)

    setLoading(false)
    if (error) {
      toast.error('Something went wrong')
    } else {
      toast.success('Sub-chapter updated')
      setSubs(prev =>
        prev.map(s => (s.id === editId ? { ...s, title: editTitle, content: editContent } : s))
      )
      setShowEditDialog(false)
    }
  }

  const handleDeleteConfirm = (id: string) => {
    setDeleteId(id)
    setShowDeleteConfirm(true)
  }

  const handleDelete = async () => {
    const { error } = await supabase.from('subchapters').delete().eq('id', deleteId)
    if (error) {
      toast.error('Something went wrong')
    } else {
      toast.success('Sub-chapter deleted')
      setSubs(prev => prev.filter(s => s.id !== deleteId))
      setShowDeleteConfirm(false)
    }
  }

  return (
    <div className="w-full">
      {/* Search Input (Toggled from Navbar) */}
      {isSearchVisible && (
        <div className="mb-6 relative animate-in fade-in slide-in-from-top-2 duration-300">
          <Input
            placeholder="Search sub-chapters..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10 h-11 bg-muted/50 border-none focus-visible:ring-1"
            autoFocus
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
            onClick={() => {
              setSearchQuery('')
              setIsSearchVisible(false)
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <Accordion type="single" collapsible className="w-full">
        {paginatedSubs.map(sub => (
          <AccordionItem key={sub.id} value={sub.id} className="border-b border-muted py-1">
            <AccordionTrigger className="w-full text-left font-medium text-lg py-4 transition-all hover:underline underline-offset-4 decoration-primary/30 cursor-pointer capitalize">
              {sub.title}
            </AccordionTrigger>

            <AccordionContent>
              <div className="flex gap-4 items-center pb-6 pt-2">
                <p className="flex-1 text-foreground/80 whitespace-pre-wrap text-[15px] leading-relaxed">
                  {sub.content || 'No content yet.'}
                </p>

                <div className="flex-shrink-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(sub)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteConfirm(sub.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}

        {filteredSubs.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground italic">
              {searchQuery ? 'No sub-chapters match your search.' : 'No sub-chapters yet.'}
            </p>
          </div>
        )}
      </Accordion>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-16 mb-12">
          <Pagination>
            <PaginationContent className="gap-2">
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={e => {
                    e.preventDefault()
                    setPage(p => Math.max(1, p - 1))
                  }}
                  className={cn(
                    "rounded-xl px-4 h-11 bg-muted/50 hover:bg-muted border-none",
                    page === 1 ? 'pointer-events-none opacity-40' : ''
                  )}
                />
              </PaginationItem>

              <div className="flex items-center gap-1 mx-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= page - 1 && pageNum <= page + 1)
                  ) {
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => { e.preventDefault(); setPage(pageNum) }}
                          isActive={page === pageNum}
                          className={cn(
                            "h-11 w-11 rounded-xl text-base transition-all",
                            page === pageNum
                              ? "border-muted-foreground/20 bg-transparent hover:bg-muted"
                              : "hover:bg-muted"
                          )}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  }
                  if (pageNum === page - 2 || pageNum === page + 2) {
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationEllipsis className="h-11 w-11" />
                      </PaginationItem>
                    )
                  }
                  return null
                })}
              </div>

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={e => {
                    e.preventDefault()
                    setPage(p => Math.min(totalPages, p + 1))
                  }}
                  className={cn(
                    "rounded-xl px-4 h-11 hover:bg-muted border-none",
                    page === totalPages ? 'pointer-events-none opacity-40' : ''
                  )}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* FAB */}
      <Button
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl z-50 transition-all hover:scale-110 active:scale-95 bg-primary text-primary-foreground"
        size="icon"
        onClick={() => setShowAddDialog(true)}
      >
        <Plus className="h-7 w-7" />
        <span className="sr-only">Add Sub-chapter</span>
      </Button>

      {/* Add Sub-chapter Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>New Sub-chapter</DialogTitle>
            <DialogDescription>
              Create a new sub-chapter for this topic.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g. Introduction to Neural Networks"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="Write your notes here... (optional)"
                rows={6}
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSubchapter} disabled={loading || !newTitle.trim()}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Sub-chapter Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Sub-chapter</DialogTitle>
            <DialogDescription>
              Update the title or content of this sub-chapter.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-content">Content</Label>
              <Textarea
                id="edit-content"
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={loading || !editTitle.trim()}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Sub-chapter</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this sub-chapter? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
