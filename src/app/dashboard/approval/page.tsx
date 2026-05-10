import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ApprovalClient from './ApprovalClient'

export default async function ApprovalPage() {
  const currentUser = await getCurrentUser()
  const { person, entityIds } = currentUser

  const pendingTransaksi = await prisma.transaction.findMany({
    where: {
      entityId: { in: entityIds },
      approvalStatus: 'PENDING_APPROVAL',
      currentApproverId: person.id,
      type: 'EXPENSE',
    },
    include: {
      category: true,
      entity: true,
      createdBy: true,
      approvalLogs: {
        include: { approver: true },
        orderBy: { createdAt: 'asc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  const historyTransaksi = await prisma.transaction.findMany({
    where: {
      entityId: { in: entityIds },
      approvalStatus: { in: ['APPROVED', 'REJECTED'] },
      type: 'EXPENSE',
      approvalLogs: { some: { approverId: person.id } }
    },
    include: {
      category: true,
      entity: true,
      createdBy: true,
      approvalLogs: {
        include: { approver: true },
        orderBy: { createdAt: 'asc' }
      }
    },
    orderBy: { updatedAt: 'desc' },
    take: 10,
  })

  return (
    <ApprovalClient
      pendingTransaksi={pendingTransaksi}
      historyTransaksi={historyTransaksi}
      personId={person.id}
    />
  )
}
