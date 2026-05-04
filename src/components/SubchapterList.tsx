'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Subchapter } from '@/lib/types'
import SubchapterCard from './SubchapterCard'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { Layers } from 'lucide-react'

interface SubchapterListProps {
  initialSubchapters: Subchapter[]
  topicId: string
}

export default function SubchapterList({ initialSubchapters, topicId }: SubchapterListProps) {
  const [subchapters, setSubchapters] = useState(initialSubchapters)
  const [userEmail, setUserEmail] = useState<string>('')
  const supabase = createClient()

  useEffect(() => {
    setSubchapters(initialSubchapters)
  }, [initialSubchapters])

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) setUserEmail(user.email)
    }
    getUser()
  }, [supabase])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = subchapters.findIndex((s) => s.id === active.id)
      const newIndex = subchapters.findIndex((s) => s.id === over.id)

      const reordered = arrayMove(subchapters, oldIndex, newIndex)

      // Optimistic update
      setSubchapters(reordered)

      // Persist to Supabase
      try {
        const updates = reordered.map((s, index) =>
          supabase
            .from('subchapters')
            .update({ order: index })
            .eq('id', s.id)
        )

        const results = await Promise.all(updates)
        const errors = results.filter(r => r.error)

        if (errors.length > 0) {
          console.error('Failed to persist new order', errors)
        }
      } catch (err) {
        console.error('Error updating order:', err)
      }
    }
  }

  const [activeId, setActiveId] = useState<string | null>(null)

  const handleToggle = (id: string) => {
    setActiveId((prev) => (prev === id ? null : id))
  }

  if (subchapters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-muted bg-muted/5 py-16 px-6 text-center animate-in fade-in duration-500">
        <div className="rounded-2xl bg-muted/50 p-4 mb-4 shadow-inner">
          <Layers className="h-10 w-10 text-muted-foreground/40" />
        </div>
        <h3 className="text-lg font-bold text-foreground">No chapters yet</h3>
        <p className="mt-1 text-sm text-muted-foreground max-w-xs mx-auto">
          This topic is waiting for its first sub-chapter. Add one above to get started.
        </p>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={subchapters.map((s) => s.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-4">
          {subchapters.map((subchapter) => (
            <SubchapterCard
              key={subchapter.id}
              subchapter={subchapter}
              topicId={topicId}
              isOpen={activeId === subchapter.id}
              onToggle={() => handleToggle(subchapter.id)}
              userEmail={userEmail}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
