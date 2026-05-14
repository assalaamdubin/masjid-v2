import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import PersonsClient from './PersonsClient'

export default async function PersonsPage() {
  const currentUser = await getCurrentUser()
  const { entityIds } = currentUser

  const [persons, personTypes, entities] = await Promise.all([
    prisma.person.findMany({
      where: { entityId: { in: entityIds } },
      include: {
        personType: true,
        entity: true,
        reportTo: true,
        user: true,
        subordinates: {
          include: { personType: true }
        }
      },
      orderBy: { fullName: 'asc' }
    }),
    prisma.personType.findMany({
      where: { entityId: { in: entityIds } },
      orderBy: { name: 'asc' }
    }),
    prisma.entity.findMany({
      where: { id: { in: entityIds }, isActive: true }
    })
  ])

  return (
    <PersonsClient
      persons={persons}
      personTypes={personTypes}
      entities={entities}
      entityIds={entityIds}
    />
  )
}
