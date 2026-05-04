export type Topic = {
  id: string
  user_id: string
  title: string
  description: string | null
  created_at: string
  updated_at: string
  subchapters?: { count: number }[]
}

export type Subchapter = {
  id: string
  topic_id: string
  user_id: string
  title: string
  content: string | null
  order: number
  created_at: string
  updated_at: string
}
