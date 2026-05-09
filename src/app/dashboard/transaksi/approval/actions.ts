'use server'

import { prisma } from '@/lib/prisma'
import { ApprovalStatus } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export async function submitForApproval(transactionId: string) {
  await prisma.transaction.update({
    where: { id: transactionId },
    data: { approvalStatus: ApprovalStatus.PENDING_KETUA }
  })
  revalidatePath('/dashboard/transaksi')
}

export async function approveTransaction(transactionId: string, approverName: string, note?: string) {
  await prisma.transaction.update({
    where: { id: transactionId },
    data: { approvalStatus: ApprovalStatus.APPROVED }
  })

  await prisma.approvalLog.create({
    data: {
      transactionId,
      approverName,
      approvalRole: 'KETUA',
      action: 'APPROVE',
      note,
    }
  })

  revalidatePath('/dashboard/transaksi')
  revalidatePath('/dashboard/approval')
}

export async function rejectTransaction(transactionId: string, approverName: string, note: string) {
  await prisma.transaction.update({
    where: { id: transactionId },
    data: { approvalStatus: ApprovalStatus.REJECTED }
  })

  await prisma.approvalLog.create({
    data: {
      transactionId,
      approverName,
      approvalRole: 'KETUA',
      action: 'REJECT',
      note,
    }
  })

  revalidatePath('/dashboard/transaksi')
  revalidatePath('/dashboard/approval')
}
