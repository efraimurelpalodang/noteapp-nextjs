'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { createBrowserClient } from '@supabase/ssr'

export function CommandMenu() {
  const [open, setOpen] = useState(false)
  const [topics, setTopics] = useState<any[]>([])
  const [subchapters, setSubchapters] = useState<any[]>([])
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const fetchSearchData = async () => {
      const [{ data: t }, { data: s }] = await Promise.all([
        supabase.from('topics').select('id, title'),
        supabase.from('subchapters').select('id, title, topic_id')
      ])
      if (t) setTopics(t)
      if (s) setSubchapters(s)
    }
    
    // Fetch once when menu is first opened could save bandwidth, but fetching on mount is fine too.
    fetchSearchData()
  }, [supabase])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    const onCustomEvent = () => setOpen(true)

    document.addEventListener('keydown', down)
    window.addEventListener('open-command-menu', onCustomEvent)
    return () => {
      document.removeEventListener('keydown', down)
      window.removeEventListener('open-command-menu', onCustomEvent)
    }
  }, [])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <Command>
        <CommandInput placeholder="Search topics or sub-chapters..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Topics">
            {topics.map(topic => (
              <CommandItem
                key={topic.id}
                value={topic.title}
                onSelect={() => {
                  router.push(`/topics/${topic.id}`)
                  setOpen(false)
                }}
              >
                {topic.title}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Sub-chapters">
            {subchapters.map(sub => (
              <CommandItem
                key={sub.id}
                value={sub.title}
                onSelect={() => {
                  router.push(`/topics/${sub.topic_id}`)
                  setOpen(false)
                }}
              >
                {sub.title}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
