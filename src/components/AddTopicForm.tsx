'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Modal from './Modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { PlusCircle, Sparkles } from 'lucide-react'

export default function AddTopicForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
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
      setError('Anda harus masuk untuk membuat topik')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('topics').insert({
      title,
      description: description || null,
      user_id: user.id,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setTitle('')
      setDescription('')
      setIsOpen(false)
      setLoading(false)
      router.refresh()
    }
  }

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        className="gap-2 rounded-xl shadow-none hover:bg-primary/100 active:scale-95 cursor-pointer"
      >
        <PlusCircle className="h-5 w-5" />
        Topik Baru
      </Button>

      <Modal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        title="Buat Topik Baru"
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
              Judul Topik
            </label>
            <Input
              required
              autoFocus
              className="h-12 rounded-xl border-border bg-muted/30 px-4 focus-visible:ring-primary/20 transition-all"
              placeholder="contoh: Pengembangan Web Modern"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold px-1">
              Deskripsi (Opsional)
            </label>
            <Textarea
              className="min-h-[120px] rounded-xl border-border bg-muted/30 px-4 py-3 focus-visible:ring-primary/20 resize-none transition-all leading-relaxed"
              placeholder="Tentang apa topik ini?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
              {loading ? 'Membuat...' : 'Buat Topik'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
