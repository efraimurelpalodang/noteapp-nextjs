'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface AddSubchapterFormProps {
  topicId: string
}

export default function AddSubchapterForm({ topicId }: AddSubchapterFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
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
      topic_id: topicId,
      user_id: user.id,
      order: count ?? 0,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setTitle('')
      setIsOpen(false)
      setLoading(false)
      router.refresh()
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 transition-colors border border-slate-700"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        New Sub-chapter
      </button>
    )
  }

  return (
    <div className="w-full rounded-xl bg-slate-800/50 p-4 border border-slate-700 animate-in fade-in zoom-in duration-200">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-xs text-red-400">
            {error}
          </div>
        )}
        <input
          type="text"
          required
          autoFocus
          className="block w-full rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-hidden"
          placeholder="Sub-chapter title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-xs font-medium text-slate-400 hover:text-white px-2 py-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Sub-chapter'}
          </button>
        </div>
      </form>
    </div>
  )
}
