'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Modal from './Modal'

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
      setError('You must be logged in')
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
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 transition-colors border border-slate-700 shadow-lg shadow-slate-900/20"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        New Sub-chapter
      </button>

      <Modal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        title="Create New Sub-chapter"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-1">
              Title
            </label>
            <input
              type="text"
              required
              autoFocus
              className="block w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 focus:outline-hidden transition-all"
              placeholder="e.g. Introduction to Physics"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-1">
              Initial Notes (Optional)
            </label>
            <textarea
              className="block w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 focus:outline-hidden min-h-[150px] resize-none transition-all"
              placeholder="Start writing your notes..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-lg shadow-indigo-900/20"
            >
              {loading ? 'Creating...' : 'Create Sub-chapter'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}
