'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Topic } from '@/lib/types'
import Link from 'next/link'
import ConfirmDialog from './ConfirmDialog'

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
      <div className="rounded-2xl bg-slate-800/50 p-6 border border-indigo-500/50 shadow-2xl animate-in fade-in duration-300">
        <form onSubmit={handleUpdate} className="space-y-4">
          <input
            type="text"
            required
            className="block w-full rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-2 text-white focus:border-indigo-500 focus:outline-hidden"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            rows={2}
            className="block w-full rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-2 text-white focus:border-indigo-500 focus:outline-hidden resize-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-sm font-medium text-slate-400 hover:text-white px-2 py-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="group relative rounded-2xl bg-slate-800/30 p-6 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 transition-all duration-300 shadow-lg">
      <div className="flex items-start justify-between">
        <Link href={`/topics/${topic.id}`} className="flex-1">
          <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">
            {topic.title}
          </h3>
          <p className="mt-2 text-sm text-slate-400 line-clamp-2">
            {topic.description || 'No description provided.'}
          </p>
          <div className="mt-4 flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-medium text-indigo-400 border border-indigo-500/20">
              {subchapterCount} {subchapterCount === 1 ? 'subchapter' : 'subchapters'}
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-slate-400 hover:text-indigo-400 transition-colors"
            title="Edit topic"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 text-slate-400 hover:text-red-400 transition-colors"
            title="Delete topic"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Topic"
        message={`Are you sure you want to delete "${topic.title}" and all its subchapters? This action cannot be undone.`}
        confirmLabel={loading ? 'Deleting...' : 'Delete'}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  )
}
