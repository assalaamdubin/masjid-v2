import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import TransaksiClient from './TransaksiClient'

export default async function TransaksiPage() {
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

  const [transaksi, kategori] = await Promise.all([
    prisma.transaction.findMany({
      where: { entityId },
      include: { category: true, createdBy: true },
      orderBy: { date: 'desc' },
      take: 50,
    }),
    prisma.category.findMany({
      where: { entityId, isActive: true },
      orderBy: [{ type: 'asc' }, { name: 'asc' }]
    })
  ])

  return (
    <TransaksiClient
      initialData={transaksi}
      kategori={kategori}
      entityId={entityId}
      personId={currentUser.person.id}
    />
  )
}
