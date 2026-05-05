'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ChevronRight, MoreVertical } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
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
import { createBrowserClient } from '@supabase/ssr'
import { toast } from 'sonner'

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  return `${weeks}w ago`
}

export function TopicCard({ topic, onDeleted }: { topic: any; onDeleted: () => void }) {
  const router = useRouter()
  const [showDelete, setShowDelete] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [editTitle, setEditTitle] = useState(topic.title)
  const [editDescription, setEditDescription] = useState(topic.description || '')
  const [saving, setSaving] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleDelete = async () => {
    const { error } = await supabase.from('topics').delete().eq('id', topic.id)
    if (error) {
      toast.error('Failed to delete topic')
    } else {
      toast.success('Topic deleted')
      onDeleted()
    }
    setShowDelete(false)
  }

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) return
    setSaving(true)
    const { error } = await supabase
      .from('topics')
      .update({ title: editTitle.trim(), description: editDescription.trim() || null })
      .eq('id', topic.id)
    setSaving(false)
    if (error) {
      toast.error('Failed to update topic')
    } else {
      toast.success('Topic updated')
      // Update local display values
      topic.title = editTitle.trim()
      topic.description = editDescription.trim() || null
      setShowEdit(false)
    }
  }

  const subCount = topic.subchapters?.[0]?.count ?? 0

  return (
    <>
      <Card
        className="group cursor-pointer hover:border-border/80 hover:shadow-sm transition-all duration-150"
        onClick={() => router.push(`/topics/${topic.id}`)}
      >
        <CardContent className="px-4 py-4">
          <div className="flex items-center gap-3">
            {/* Text content */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-base leading-snug line-clamp-1">
                {topic.title}
              </p>
              {topic.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                  {topic.description}
                </p>
              )}
              <p className="text-sm mt-1.5 text-zinc-400 dark:text-zinc-500">
                {subCount} Sub-chapter{subCount !== 1 ? 's' : ''} &bull; Last updated{' '}
                {timeAgo(topic.updated_at || topic.created_at)}
              </p>
            </div>

            {/* Actions + chevron */}
            <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-32 p-1">
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-8 text-sm"
                    onClick={() => setShowEdit(true)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-8 text-sm text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setShowDelete(true)}
                  >
                    Delete
                  </Button>
                </PopoverContent>
              </Popover>
              <ChevronRight className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent onClick={e => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Edit Topic</DialogTitle>
            <DialogDescription className="sr-only">
              Update the title and description of your topic.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor={`edit-title-${topic.id}`}>Title</Label>
              <Input
                id={`edit-title-${topic.id}`}
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                placeholder="Topic title"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor={`edit-desc-${topic.id}`}>Description</Label>
              <Textarea
                id={`edit-desc-${topic.id}`}
                value={editDescription}
                onChange={e => setEditDescription(e.target.value)}
                placeholder="Short description (optional)"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEdit(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={saving || !editTitle.trim()}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete AlertDialog */}
      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent onClick={e => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Topic</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? This will also delete all sub-chapters inside.
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
    </>
  )
}
