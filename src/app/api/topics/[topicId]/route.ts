import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: { topicId: string } }
) {
  const supabase = await createClient()
  const body = await request.json()
  const { data, error } = await supabase
    .from('topics')
    .update(body)
    .eq('id', params.topicId)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(
  _: Request,
  { params }: { params: { topicId: string } }
) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('topics')
    .delete()
    .eq('id', params.topicId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
