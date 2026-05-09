import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { TransactionType } from '@prisma/client'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const currentUser = await getCurrentUser()
  const { entityIds, isAdmin, mosqueName } = currentUser

  if (!entityIds.length) {
    return (
      <div className="text-center py-12 text-gray-400">
        <span className="text-4xl block mb-3">⚠️</span>
        <p className="text-sm">Anda belum terdaftar di entity manapun</p>
      </div>
    )
  }

  const entities = await prisma.entity.findMany({
    where: { id: { in: entityIds }, isActive: true },
    include: {
      transactions: {
        include: { category: true },
        orderBy: { date: 'desc' },
        take: 5,
      }
    }
  })

  const allTransaksiTerbaru = await prisma.transaction.findMany({
    where: { entityId: { in: entityIds } },
    include: { category: true, entity: true },
    orderBy: { date: 'desc' },
    take: 5,
  })

  return (
    <DashboardClient
      entities={entities}
      allTransaksiTerbaru={allTransaksiTerbaru}
      isAdmin={isAdmin}
      mosqueName={mosqueName ?? ''}
      entityIds={entityIds}
    />
  )
}
