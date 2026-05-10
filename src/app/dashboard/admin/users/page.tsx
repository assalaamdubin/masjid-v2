import { prisma } from '@/lib/prisma'
import { approveUser, rejectUser } from './actions'
import UserRoleForm from './UserRoleForm'
import LinkPersonForm from './LinkPersonForm'
import UsersClient from './UsersClient'

export default async function AdminUsersPage() {
  const [pendingUsers, users, persons] = await Promise.all([
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
    })
  ])

  return (
    <UsersClient
      pendingUsers={pendingUsers}
      users={users}
      persons={persons}
    />
  )
}
