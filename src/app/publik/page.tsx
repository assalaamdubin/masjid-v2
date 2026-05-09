import { prisma } from '@/lib/prisma'
import { TransactionType } from '@prisma/client'
import Image from 'next/image'

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export default async function PublikPage() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const mosque = await prisma.mosque.findFirst()
  const entities = await prisma.entity.findMany({
    where: { isActive: true },
    include: {
      transactions: {
        where: {
          date: { gte: startOfMonth, lte: endOfMonth },
          approvalStatus: { in: ['APPROVED', 'DRAFT'] }
        },
        include: { category: true },
        orderBy: { date: 'desc' }
      }
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-6">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Image
            src="/logo-masjid.png"
            alt="Logo Masjid"
            width={64}
            height={64}
            className="object-contain"
          />
          <div>
            <h1 className="text-xl font-bold text-gray-900">{mosque?.name ?? 'Masjid Al-Salam'}</h1>
            <p className="text-sm text-emerald-700">Laporan Keuangan Transparan</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {now.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {entities.map(entity => {
          const pemasukan = entity.transactions
            .filter(t => t.type === 'INCOME')
            .reduce((s, t) => s + Number(t.amount), 0)
          const pengeluaran = entity.transactions
            .filter(t => t.type === 'EXPENSE')
            .reduce((s, t) => s + Number(t.amount), 0)
          const saldo = pemasukan - pengeluaran

          return (
            <div key={entity.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className={`px-6 py-4 ${entity.type === 'DKM' ? 'bg-emerald-600' : 'bg-blue-600'}`}>
                <h2 className="font-bold text-white text-lg">{entity.name}</h2>
                <p className="text-white/70 text-sm">{entity.type}</p>
              </div>

              <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-200">
                <div className="px-6 py-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">Saldo</p>
                  <p className={`text-lg font-bold ${saldo >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                    {formatRupiah(saldo)}
                  </p>
                </div>
                <div className="px-6 py-4 text-center">
                  <p className="text-xs text-emerald-600 mb-1">Pemasukan</p>
                  <p className="text-lg font-bold text-emerald-700">{formatRupiah(pemasukan)}</p>
                </div>
                <div className="px-6 py-4 text-center">
                  <p className="text-xs text-red-600 mb-1">Pengeluaran</p>
                  <p className="text-lg font-bold text-red-600">{formatRupiah(pengeluaran)}</p>
                </div>
              </div>

              {entity.transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">Belum ada transaksi bulan ini</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {entity.transactions.map(t => (
                    <div key={t.id} className="px-6 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                          t.type === 'INCOME' ? 'bg-emerald-100' : 'bg-red-100'
                        }`}>
                          {t.type === 'INCOME' ? '📈' : '📉'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{t.category.name}</p>
                          <p className="text-xs text-gray-500">
                            {new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(new Date(t.date))}
                            {t.description && ` • ${t.description}`}
                          </p>
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
          )
        })}

        <div className="text-center text-xs text-gray-400 pb-4">
          <p>Laporan ini dibuat secara otomatis oleh sistem keuangan masjid</p>
          <p className="mt-1">© 2025 {mosque?.name ?? 'Masjid Al-Salam'}</p>
        </div>
      </div>
    </div>
  )
}
