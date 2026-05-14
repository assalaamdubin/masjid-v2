'use client'

import { useState } from 'react'
import { approveTransaction, rejectTransaction } from '../transaksi/approval/actions'

type ApprovalLog = {
  id: string
  approverName: string
  action: string
  note: string | null
  createdAt: Date
  approver: { fullName: string } | null
}

type Transaksi = {
  id: string
  type: string
  date: Date
  amount: any
  description: string | null
  payerName: string | null
  paymentMethod: string | null
  approvalStatus: string
  category: { name: string }
  entity: { name: string; type: string }
  createdBy: { fullName: string }
  approvalLogs: ApprovalLog[]
}

function formatRupiah(amount: any) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(Number(amount))
}

export default function ApprovalClient({
  pendingTransaksi,
  historyTransaksi,
  personId,
}: {
  pendingTransaksi: Transaksi[]
  historyTransaksi: Transaksi[]
  personId: string
}) {
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectNote, setRejectNote] = useState('')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Approval Pengeluaran</h1>
        <p className="text-sm text-gray-500 mt-0.5">Review dan setujui pengajuan pengeluaran</p>
      </div>

      {/* Pending */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
          <h3 className="font-semibold text-gray-900">Menunggu Approval Anda</h3>
          {pendingTransaksi.length > 0 && (
            <span className="bg-yellow-100 text-yellow-700 text-xs font-medium px-2 py-0.5 rounded-full">
              {pendingTransaksi.length} pending
            </span>
          )}
        </div>

        {pendingTransaksi.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <span className="text-3xl block mb-2">✅</span>
            <p className="text-sm">Tidak ada yang menunggu approval Anda</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {pendingTransaksi.map(t => (
              <div key={t.id} className="px-6 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-red-100 text-red-700 text-xs font-medium px-2 py-0.5 rounded-full">
                        {t.category.name}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        t.entity.type === 'DKM' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {t.entity.name}
                      </span>
                    </div>
                    <p className="text-xl font-bold text-red-600">{formatRupiah(t.amount)}</p>
                    <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                      <p>📅 {new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(t.date))}</p>
                      <p>💳 {t.paymentMethod ?? '-'}</p>
                      {t.payerName && <p>👤 {t.payerName}</p>}
                      {t.description && <p>📝 {t.description}</p>}
                      <p>🙋 Diajukan oleh: <strong>{t.createdBy.fullName}</strong></p>
                    </div>

                    {/* Approval trail */}
                    {t.approvalLogs.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <p className="text-xs font-medium text-gray-500">Riwayat approval:</p>
                        {t.approvalLogs.map(log => (
                          <div key={log.id} className="flex items-center gap-2 text-xs">
                            <span>{log.action === 'APPROVE' ? '✅' : '❌'}</span>
                            <span className="text-gray-700">{log.approverName}</span>
                            <span className="text-gray-400">
                              {new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(log.createdAt))}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 min-w-fit">
                    <form action={approveTransaction.bind(null, t.id, personId, undefined)}>
                      <button type="submit"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium px-5 py-2 rounded-lg transition-colors">
                        ✅ Setujui
                      </button>
                    </form>
                    <button
                      onClick={() => { setRejectingId(t.id); setRejectNote('') }}
                      className="w-full bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium px-5 py-2 rounded-lg border border-red-200 transition-colors">
                      ❌ Tolak
                    </button>
                  </div>
                </div>

                {/* Reject form */}
                {rejectingId === t.id && (
                  <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-200">
                    <p className="text-xs font-medium text-red-700 mb-2">Alasan penolakan:</p>
                    <textarea
                      value={rejectNote}
                      onChange={(e) => setRejectNote(e.target.value)}
                      rows={2}
                      placeholder="Tuliskan alasan penolakan..."
                      className="w-full px-3 py-2 border border-red-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none bg-white"
                    />
                    <div className="flex gap-2 mt-2">
                      <form action={rejectTransaction.bind(null, t.id, personId, rejectNote)}
                        className="flex-1">
                        <button type="submit"
                          disabled={!rejectNote.trim()}
                          className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-medium py-2 rounded-lg">
                          Konfirmasi Tolak
                        </button>
                      </form>
                      <button onClick={() => setRejectingId(null)}
                        className="px-4 text-gray-500 text-xs border border-gray-300 rounded-lg hover:bg-gray-50">
                        Batal
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* History */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Riwayat Approval Saya</h3>
        </div>
        {historyTransaksi.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <p className="text-sm">Belum ada riwayat approval</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Tanggal</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Kategori</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Entity</th>
                <th className="text-right text-xs font-medium text-gray-500 px-6 py-3">Nominal</th>
                <th className="text-center text-xs font-medium text-gray-500 px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {historyTransaksi.map(t => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm text-gray-600">
                    {new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(new Date(t.date))}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-900">{t.category.name}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{t.entity.name}</td>
                  <td className="px-6 py-3 text-right text-sm font-semibold text-red-600">
                    -{formatRupiah(t.amount)}
                  </td>
                  <td className="px-6 py-3 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      t.approvalStatus === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {t.approvalStatus === 'APPROVED' ? '✅ Disetujui' : '❌ Ditolak'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
