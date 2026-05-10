import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import UsersClient from './UsersClient'

export default async function AdminUsersPage() {
  const currentUser = await getCurrentUser()
  const { entityIds } = currentUser

  const [pendingUsers, users, persons, roles, entities] = await Promise.all([
    prisma.person.findMany({
      where: { status: 'PENDING' },
      include: {
        entityMembers: {
          include: { entity: { include: { mosque: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.user.findMany({
      include: {
        person: {
          include: {
            personType: true,
            entity: true,
            entityMembers: {
              include: { entity: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.person.findMany({
      where: { isActive: true, status: 'ACTIVE' },
      include: { personType: true, entity: true },
      orderBy: { fullName: 'asc' }
    }),
    prisma.role.findMany({
      where: { entityId: { in: entityIds }, isActive: true },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }]
    }),
    prisma.entity.findMany({
      where: { id: { in: entityIds }, isActive: true }
    })
  ])

  return (
    <UsersClient
      pendingUsers={pendingUsers}
      users={users}
      persons={persons}
      roles={roles}
      entities={entities}
    />
  )
}
