'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Modal from './Modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Plus, BookMarked, Sparkles } from 'lucide-react'

interface AddSubchapterFormProps {
  topicId: string
}

export default function AddSubchapterForm({ topicId }: AddSubchapterFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')

  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      setError('Anda harus masuk terlebih dahulu')
      setLoading(false)
      return
    }

    // Get current count to set order
    const { count } = await supabase
      .from('subchapters')
      .select('*', { count: 'exact', head: true })
      .eq('topic_id', topicId)

    const { error } = await supabase.from('subchapters').insert({
      title,
      content: content || null,
      topic_id: topicId,
      user_id: user.id,
      order: count ?? 0,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setTitle('')
      setContent('')
      setIsOpen(false)
      setLoading(false)
      router.refresh()
    }
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="secondary"
        className="gap-2 rounded-xl shadow-none hover:bg-secondary/100 active:scale-95 cursor-pointer"
      >
        <Plus className="h-5 w-5" />
        Tambah Sub-bab Baru
      </Button>

      <Modal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        title="Tambah Sub-bab Baru"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-xs font-medium text-destructive animate-in fade-in slide-in-from-top-1">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold px-1 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-primary" />
              Judul Sub-bab
            </label>
            <Input
              required
              autoFocus
              className="h-12 rounded-xl border-border bg-muted/30 px-4 focus-visible:ring-primary/20 transition-all"
              placeholder="contoh: Konsep Dasar"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold px-1 flex items-center gap-1.5">
              <BookMarked className="h-3 w-3 text-primary" />
              Catatan Awal (Opsional)
            </label>
            <Textarea
              className="min-h-[180px] rounded-xl border-border bg-muted/30 px-4 py-3 focus-visible:ring-primary/20 resize-none transition-all leading-relaxed"
              placeholder="Mulai menulis catatan belajar Anda..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsOpen(false)}
              className="rounded-xl font-medium cursor-pointer"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="rounded-xl font-bold px-8 shadow-none cursor-pointer"
            >
              {loading ? 'Menambahkan...' : 'Tambah Sub-bab'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
