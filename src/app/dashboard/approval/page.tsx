import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { approveTransaction, rejectTransaction } from '../transaksi/approval/actions'

function formatRupiah(amount: any) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(Number(amount))
}

export default async function ApprovalPage() {
  const currentUser = await getCurrentUser()
  const { entityIds, person } = currentUser

  const pendingTransaksi = await prisma.transaction.findMany({
    where: {
      entityId: { in: entityIds },
      approvalStatus: 'PENDING_KETUA',
      type: 'EXPENSE',
    },
    include: { category: true, entity: true, createdBy: true },
    orderBy: { createdAt: 'desc' }
  })

  const approvedTransaksi = await prisma.transaction.findMany({
    where: {
      entityId: { in: entityIds },
      approvalStatus: { in: ['APPROVED', 'REJECTED'] },
      type: 'EXPENSE',
    },
    include: { category: true, entity: true, approvalLogs: true },
    orderBy: { updatedAt: 'desc' },
    take: 10,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Approval Pengeluaran</h1>
        <p className="text-sm text-gray-500 mt-0.5">Review dan setujui pengajuan pengeluaran</p>
      </div>

      {/* Pending Approval */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
          <h3 className="font-semibold text-gray-900">Menunggu Persetujuan</h3>
          {pendingTransaksi.length > 0 && (
            <span className="bg-yellow-100 text-yellow-700 text-xs font-medium px-2 py-0.5 rounded-full">
              {pendingTransaksi.length} pending
            </span>
          )}
        </div>

        {pendingTransaksi.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <span className="text-3xl block mb-2">✅</span>
            <p className="text-sm">Tidak ada pengeluaran yang menunggu persetujuan</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {pendingTransaksi.map((t) => (
              <div key={t.id} className="px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-red-100 text-red-700 text-xs font-medium px-2 py-0.5 rounded-full">
                        {t.category.name}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {t.entity.name}
                      </span>
                    </div>
                    <p className="text-lg font-bold text-red-600">{formatRupiah(t.amount)}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(t.date))}
                      {' • '}{t.paymentMethod}
                      {t.payerName && ` • ${t.payerName}`}
                    </p>
                    {t.description && (
                      <p className="text-sm text-gray-600 mt-1">{t.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">Diajukan oleh: {t.createdBy.fullName}</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <form action={approveTransaction.bind(null, t.id, person.fullName, undefined)}>
                      <button type="submit"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors">
                        ✅ Setujui
                      </button>
                    </form>
                    <form action={rejectTransaction.bind(null, t.id, person.fullName, 'Ditolak')}>
                      <button type="submit"
                        className="w-full bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium px-4 py-2 rounded-lg border border-red-200 transition-colors">
                        ❌ Tolak
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* History */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Riwayat Approval</h3>
        </div>
        {approvedTransaksi.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <p className="text-sm">Belum ada riwayat approval</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Tanggal</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Kategori</th>
                <th className="text-right text-xs font-medium text-gray-500 px-6 py-3">Nominal</th>
                <th className="text-center text-xs font-medium text-gray-500 px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {approvedTransaksi.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm text-gray-600">
                    {new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(new Date(t.date))}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-900">{t.category.name}</td>
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
