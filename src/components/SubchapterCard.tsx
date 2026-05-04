'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Subchapter } from '@/lib/types'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import ConfirmDialog from './ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Calendar,
  Clock,
  GripVertical
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface SubchapterCardProps {
  subchapter: Subchapter
  topicId: string
  isOpen: boolean
  onToggle: () => void
  userEmail: string
}

function getRelativeTime(date: string) {
  const now = new Date()
  const created = new Date(date)
  const diffInMs = now.getTime() - created.getTime()
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInHours < 1) {
    return 'Baru saja'
  }
  if (diffInHours < 24) {
    return `${diffInHours} jam yang lalu`
  }
  if (diffInDays === 1) {
    return 'Kemarin'
  }
  return `${diffInDays} hari yang lalu`
}

export default function SubchapterCard({
  subchapter,
  topicId,
  isOpen,
  onToggle,
  userEmail
}: SubchapterCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [title, setTitle] = useState(subchapter.title)
  const [content, setContent] = useState(subchapter.content ?? '')
  const [loading, setLoading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: subchapter.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  }

  // Auto-resize textarea
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [isEditing, content])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase
      .from('subchapters')
      .update({ title, content })
      .eq('id', subchapter.id)

    if (error) {
      alert(error.message)
      setLoading(false)
    } else {
      setIsEditing(false)
      setLoading(false)
      router.refresh()
    }
  }

  const handleDelete = async () => {
    setLoading(true)
    const { error } = await supabase.from('subchapters').delete().eq('id', subchapter.id)

    if (error) {
      alert(error.message)
      setLoading(false)
    } else {
      setShowDeleteConfirm(false)
      router.refresh()
    }
  }

  if (isEditing) {
    return (
      <Card
        ref={setNodeRef}
        style={style}
        className="border-primary/30 shadow-xl overflow-hidden animate-in fade-in duration-300"
      >
        <form onSubmit={handleUpdate}>
          <CardHeader className="p-6 space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold px-1">
                Judul Sub-bab
              </label>
              <Input
                required
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-muted/30 h-12 text-lg font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold px-1">
                Catatan
              </label>
              <Textarea
                ref={textareaRef}
                className="min-h-[100px] bg-muted/30 resize-none leading-relaxed text-base overflow-hidden"
                placeholder="Tulis catatan Anda di sini..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          </CardHeader>
          <div className="flex items-center justify-end gap-3 bg-muted/30 p-4 border-t">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsEditing(false)}
              className="rounded-xl"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="rounded-xl px-8"
            >
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </form>
      </Card>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex flex-col rounded-2xl border bg-card transition-all duration-300 shadow-sm",
        isOpen ? "ring-2 ring-primary/10 border-primary/20" : "",
        isDragging && "opacity-50"
      )}
    >
      {/* Header Area with Date and Drag Handle */}
      <div className="flex items-center justify-between px-6 pt-6 pb-2">
        <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider">
          <Calendar className="h-3.5 w-3.5" />
          {new Date(subchapter.created_at).toLocaleDateString()}
        </div>
        <Button
          variant="ghost"
          size="icon"
          {...attributes}
          {...listeners}
          className="h-8 w-8 cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-primary transition-colors"
          title="Geser untuk mengatur ulang"
        >
          <GripVertical className="h-4 w-4" />
        </Button>
      </div>

      {/* Title and Action area */}
      <div className="px-6 pb-2">
        <button
          onClick={onToggle}
          className="group/title text-left block w-full"
        >
          <h4 className={cn(
            "text-2xl font-bold tracking-tight transition-colors leading-tight",
            isOpen ? "text-primary" : "text-foreground"
          )}>
            {subchapter.title}
          </h4>
          <p className="mt-1 text-sm text-muted-foreground/60 font-medium">
            Subject Note, {userEmail || 'User'}
          </p>
        </button>
      </div>

      {/* Content Area */}
      <div className="px-6 py-4">
        <div className={cn(
          "prose prose-sm dark:prose-invert max-w-none transition-all duration-300",
          !isOpen && "line-clamp-2 text-muted-foreground/80"
        )}>
          {subchapter.content ? (
            <p className={cn(
              "leading-relaxed whitespace-pre-wrap",
              isOpen ? "text-foreground" : "text-muted-foreground/80"
            )}>
              {subchapter.content}
            </p>
          ) : (
            <p className="italic text-muted-foreground/40">Tidak ada catatan untuk bagian ini.</p>
          )}
        </div>
      </div>

      {/* Footer / Stats and Actions */}
      <div className="px-6 py-5 border-t mt-2 flex items-center justify-between bg-muted/5 rounded-b-2xl">
        <div className="flex items-center gap-6 text-muted-foreground/60">
          <div className="flex items-center gap-1.5 cursor-default">
            <Clock className="h-4 w-4" />
            <span className="text-[11px] font-bold">
              {getRelativeTime(subchapter.created_at)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/topics/${topicId}/${subchapter.id}`}
            className="bg-black dark:bg-white text-white dark:text-black text-xs uppercase tracking-widest px-6 py-2 rounded-lg transition-none"
          >
            Detail
          </Link>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Hapus Catatan"
        message={`Apakah Anda yakin ingin menghapus "${subchapter.title}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel={loading ? 'Menghapus...' : 'Hapus'}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  )
}
