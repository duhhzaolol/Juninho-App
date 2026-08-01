'use client'

import { useEffect, useRef, useState } from 'react'
import { ChatBubble } from './ChatBubble'

interface Message {
  id: string
  senderId: string
  content: string
  createdAt: string
}

interface ChatThreadProps {
  currentUserId: string
  counterpartId: string
  counterpartName: string
}

export function ChatThread({ currentUserId, counterpartId, counterpartName }: ChatThreadProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  async function loadMessages() {
    const res = await fetch(`/api/messages?with=${counterpartId}`)
    if (res.ok) setMessages(await res.json())
  }

  useEffect(() => {
    loadMessages()
    const interval = setInterval(loadMessages, 5000)
    return () => clearInterval(interval)
  }, [counterpartId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return

    const optimistic: Message = {
      id: `temp-${Date.now()}`,
      senderId: currentUserId,
      content: text,
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimistic])
    setText('')

    await fetch('/api/messages', {
      method: 'POST',
      body: JSON.stringify({ receiverId: counterpartId, content: optimistic.content }),
    })
    loadMessages()
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <p className="font-display font-semibold text-white px-1 mb-3">{counterpartName}</p>

      <div className="flex-1 overflow-y-auto flex flex-col gap-2 px-1">
        {messages.map((m) => (
          <ChatBubble
            key={m.id}
            text={m.content}
            timestamp={new Date(m.createdAt)}
            isOwn={m.senderId === currentUserId}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2 pt-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escreva uma mensagem..."
          className="flex-1 bg-navy-light border border-white/10 rounded-control px-4 py-2.5 text-white placeholder:text-white/30 text-sm"
        />
        <button type="submit" className="bg-gold text-navy font-display font-semibold text-sm px-5 rounded-control">
          Enviar
        </button>
      </form>
    </div>
  )
}
