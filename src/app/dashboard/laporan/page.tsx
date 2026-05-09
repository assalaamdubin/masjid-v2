import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { TransactionType } from '@prisma/client'
import LaporanClient from './LaporanClient'

export default async function LaporanPage({
  searchParams,
}: {
  searchParams: Promise<{ bulan?: string; tahun?: string }>
}) {
  const currentUser = await getCurrentUser()
  const entityId = currentUser.entityId

  if (!entityId) {
    return (
      <div className="text-center py-12 text-gray-400">
        <span className="text-4xl block mb-3">⚠️</span>
        <p className="text-sm">Anda belum terdaftar di entity manapun</p>
      </div>
    )
  }

  const params = await searchParams
  const now = new Date()
  const bulan = parseInt(params.bulan ?? String(now.getMonth() + 1))
  const tahun = parseInt(params.tahun ?? String(now.getFullYear()))

  const startDate = new Date(tahun, bulan - 1, 1)
  const endDate = new Date(tahun, bulan, 0, 23, 59, 59)

  const [transaksi, totalPemasukan, totalPengeluaran] = await Promise.all([
    prisma.transaction.findMany({
      where: { entityId, date: { gte: startDate, lte: endDate } },
      include: { category: true },
      orderBy: { date: 'asc' }
    }),
    prisma.transaction.aggregate({
      where: { entityId, type: TransactionType.INCOME, date: { gte: startDate, lte: endDate } },
      _sum: { amount: true }
    }),
    prisma.transaction.aggregate({
      where: { entityId, type: TransactionType.EXPENSE, date: { gte: startDate, lte: endDate } },
      _sum: { amount: true }
    }),
  ])

  return (
    <LaporanClient
      transaksi={transaksi}
      totalPemasukan={Number(totalPemasukan._sum.amount ?? 0)}
      totalPengeluaran={Number(totalPengeluaran._sum.amount ?? 0)}
      bulan={bulan}
      tahun={tahun}
    />
  )
}
