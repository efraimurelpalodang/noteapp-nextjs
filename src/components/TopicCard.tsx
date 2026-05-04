'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Topic } from '@/lib/types'
import Link from 'next/link'
import ConfirmDialog from './ConfirmDialog'
import { Pencil, Trash2, Calendar, FileText } from 'lucide-react'
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
      <div className="py-6 border-b border-slate-100 dark:border-slate-800 animate-in fade-in duration-300">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                Judul Topik
              </label>
              <Input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                Deskripsi
              </label>
              <Textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border-none resize-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
            >
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <>
      <div className="py-6 border-b border-slate-100 dark:border-slate-800 group relative flex flex-col gap-3 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors -mx-4 px-4 rounded-xl sm:mx-0 sm:px-0 sm:hover:bg-transparent sm:rounded-none">
        <div className="flex items-start justify-between gap-4">
          <Link href={`/topics/${topic.id}`} className="block flex-1">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-tight mb-1 pr-12">
              {topic.title}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
              {topic.description || 'Tidak ada deskripsi'}
            </p>
          </Link>
          
          <div className="flex items-center gap-3 absolute right-4 sm:right-0 top-6">
            <button
              onClick={() => setIsEditing(true)}
              className="text-black dark:text-white hover:opacity-70 transition-opacity cursor-pointer p-1"
              title="Edit topik"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-black dark:text-white hover:opacity-70 transition-opacity cursor-pointer p-1"
              title="Hapus topik"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <Link href={`/topics/${topic.id}`} className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400">
              {subchapterCount} {subchapterCount === 1 ? 'Sub-bab' : 'Sub-bab'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 font-medium tracking-wide">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(topic.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              Note
            </div>
          </div>
        </Link>
      </div>

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
