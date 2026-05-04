'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Topic } from '@/lib/types'
import Link from 'next/link'
import ConfirmDialog from './ConfirmDialog'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Pencil, Trash2, BookOpen, Calendar } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface TopicCardProps {
  topic: Topic
}

export default function TopicCard({ topic }: TopicCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [title, setTitle] = useState(topic.title)
  const [description, setDescription] = useState(topic.description || '')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase
      .from('topics')
      .update({ title, description: description || null })
      .eq('id', topic.id)

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
    const { error } = await supabase.from('topics').delete().eq('id', topic.id)

    if (error) {
      alert(error.message)
      setLoading(false)
    } else {
      setShowDeleteConfirm(false)
      router.refresh()
    }
  }

  const subchapterCount = topic.subchapters?.[0]?.count || 0

  if (isEditing) {
    return (
      <Card className="border-primary/20 shadow-none animate-in fade-in duration-300">
        <form onSubmit={handleUpdate}>
          <CardHeader className="p-6 space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                Judul Topik
              </label>
              <Input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-muted/50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                Deskripsi
              </label>
              <Textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-muted/50 resize-none"
              />
            </div>
          </CardHeader>
          <CardFooter className="flex justify-end gap-2 p-6 border-t bg-muted/5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(false)}
              className="cursor-pointer"
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading}
              className="cursor-pointer"
            >
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    )
  }

  return (
    <>
      <Card className="group flex flex-col h-full border-border/50 transition-all duration-300 overflow-hidden bg-card/50 backdrop-blur-xs shadow-none">
        <Link href={`/topics/${topic.id}`} className="flex-1">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5 min-w-0">
                <CardTitle className="text-xl font-bold tracking-tight truncate transition-colors">
                  {topic.title}
                </CardTitle>
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                  <Calendar className="h-3 w-3" />
                  {new Date(topic.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <BookOpen className="h-5 w-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-sm line-clamp-3 leading-relaxed text-muted-foreground/80">
              {topic.description || 'Tidak ada deskripsi untuk topik ini.'}
            </CardDescription>
          </CardContent>
        </Link>
        <CardFooter className="flex items-center justify-between border-t bg-muted/20 py-3 mt-auto px-6">
          <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10">
            {subchapterCount} {subchapterCount === 1 ? 'sub-bab' : 'sub-bab'}
          </Badge>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(true)}
              className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary cursor-pointer"
              title="Edit topik"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDeleteConfirm(true)}
              className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive cursor-pointer"
              title="Hapus topik"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Hapus Topik"
        message={`Apakah Anda yakin ingin menghapus "${topic.title}"? Semua sub-bab dan catatan di dalamnya juga akan terhapus secara permanen.`}
        confirmLabel={loading ? 'Menghapus...' : 'Hapus Topik'}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  )
}
