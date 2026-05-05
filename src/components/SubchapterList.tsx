'use client'

import { useState, useCallback } from 'react'
import { Plus, GripVertical, ChevronDown, ChevronUp, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { createBrowserClient } from '@supabase/ssr'
import { toast } from 'sonner'

const ITEMS_PER_PAGE = 7

function SortableSubchapter({
  sub,
  openId,
  setOpenId,
  onDelete,
  onEdit,
}: {
  sub: any
  openId: string | null
  setOpenId: (id: string | null) => void
  onDelete: (id: string) => void
  onEdit: (id: string, title: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: sub.id })
  const [editMode, setEditMode] = useState(false)
  const [editTitle, setEditTitle] = useState(sub.title)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const isOpen = openId === sub.id

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleSaveTitle = () => {
    if (editTitle.trim() && editTitle !== sub.title) {
      onEdit(sub.id, editTitle.trim())
    }
    setEditMode(false)
  }

  return (
    <>
      <Card ref={setNodeRef} style={style} className="group">
        <CardContent className="p-0">
          <div
            className="flex items-center gap-3 p-4 cursor-pointer select-none"
            onClick={() => setOpenId(isOpen ? null : sub.id)}
          >
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
              onClick={e => e.stopPropagation()}
            >
              <GripVertical className="h-4 w-4" />
            </div>

            <div className="flex-1 min-w-0">
              {editMode ? (
                <Input
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleSaveTitle()
                    if (e.key === 'Escape') { setEditTitle(sub.title); setEditMode(false) }
                  }}
                  onClick={e => e.stopPropagation()}
                  autoFocus
                  className="h-7 text-sm font-medium"
                />
              ) : (
                <p className="font-medium line-clamp-1">{sub.title}</p>
              )}
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
              {editMode ? (
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleSaveTitle}>
                  <Pencil className="h-3 w-3" />
                </Button>
              ) : (
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditMode(true)}>
                  <Pencil className="h-3 w-3" />
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setShowDeleteAlert(true)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>

            {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
          </div>

          {isOpen && (
            <div className="px-4 pb-4 pt-0 border-t">
              <div className="pt-3 text-sm text-muted-foreground whitespace-pre-wrap">
                {sub.content || <span className="italic">No content yet.</span>}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Sub-chapter</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { onDelete(sub.id); setShowDeleteAlert(false) }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default function SubchapterList({
  topic,
  subchapters: initialSubs,
}: {
  topic: any
  subchapters: any[]
}) {
  const [subs, setSubs] = useState(initialSubs)
  const [page, setPage] = useState(1)
  const [openId, setOpenId] = useState<string | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [loading, setLoading] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const sensors = useSensors(useSensor(PointerSensor))
  const totalPages = Math.ceil(subs.length / ITEMS_PER_PAGE)
  const paginatedSubs = subs.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = subs.findIndex(s => s.id === active.id)
    const newIndex = subs.findIndex(s => s.id === over.id)
    const reordered = arrayMove(subs, oldIndex, newIndex)
    setSubs(reordered)
    await Promise.all(
      reordered.map((s, i) =>
        supabase.from('subchapters').update({ order: i }).eq('id', s.id)
      )
    )
  }, [subs, supabase])

  const handleAddSub = async () => {
    if (!newTitle.trim()) return
    setLoading(true)
    const toastId = toast.loading('Creating sub-chapter...')
    const { data, error } = await supabase
      .from('subchapters')
      .insert({ topic_id: topic.id, title: newTitle.trim(), content: newContent.trim() || null, order: subs.length })
      .select()
      .single()
    setLoading(false)
    toast.dismiss(toastId)
    if (error) {
      toast.error('Failed to create sub-chapter')
    } else {
      toast.success('Sub-chapter created')
      setSubs(prev => [...prev, data])
      setNewTitle('')
      setNewContent('')
      setShowAddDialog(false)
    }
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('subchapters').delete().eq('id', id)
    if (error) {
      toast.error('Failed to delete sub-chapter')
    } else {
      toast.success('Sub-chapter deleted')
      setSubs(prev => prev.filter(s => s.id !== id))
    }
  }

  const handleEdit = async (id: string, title: string) => {
    const { error } = await supabase.from('subchapters').update({ title }).eq('id', id)
    if (error) {
      toast.error('Failed to update title')
    } else {
      setSubs(prev => prev.map(s => s.id === id ? { ...s, title } : s))
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-2">
        Collections / {topic.title.toUpperCase()}
      </p>
      <h1 className="text-3xl font-bold mb-8">{topic.title}</h1>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={paginatedSubs.map(s => s.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-3">
            {paginatedSubs.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <p className="text-lg font-medium">No sub-chapters yet</p>
                <p className="text-sm mt-1">Click the + button to add your first sub-chapter</p>
              </div>
            ) : (
              paginatedSubs.map(sub => (
                <SortableSubchapter
                  key={sub.id}
                  sub={sub}
                  openId={openId}
                  setOpenId={setOpenId}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>

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

      {/* Add Sub-chapter Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Sub-chapter</DialogTitle>
            <DialogDescription className="sr-only">
              Add a new sub-chapter to this topic.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="sub-title">Title</Label>
              <Input
                id="sub-title"
                placeholder="e.g. Chapter 1: Introduction"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="sub-content">Content</Label>
              <Textarea
                id="sub-content"
                placeholder="Write your notes here..."
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddSub} disabled={loading || !newTitle.trim()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
