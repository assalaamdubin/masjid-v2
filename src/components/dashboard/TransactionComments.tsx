'use client'

import { useState } from 'react'
import { addComment, deleteComment } from '@/app/dashboard/transaksi/comments/actions'

type Comment = {
  id: string
  message: string
  createdAt: Date
  person: { id: string; fullName: string }
}

export default function TransactionComments({
  transactionId,
  comments,
  personId,
  personName,
}: {
  transactionId: string
  comments: Comment[]
  personId: string
  personName: string
}) {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [showAll, setShowAll] = useState(false)

  const displayed = showAll ? comments : comments.slice(0, 3)

  function timeAgo(date: Date) {
    const now = new Date()
    const diff = Math.floor((now.getTime() - new Date(date).getTime()) / 1000)
    if (diff < 60) return 'Baru saja'
    if (diff < 3600) return `${Math.floor(diff / 60)} mnt lalu`
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`
    return `${Math.floor(diff / 86400)} hari lalu`
  }

  async function handleSend() {
    if (!message.trim()) return
    setSending(true)
    await addComment(transactionId, personId, message)
    setMessage('')
    setSending(false)
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        💬 Komentar {comments.length > 0 && `(${comments.length})`}
      </p>

      {/* List komentar */}
      {comments.length === 0 ? (
        <p className="text-xs text-gray-400 italic">Belum ada komentar</p>
      ) : (
        <div className="space-y-2">
          {displayed.map(c => (
            <div key={c.id} className="flex gap-2">
              <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center text-xs font-bold text-emerald-700 flex-shrink-0">
                {c.person.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-gray-900">{c.person.fullName}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-400">{timeAgo(c.createdAt)}</p>
                    {c.person.id === personId && (
                      <form action={deleteComment.bind(null, c.id)}>
                        <button type="submit" className="text-xs text-red-400 hover:text-red-600">✕</button>
                      </form>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-700 mt-0.5">{c.message}</p>
              </div>
            </div>
          ))}
          {comments.length > 3 && (
            <button onClick={() => setShowAll(!showAll)}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
              {showAll ? 'Sembunyikan' : `Lihat ${comments.length - 3} komentar lagi`}
            </button>
          )}
        </div>
      )}

      {/* Input komentar */}
      <div className="flex gap-2">
        <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center text-xs font-bold text-emerald-700 flex-shrink-0">
          {personName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Tulis komentar..."
            className="flex-1 px-3 py-1.5 border border-gray-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            onClick={handleSend}
            disabled={sending || !message.trim()}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-medium px-3 py-1.5 rounded-xl"
          >
            {sending ? '...' : 'Kirim'}
          </button>
        </div>
      </div>
    </div>
  )
}
