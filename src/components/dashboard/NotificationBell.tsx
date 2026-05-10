'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Notification = {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  createdAt: Date
  transactionId: string | null
}

export default function NotificationBell({
  notifications,
  unreadCount,
}: {
  notifications: Notification[]
  unreadCount: number
}) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  async function handleClick(notif: Notification) {
    // Mark as read
    await fetch('/api/notifications/read', {
      method: 'POST',
      body: JSON.stringify({ id: notif.id }),
      headers: { 'Content-Type': 'application/json' }
    })

    setOpen(false)

    if (notif.type === 'APPROVAL_REQUEST') {
      router.push('/dashboard/approval')
    } else if (notif.transactionId) {
      router.push('/dashboard/transaksi')
    }

    router.refresh()
  }

  async function handleMarkAllRead() {
    await fetch('/api/notifications/read-all', { method: 'POST' })
    setOpen(false)
    router.refresh()
  }

  function timeAgo(date: Date) {
    const now = new Date()
    const diff = Math.floor((now.getTime() - new Date(date).getTime()) / 1000)
    if (diff < 60) return 'Baru saja'
    if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`
    return `${Math.floor(diff / 86400)} hari lalu`
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 z-40 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 text-sm">Notifikasi</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Tandai semua dibaca
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <span className="text-3xl block mb-2">🔔</span>
                  <p className="text-xs">Tidak ada notifikasi</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map(notif => (
                    <button
                      key={notif.id}
                      onClick={() => handleClick(notif)}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                        !notif.isRead ? 'bg-emerald-50/50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-lg mt-0.5">
                          {notif.type === 'APPROVAL_REQUEST' ? '📤' :
                           notif.type === 'APPROVAL_APPROVED' ? '✅' :
                           notif.type === 'APPROVAL_REJECTED' ? '❌' : 'ℹ️'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-900">{notif.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{timeAgo(notif.createdAt)}</p>
                        </div>
                        {!notif.isRead && (
                          <div className="w-2 h-2 bg-emerald-500 rounded-full mt-1 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
