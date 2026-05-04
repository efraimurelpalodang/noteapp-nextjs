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

interface SubchapterListProps {
  initialSubchapters: Subchapter[]
  topicId: string
}

export default function SubchapterList({ initialSubchapters, topicId }: SubchapterListProps) {
  const [subchapters, setSubchapters] = useState(initialSubchapters)
  const supabase = createClient()

  useEffect(() => {
    setSubchapters(initialSubchapters)
  }, [initialSubchapters])

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
          // Revert on error? Or just notify?
        }
      } catch (err) {
        console.error('Error updating order:', err)
      }
    }
  }

  if (subchapters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 py-12 text-center">
        <p className="text-sm text-slate-500">No sub-chapters yet.</p>
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
        <div className="flex flex-col gap-3">
          {subchapters.map((subchapter) => (
            <SubchapterCard
              key={subchapter.id}
              subchapter={subchapter}
              topicId={topicId}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
