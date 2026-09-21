import { NextRequest, NextResponse } from 'next/server'
import { buildSystemPrompt, BOUJIE_TOOLS, executeBoujieTool } from '@/lib/boujie'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5'
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'
const MAX_TOOL_ROUNDS = 4
const MAX_HISTORY_MESSAGES = 20
const MAX_MESSAGE_CHARS = 4000

interface ChatMessage { role: 'user' | 'assistant'; content: any }

async function callAnthropic(messages: ChatMessage[], localeLabel?: string) {
  const res = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY as string,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 1024,
      system: buildSystemPrompt(localeLabel),
      tools: BOUJIE_TOOLS,
      messages,
    }),
  })
  if (!res.ok) {
    const bodyText = await res.text().catch(() => '')
    throw new Error(`Anthropic API responded ${res.status}: ${bodyText.slice(0, 500)}`)
  }
  return res.json()
}

export async function POST(req: NextRequest) {
  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json({ ok: false, error: 'Boujie is not configured yet — missing API key.' }, { status: 503 })
  }

  let data: any
  try {
    data = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 })
  }

  const incoming: { role: string; content: string }[] = Array.isArray(data?.messages) ? data.messages : []
  const localeLabel: string | undefined = typeof data?.localeLabel === 'string' ? data.localeLabel.slice(0, 40) : undefined
  if (!incoming.length) {
    return NextResponse.json({ ok: false, error: 'No message provided.' }, { status: 400 })
  }

  // Keep the payload bounded — trim history and per-message length.
  const trimmed = incoming.slice(-MAX_HISTORY_MESSAGES).map(m => ({
    role: m.role === 'assistant' ? 'assistant' as const : 'user' as const,
    content: String(m.content || '').slice(0, MAX_MESSAGE_CHARS),
  }))

  const messages: ChatMessage[] = trimmed.map(m => ({ role: m.role, content: m.content }))
  const toolCalls: { name: string; input: unknown; output: unknown }[] = []

  try {
    let round = 0
    while (round < MAX_TOOL_ROUNDS) {
      round++
      const response = await callAnthropic(messages, localeLabel)
      const content: any[] = response.content || []
      const toolUses = content.filter(b => b.type === 'tool_use')

      if (!toolUses.length) {
        const text = content.filter(b => b.type === 'text').map(b => b.text).join('\n').trim()
        return NextResponse.json({ ok: true, reply: text || "Sorry, I didn't quite catch that — could you rephrase?", toolCalls })
      }

      // Assistant turn (with its tool_use blocks) goes back into history, followed by our tool_result turn.
      messages.push({ role: 'assistant', content })
      const toolResults = toolUses.map(tu => {
        const output = executeBoujieTool(tu.name, tu.input)
        toolCalls.push({ name: tu.name, input: tu.input, output })
        return { type: 'tool_result', tool_use_id: tu.id, content: JSON.stringify(output) }
      })
      messages.push({ role: 'user', content: toolResults })
    }

    return NextResponse.json({ ok: true, reply: "I've worked through a few calculations but need a bit more detail to finish — could you clarify your last request?", toolCalls })
  } catch (err) {
    console.error('Boujie chat error:', err)
    return NextResponse.json({ ok: false, error: 'Boujie is having trouble responding right now. Please try again shortly, or use the premium sizing tools directly.' }, { status: 502 })
  }
}
