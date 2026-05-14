import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(new Date(date))
}

const actionConfig: Record<string, { label: string; color: string }> = {
  CREATE: { label: 'Buat', color: 'bg-emerald-100 text-emerald-700' },
  UPDATE: { label: 'Ubah', color: 'bg-blue-100 text-blue-700' },
  DELETE: { label: 'Hapus', color: 'bg-red-100 text-red-700' },
  ACTIVATE: { label: 'Aktifkan', color: 'bg-emerald-100 text-emerald-700' },
  DEACTIVATE: { label: 'Nonaktifkan', color: 'bg-orange-100 text-orange-700' },
  APPROVE: { label: 'Setujui', color: 'bg-emerald-100 text-emerald-700' },
  REJECT: { label: 'Tolak', color: 'bg-red-100 text-red-700' },
  LOGIN: { label: 'Login', color: 'bg-gray-100 text-gray-600' },
  UPLOAD: { label: 'Upload', color: 'bg-purple-100 text-purple-700' },
}

export default async function AuditPage() {
  const currentUser = await getCurrentUser()
  if (!currentUser.isAdmin) redirect('/dashboard')

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Audit Log</h1>
        <p className="text-sm text-gray-500 mt-0.5">Rekam jejak semua aktivitas di sistem</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {logs.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <span className="text-4xl block mb-3">📋</span>
            <p className="text-sm">Belum ada aktivitas tercatat</p>
          </div>
        ) : (
          <>
            {/* Mobile Card Layout */}
            <div className="md:hidden divide-y divide-gray-100">
              {logs.map(log => {
                const action = actionConfig[log.action] ?? { label: log.action, color: 'bg-gray-100 text-gray-600' }
                return (
                  <div key={log.id} className="p-4 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${action.color}`}>
                        {action.label}
                      </span>
                      <span className="text-xs text-gray-400">{formatDate(log.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-900">{log.description}</p>
                    <p className="text-xs text-gray-500">👤 {log.personName} • {log.entityName}</p>
                  </div>
                )
              })}
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Waktu</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Aksi</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Deskripsi</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Oleh</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Modul</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.map(log => {
                    const action = actionConfig[log.action] ?? { label: log.action, color: 'bg-gray-100 text-gray-600' }
                    return (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(log.createdAt)}</td>
                        <td className="px-6 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${action.color}`}>
                            {action.label}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-900">{log.description}</td>
                        <td className="px-6 py-3 text-sm text-gray-600">{log.personName}</td>
                        <td className="px-6 py-3">
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                            {log.entityName}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
