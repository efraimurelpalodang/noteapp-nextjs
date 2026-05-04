'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Edit2, Trash2, Clock } from 'lucide-react'
import { Subchapter } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import ConfirmDialog from './ConfirmDialog'

interface SubchapterLayoutProps {
  topicId: string
  topicTitle: string
  subchapter: Subchapter
  userEmail: string
}

export default function SubchapterLayout({ topicId, topicTitle, subchapter, userEmail }: SubchapterLayoutProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    setLoading(true)
    const { error } = await supabase.from('subchapters').delete().eq('id', subchapter.id)

    if (error) {
      alert(error.message)
      setLoading(false)
    } else {
      setShowDeleteConfirm(false)
      router.push(`/topics/${topicId}`)
      router.refresh()
    }
  }

  const [editTitle, setEditTitle] = useState(subchapter.title)
  const [editContent, setEditContent] = useState(subchapter.content ?? '')
  const [isSaving, setIsSaving] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [isEditing, editContent])

  const handleSaveInline = async () => {
    setIsSaving(true)
    const { error } = await supabase
      .from('subchapters')
      .update({ title: editTitle, content: editContent, updated_at: new Date().toISOString() })
      .eq('id', subchapter.id)

    if (error) {
      alert(error.message)
    } else {
      setIsEditing(false)
      router.refresh()
    }
    setIsSaving(false)
  }

  const readingTime = Math.max(1, Math.ceil((subchapter.content?.split(' ').length || 0) / 200))

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="mb-6">
          <Link 
            href={`/topics/${topicId}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Daftar Sub-bab
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          
          {/* Left Column (Main Content) */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
            {isEditing ? (
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4 leading-tight bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            ) : (
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
                {subchapter.title}
              </h1>
            )}
            
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-xs font-medium">#Note</span>
              <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-xs font-medium">#{topicTitle.replace(/\s+/g, '')}</span>
            </div>

            <div className="text-sm text-slate-600 dark:text-slate-400 mb-8 border-b border-slate-100 dark:border-slate-800 pb-8">
              <span className="font-medium text-slate-900 dark:text-slate-200">{userEmail || 'Author'}</span>
            </div>

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Catatan</h3>
            </div>
            
            {isEditing ? (
              <div className="space-y-4 animate-in fade-in duration-300">
                <textarea
                  ref={textareaRef}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full min-h-[100px] p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-hidden resize-none leading-relaxed"
                  placeholder="Tulis catatan di sini..."
                />
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSaveInline}
                    disabled={isSaving}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-xl transition-colors disabled:opacity-50"
                  >
                    {isSaving ? 'Menyimpan...' : 'Simpan'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setEditContent(subchapter.content ?? '')
                      setEditTitle(subchapter.title)
                    }}
                    className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium py-2 px-6 rounded-xl transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in duration-300">
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  {subchapter.content ? (
                    <div className="whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-300">
                      {subchapter.content}
                    </div>
                  ) : (
                    <p className="italic text-slate-400">Tidak ada konten untuk sub-bab ini.</p>
                  )}
                </div>
                
                <div className="mt-12 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center gap-4">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black font-medium py-2.5 px-6 rounded-xl transition-all hover:opacity-90 text-sm"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit Catatan
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-2 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 font-medium py-2.5 px-6 rounded-xl border border-red-200 dark:border-red-900/50 transition-all hover:bg-red-100 dark:hover:bg-red-900/50 text-sm"
                  >
                    <Trash2 className="h-4 w-4" />
                    Hapus
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column (Sidebar) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm sticky top-24">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-6">Informasi Detail</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                    Tanggal Dibuat
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-slate-700 dark:text-slate-300 font-medium">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    {new Date(subchapter.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                    Terakhir Edit
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-slate-700 dark:text-slate-300">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    {new Date(subchapter.updated_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                    Topik
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-slate-700 dark:text-slate-300 font-medium">
                    <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
                    <span className="truncate max-w-[100px]">{topicTitle}</span>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                    Estimasi Baca
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-slate-700 dark:text-slate-300">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    {readingTime} Menit
                  </div>
                </div>

                <div className="col-span-2 mt-2">
                  <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                    Status
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                    Aktif
                  </div>
                </div>
              </div>
            </div>
          </div>

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
