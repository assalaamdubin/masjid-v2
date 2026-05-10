'use server'

import { prisma } from '@/lib/prisma'
import { ApprovalStatus, NotificationType } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { sendWhatsApp, pesanApprovalDisetujui, pesanApprovalDitolak, pesanPengajuanPengeluaran } from '@/lib/fonnte'
import { createNotification } from '@/lib/notifications'

function formatRupiah(amount: any) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(Number(amount))
}

export async function approveTransaction(transactionId: string, approverName: string, note?: string) {
  const transaction = await prisma.transaction.update({
    where: { id: transactionId },
    data: { approvalStatus: ApprovalStatus.APPROVED },
    include: { category: true, entity: true, createdBy: true }
  })

  await prisma.approvalLog.create({
    data: { transactionId, approverName, approvalRole: 'KETUA', action: 'APPROVE', note }
  })

  // Notifikasi in-app ke pembuat transaksi
  await createNotification({
    personId: transaction.createdById,
    type: NotificationType.APPROVAL_APPROVED,
    title: '✅ Pengeluaran Disetujui',
    message: `Pengeluaran ${transaction.category.name} sebesar ${formatRupiah(transaction.amount)} telah disetujui oleh ${approverName}`,
    transactionId,
  })

  // Notif WA
  if (transaction.createdBy.phoneNumber) {
    await sendWhatsApp(
      transaction.createdBy.phoneNumber,
      pesanApprovalDisetujui({
        namaKategori: transaction.category.name,
        nominal: formatRupiah(transaction.amount),
        disetujuiOleh: approverName,
        entityName: transaction.entity.name,
      })
    )
  }

  revalidatePath('/dashboard/transaksi')
  revalidatePath('/dashboard/approval')
}

export async function rejectTransaction(transactionId: string, approverName: string, note: string) {
  const transaction = await prisma.transaction.update({
    where: { id: transactionId },
    data: { approvalStatus: ApprovalStatus.REJECTED },
    include: { category: true, entity: true, createdBy: true }
  })

  await prisma.approvalLog.create({
    data: { transactionId, approverName, approvalRole: 'KETUA', action: 'REJECT', note }
  })

  // Notifikasi in-app ke pembuat transaksi
  await createNotification({
    personId: transaction.createdById,
    type: NotificationType.APPROVAL_REJECTED,
    title: '❌ Pengeluaran Ditolak',
    message: `Pengeluaran ${transaction.category.name} sebesar ${formatRupiah(transaction.amount)} ditolak oleh ${approverName}. Alasan: ${note}`,
    transactionId,
  })

  // Notif WA
  if (transaction.createdBy.phoneNumber) {
    await sendWhatsApp(
      transaction.createdBy.phoneNumber,
      pesanApprovalDitolak({
        namaKategori: transaction.category.name,
        nominal: formatRupiah(transaction.amount),
        ditolakOleh: approverName,
        alasan: note,
        entityName: transaction.entity.name,
      })
    )
  }

  revalidatePath('/dashboard/transaksi')
  revalidatePath('/dashboard/approval')
}
