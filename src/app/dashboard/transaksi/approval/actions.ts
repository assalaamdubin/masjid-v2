'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { createNotification } from '@/lib/notifications'
import { sendWhatsApp, pesanApprovalDisetujui, pesanApprovalDitolak } from '@/lib/fonnte'
import { buildApprovalChain, notifyNextApprover } from '@/lib/approval'

function formatRupiah(amount: any) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(Number(amount))
}

export async function approveTransaction(transactionId: string, approverId: string, note?: string) {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { category: true, entity: true, createdBy: true }
  })

  if (!transaction) throw new Error('Transaksi tidak ditemukan')

  const approver = await prisma.person.findUnique({ where: { id: approverId } })
  if (!approver) throw new Error('Approver tidak ditemukan')

  // Log approval
  await prisma.approvalLog.create({
    data: {
      transactionId,
      approverId,
      approverName: approver.fullName,
      approvalRole: 'APPROVER',
      action: 'APPROVE',
      note,
    }
  })

  // Cari chain approval
  const chain = await buildApprovalChain(transaction.createdById, transaction.entityId)

  // Entity threshold check
  const entity = await prisma.entity.findUnique({ where: { id: transaction.entityId } })
  const threshold = Number(entity?.approvalThreshold ?? 0)
  let approvalChain = chain
  if (threshold > 0 && Number(transaction.amount) <= threshold) {
    const bendahara = await prisma.entityMember.findFirst({
      where: { entityId: transaction.entityId, isBendahara: true, isActive: true }
    })
    approvalChain = bendahara ? [bendahara.personId] : chain
  }

  // Cari posisi approver saat ini di chain
  const currentIndex = approvalChain.indexOf(approverId)
  const nextApprover = approvalChain[currentIndex + 1]

  if (nextApprover) {
    // Ada approver berikutnya
    await prisma.transaction.update({
      where: { id: transactionId },
      data: { currentApproverId: nextApprover }
    })
    await notifyNextApprover(transactionId, nextApprover, transaction.entityId)
  } else {
    // Sudah mentok — APPROVED!
    await prisma.transaction.update({
      where: { id: transactionId },
      data: { approvalStatus: 'APPROVED', currentApproverId: null }
    })

    // Notif ke pembuat transaksi
    await createNotification({
      personId: transaction.createdById,
      type: 'APPROVAL_APPROVED',
      title: '✅ Pengeluaran Disetujui',
      message: `Pengeluaran ${transaction.category.name} sebesar ${formatRupiah(transaction.amount)} telah disetujui`,
      transactionId,
    })

    if (transaction.createdBy.phoneNumber) {
      await sendWhatsApp(
        transaction.createdBy.phoneNumber,
        pesanApprovalDisetujui({
          namaKategori: transaction.category.name,
          nominal: formatRupiah(transaction.amount),
          disetujuiOleh: approver.fullName,
          entityName: transaction.entity.name,
        })
      )
    }
  }

  revalidatePath('/dashboard/approval')
  revalidatePath('/dashboard/transaksi')
}

export async function rejectTransaction(transactionId: string, approverId: string, note: string) {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { category: true, entity: true, createdBy: true }
  })

  if (!transaction) throw new Error('Transaksi tidak ditemukan')

  const approver = await prisma.person.findUnique({ where: { id: approverId } })
  if (!approver) throw new Error('Approver tidak ditemukan')

  await prisma.transaction.update({
    where: { id: transactionId },
    data: { approvalStatus: 'REJECTED', currentApproverId: null }
  })

  await prisma.approvalLog.create({
    data: {
      transactionId,
      approverId,
      approverName: approver.fullName,
      approvalRole: 'APPROVER',
      action: 'REJECT',
      note,
    }
  })

  // Notif ke pembuat
  await createNotification({
    personId: transaction.createdById,
    type: 'APPROVAL_REJECTED',
    title: '❌ Pengeluaran Ditolak',
    message: `Pengeluaran ${transaction.category.name} sebesar ${formatRupiah(transaction.amount)} ditolak. Alasan: ${note}`,
    transactionId,
  })

  if (transaction.createdBy.phoneNumber) {
    await sendWhatsApp(
      transaction.createdBy.phoneNumber,
      pesanApprovalDitolak({
        namaKategori: transaction.category.name,
        nominal: formatRupiah(transaction.amount),
        ditolakOleh: approver.fullName,
        alasan: note,
        entityName: transaction.entity.name,
      })
    )
  }

  revalidatePath('/dashboard/approval')
  revalidatePath('/dashboard/transaksi')
}
