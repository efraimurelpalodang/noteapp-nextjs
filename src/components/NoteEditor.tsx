'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface NoteEditorProps {
  subchapterId: string
  topicId: string
  initialContent: string
}

export default function NoteEditor({ subchapterId, topicId, initialContent }: NoteEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const hasChanges = content !== initialContent

  // Auto-hide "Saved!" message after 3 seconds
  useEffect(() => {
    if (isSaved) {
      const timer = setTimeout(() => setIsSaved(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [isSaved])

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)

    const { error: updateError } = await supabase
      .from('subchapters')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', subchapterId)

    if (updateError) {
      setError(updateError.message)
      setIsSaving(false)
    } else {
      setIsSaving(false)
      setIsSaved(true)
      router.refresh()
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Editor Header / Toolbar */}
      <div className="flex items-center justify-between sticky top-0 bg-slate-950/80 backdrop-blur-md py-4 z-10 border-b border-slate-800/50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/topics/${topicId}`)}
            className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          
          <div className="h-4 w-px bg-slate-800" />
          
          <div className="flex items-center gap-2 min-h-[24px]">
            {hasChanges && !isSaving && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-amber-400 animate-pulse">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                Unsaved changes
              </span>
            )}
            {isSaved && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Changes saved
              </span>
            )}
            {error && (
              <span className="text-xs font-medium text-red-400">
                Error: {error}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving || !hasChanges}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/40 disabled:opacity-50 disabled:grayscale disabled:hover:bg-indigo-600 disabled:shadow-none"
        >
          {isSaving ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>

      {/* Main Textarea */}
      <div className="relative group">
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-b from-indigo-500/10 to-transparent opacity-0 blur-xl transition-opacity group-focus-within:opacity-100" />
        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value)
            if (isSaved) setIsSaved(false)
          }}
          placeholder="Start writing your study notes here..."
          className="relative min-h-[600px] w-full resize-none rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-lg leading-relaxed text-slate-200 outline-hidden transition-all placeholder:text-slate-600 focus:border-indigo-500/50 focus:bg-slate-900/80 focus:ring-4 focus:ring-indigo-500/5"
          spellCheck="false"
        />
      </div>

      <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-slate-600 font-bold px-2">
        <span>Sub-chapter Content</span>
        <span>{content.length} characters</span>
      </div>
    </div>
  )
}
