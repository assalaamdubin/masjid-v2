import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { TransactionType } from '@prisma/client'

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export default async function DashboardPage() {
  const currentUser = await getCurrentUser()
  const entityIds = currentUser.entityIds

  if (!entityIds.length) {
    return (
      <div className="text-center py-12 text-gray-400">
        <span className="text-4xl block mb-3">⚠️</span>
        <p className="text-sm">Anda belum terdaftar di entity manapun</p>
      </div>
    )
  }

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const [pemasukanBulanIni, pengeluaranBulanIni, totalPemasukanAll, totalPengeluaranAll, transaksiTerbaru] = await Promise.all([
    prisma.transaction.aggregate({
      where: { entityId: { in: entityIds }, type: TransactionType.INCOME, date: { gte: startOfMonth, lte: endOfMonth } },
      _sum: { amount: true }
    }),
    prisma.transaction.aggregate({
      where: { entityId: { in: entityIds }, type: TransactionType.EXPENSE, date: { gte: startOfMonth, lte: endOfMonth } },
      _sum: { amount: true }
    }),
    prisma.transaction.aggregate({
      where: { entityId: { in: entityIds }, type: TransactionType.INCOME },
      _sum: { amount: true }
    }),
    prisma.transaction.aggregate({
      where: { entityId: { in: entityIds }, type: TransactionType.EXPENSE },
      _sum: { amount: true }
    }),
    prisma.transaction.findMany({
      where: { entityId: { in: entityIds } },
      include: { category: true, entity: true },
      orderBy: { date: 'desc' },
      take: 5,
    })
  ])

  const totalPemasukan = Number(pemasukanBulanIni._sum.amount ?? 0)
  const totalPengeluaran = Number(pengeluaranBulanIni._sum.amount ?? 0)
  const saldo = Number(totalPemasukanAll._sum.amount ?? 0) - Number(totalPengeluaranAll._sum.amount ?? 0)

  return (
    <div className="space-y-6">
      {currentUser.isAdmin && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-700">
          📊 Menampilkan data gabungan semua entity dalam <strong>{currentUser.mosqueName}</strong>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-gray-500">Total Saldo</p>
            <span className="text-2xl">💰</span>
          </div>
          <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
            {formatRupiah(saldo)}
          </p>
          <p className="text-xs text-gray-400 mt-1">Semua transaksi</p>
        </div>

        <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-emerald-600">Pemasukan Bulan Ini</p>
            <span className="text-2xl">📈</span>
          </div>
          <p className="text-2xl font-bold text-emerald-700">{formatRupiah(totalPemasukan)}</p>
          <p className="text-xs text-emerald-500 mt-1">{now.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}</p>
        </div>

        <div className="bg-red-50 rounded-2xl p-6 border border-red-100">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-red-600">Pengeluaran Bulan Ini</p>
            <span className="text-2xl">📉</span>
          </div>
          <p className="text-2xl font-bold text-red-600">{formatRupiah(totalPengeluaran)}</p>
          <p className="text-xs text-red-400 mt-1">{now.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Transaksi Terbaru</h3>
          <a href="/dashboard/transaksi" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
            Lihat semua →
          </a>
        </div>

        {transaksiTerbaru.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <span className="text-4xl block mb-3">📝</span>
            <p className="text-sm">Belum ada transaksi</p>
            <a href="/dashboard/transaksi" className="text-sm text-emerald-600 hover:text-emerald-700 mt-2 inline-block">
              + Tambah transaksi pertama
            </a>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {transaksiTerbaru.map((t) => (
              <div key={t.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-lg ${
                    t.type === 'INCOME' ? 'bg-emerald-100' : 'bg-red-100'
                  }`}>
                    {t.type === 'INCOME' ? '📈' : '📉'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t.category.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-gray-500">
                        {new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(t.date))}
                      </p>
                      {currentUser.isAdmin && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                          {t.entity.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span className={`text-sm font-semibold ${
                  t.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {t.type === 'INCOME' ? '+' : '-'}{formatRupiah(Number(t.amount))}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
