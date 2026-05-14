import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import KegiatanClient from './KegiatanClient'

export default async function KegiatanPage() {
  const currentUser = await getCurrentUser()
  const { entityIds, isAdmin } = currentUser

  const [kegiatan, entities, persons] = await Promise.all([
    prisma.kegiatan.findMany({
      where: { entityId: { in: entityIds } },
      include: {
        entity: true,
        createdBy: true,
        panitia: { include: { person: true } },
        transactions: {
          where: { approvalStatus: 'APPROVED' },
          include: { category: true }
        },
        budgets: { include: { category: true } }
      },
      orderBy: { startDate: 'desc' }
    }),
    prisma.entity.findMany({
      where: { id: { in: entityIds }, isActive: true }
    }),
    prisma.person.findMany({
      where: { entityId: { in: entityIds }, isActive: true },
      orderBy: { fullName: 'asc' }
    })
  ])

  return (
    <KegiatanClient
      initialData={kegiatan}
      entities={entities}
      persons={persons}
      currentPersonId={currentUser.person.id}
      isAdmin={isAdmin}
    />
  )
}
