import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import TransaksiClient from './TransaksiClient'

export default async function TransaksiPage() {
  const currentUser = await getCurrentUser()
  const { entityIds, entityId, isAdmin, person } = currentUser

  if (!entityIds.length) {
    return (
      <div className="text-center py-12 text-gray-400">
        <span className="text-4xl block mb-3">⚠️</span>
        <p className="text-sm">Anda belum terdaftar di entity manapun</p>
      </div>
    )
  }

  // Super Admin input transaksi ke entity pertama (DKM) by default
  const activeEntityId = entityId ?? entityIds[0]

  const [transaksi, kategori, entities] = await Promise.all([
    prisma.transaction.findMany({
      where: { entityId: { in: entityIds } },
      include: { category: true, createdBy: true, entity: true },
      orderBy: { date: 'desc' },
      take: 50,
    }),
    prisma.category.findMany({
      where: { entityId: { in: entityIds }, isActive: true },
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
      include: { entity: true }
    }),
    isAdmin ? prisma.entity.findMany({
      where: { id: { in: entityIds }, isActive: true }
    }) : Promise.resolve([])
  ])

  return (
    <TransaksiClient
      initialData={transaksi}
      kategori={kategori}
      entityId={activeEntityId}
      personId={person.id}
      isAdmin={isAdmin}
      entities={entities}
    />
  )
}
