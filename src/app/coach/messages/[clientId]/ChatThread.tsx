'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export interface Message {
  id: string
  coach_id: string
  client_id: string
  sender_id: string
  content: string
  created_at: string
  read: boolean
}

interface Props {
  coachId: string
  clientId: string
  userId: string
  peerName: string
  initialMessages: Message[]
  backHref: string
}

function formatTime(ts: string): string {
  const d = new Date(ts)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60_000) return 'just now'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
  if (diff < 86_400_000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function dateSeparator(ts: string): string {
  const d = new Date(ts)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 86_400_000 && now.getDate() === d.getDate()) return 'Today'
  if (diff < 2 * 86_400_000) return 'Yesterday'
  return d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })
}

export function ChatThread({ coachId, clientId, userId, peerName, initialMessages, backHref }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const supabase = createClient()

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: messages.length <= 1 ? 'instant' : 'smooth' })
  }, [messages])

  // Mark all unread incoming messages as read on mount
  useEffect(() => {
    supabase
      .from('messages')
      .update({ read: true })
      .eq('coach_id', coachId)
      .eq('client_id', clientId)
      .neq('sender_id', userId)
      .eq('read', false)
      .then(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coachId, clientId, userId])

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`chat-${coachId}-${clientId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `coach_id=eq.${coachId}`,
        },
        (payload) => {
          const msg = payload.new as Message
          if (msg.client_id !== clientId) return
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev
            return [...prev, msg]
          })
          // Auto-mark incoming messages as read since we have the thread open
          if (msg.sender_id !== userId) {
            supabase.from('messages').update({ read: true }).eq('id', msg.id).then(() => {})
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coachId, clientId, userId])

  async function send() {
    const trimmed = text.trim()
    if (!trimmed || sending) return
    setSending(true)
    setText('')
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    // Optimistic insert
    const tempId = `opt-${Date.now()}`
    const optimistic: Message = {
      id: tempId,
      coach_id: coachId,
      client_id: clientId,
      sender_id: userId,
      content: trimmed,
      created_at: new Date().toISOString(),
      read: false,
    }
    setMessages((prev) => [...prev, optimistic])

    const { data, error } = await supabase
      .from('messages')
      .insert({ coach_id: coachId, client_id: clientId, sender_id: userId, content: trimmed })
      .select()
      .single()

    if (error) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId))
      setText(trimmed)
    } else {
      setMessages((prev) => prev.map((m) => (m.id === tempId ? data : m)))
    }

    setSending(false)
    textareaRef.current?.focus()
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  function onInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  return (
    <div className="flex flex-col h-full">

      {/* ── Header ─────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border-8)] bg-[var(--bg-nav)] shrink-0">
        <Link
          href={backHref}
          className="text-[var(--fg-40)] hover:text-[var(--fg)] transition-colors p-1 -ml-1 rounded-lg hover:bg-[var(--bg-hover)]"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[var(--accent-wash)] to-[var(--accent-tint)] border border-[var(--accent-border-sub)] flex items-center justify-center shrink-0">
          <span className="text-sm font-semibold text-[var(--accent-fg)]">
            {peerName.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <p className="font-semibold text-sm leading-none">{peerName}</p>
          <p className="text-[11px] text-[var(--fg-40)] mt-0.5">Messages are end-to-end private</p>
        </div>
      </div>

      {/* ── Messages ───────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-0.5">
        {messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center py-16">
            <div className="text-center">
              <div className="h-14 w-14 rounded-2xl bg-[var(--bg-hover)] flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">💬</span>
              </div>
              <p className="text-sm font-medium text-[var(--fg)]">No messages yet</p>
              <p className="text-xs text-[var(--fg-40)] mt-1">Send the first message to get the conversation started.</p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => {
          const isMine = msg.sender_id === userId
          const prev = messages[i - 1]
          const showDate =
            i === 0 ||
            new Date(msg.created_at).toDateString() !== new Date(prev.created_at).toDateString()
          // Group consecutive messages from the same sender (within 2 min)
          const sameCluster =
            prev &&
            prev.sender_id === msg.sender_id &&
            !showDate &&
            new Date(msg.created_at).getTime() - new Date(prev.created_at).getTime() < 120_000

          return (
            <div key={msg.id}>
              {showDate && (
                <div className="flex justify-center my-4">
                  <span className="text-[11px] text-[var(--fg-30)] bg-[var(--bg-hover)] px-3 py-1 rounded-full">
                    {dateSeparator(msg.created_at)}
                  </span>
                </div>
              )}
              <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} ${sameCluster ? 'mt-0.5' : 'mt-3'}`}>
                <div className="group relative max-w-[75%]">
                  <div
                    className={`px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap break-words ${
                      isMine
                        ? 'bg-[var(--accent)] text-[var(--accent-on-solid)] rounded-2xl rounded-br-md'
                        : 'bg-[var(--bg-surface)] border border-[var(--border-8)] text-[var(--fg)] rounded-2xl rounded-bl-md'
                    }`}
                  >
                    {msg.content}
                  </div>
                  {/* Timestamp on hover */}
                  <span
                    className={`absolute -bottom-4 text-[10px] text-[var(--fg-30)] whitespace-nowrap
                      opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none select-none
                      ${isMine ? 'right-1' : 'left-1'}`}
                  >
                    {formatTime(msg.created_at)}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ──────────────────────────────── */}
      <div className="px-4 py-3 pb-20 md:pb-3 border-t border-[var(--border-8)] bg-[var(--bg-nav)] shrink-0">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={onInput}
            onKeyDown={onKeyDown}
            placeholder="Message…"
            rows={1}
            className="flex-1 resize-none rounded-2xl border border-[var(--border-8)] bg-[var(--bg-input)]
              px-4 py-2.5 text-sm text-[var(--fg)] placeholder:text-[var(--fg-30)]
              focus:outline-none focus:border-[var(--accent)] transition-colors leading-relaxed"
            style={{ minHeight: '42px', maxHeight: '120px' }}
          />
          <button
            onClick={send}
            disabled={!text.trim() || sending}
            className="h-[42px] w-[42px] rounded-2xl bg-[var(--accent)] text-[var(--accent-on-solid)]
              flex items-center justify-center shrink-0 hover:bg-[var(--accent-hover)]
              transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="text-[10px] text-[var(--fg-20)] mt-1.5 ml-1">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
