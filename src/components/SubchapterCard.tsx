'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Subchapter } from '@/lib/types'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import ConfirmDialog from './ConfirmDialog'

interface SubchapterCardProps {
  subchapter: Subchapter
  topicId: string
  isOpen: boolean
  onToggle: () => void
}

export default function SubchapterCard({ 
  subchapter, 
  topicId, 
  isOpen, 
  onToggle 
}: SubchapterCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [title, setTitle] = useState(subchapter.title)
  const [content, setContent] = useState(subchapter.content ?? '')
  const [loading, setLoading] = useState(false)
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
      <div 
        ref={setNodeRef} 
        style={style}
        className="rounded-xl bg-slate-800 p-4 border border-indigo-500/50 shadow-xl"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <input
            type="text"
            required
            autoFocus
            className="block w-full rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-hidden"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="block w-full rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-hidden min-h-[150px] resize-y"
            placeholder="Notes (optional)..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-xs font-medium text-slate-400 hover:text-white px-2 py-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex flex-col gap-3 rounded-xl bg-slate-800/30 border border-slate-800 transition-all duration-300 ${
        isOpen ? 'ring-1 ring-indigo-500/30 bg-slate-800/50 border-indigo-500/20 shadow-lg' : 'hover:border-slate-700 hover:bg-slate-800/40'
      } ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center gap-3 p-4">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 text-slate-600 hover:text-slate-400 transition-colors"
          title="Drag to reorder"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </button>

        <button
          onClick={onToggle}
          className="flex-1 min-w-0 text-left flex items-center justify-between group"
        >
          <h4 className={`text-sm font-medium transition-colors truncate ${
            isOpen ? 'text-indigo-400' : 'text-slate-200 group-hover:text-white'
          }`}>
            {subchapter.title}
          </h4>
          <svg 
            className={`h-4 w-4 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-indigo-400' : ''}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 text-slate-500 hover:text-indigo-400 transition-colors"
            title="Edit"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
            title="Delete"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="px-12 pb-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="rounded-xl bg-slate-900/50 p-6 border border-slate-800/50 prose prose-invert prose-sm max-w-none">
            {subchapter.content ? (
              <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                {subchapter.content}
              </p>
            ) : (
              <p className="text-slate-500 italic">No notes provided for this sub-chapter.</p>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Sub-chapter"
        message={`Are you sure you want to delete "${subchapter.title}"? This action cannot be undone.`}
        confirmLabel={loading ? 'Deleting...' : 'Delete'}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  )
}
