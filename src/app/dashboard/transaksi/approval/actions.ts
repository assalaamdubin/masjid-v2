'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { createNotification } from '@/lib/notifications'
import { sendWhatsApp, pesanApprovalDisetujui, pesanApprovalDitolak } from '@/lib/fonnte'
import { buildApprovalChain, notifyNextApprover } from '@/lib/approval'
import { createAuditLog } from '@/lib/audit'

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

  // Audit log
  await createAuditLog({
    entityName: 'Transaction',
    entityId: transactionId,
    action: 'APPROVE',
    description: `Menyetujui pengeluaran ${transaction.category.name} sebesar ${formatRupiah(transaction.amount)}`,
    personId: approverId,
    personName: approver.fullName,
  })

  // Build chain
  const chain = await buildApprovalChain(transaction.createdById, transaction.entityId)

  // Threshold check
  const entity = await prisma.entity.findUnique({ where: { id: transaction.entityId } })
  const threshold = Number(entity?.approvalThreshold ?? 0)
  let approvalChain = chain
  if (threshold > 0 && Number(transaction.amount) <= threshold) {
    const bendahara = await prisma.entityMember.findFirst({
      where: { entityId: transaction.entityId, isBendahara: true, isActive: true }
    })
    approvalChain = bendahara ? [bendahara.personId] : chain
  }

  // Cari posisi approver saat ini
  const currentIndex = approvalChain.indexOf(approverId)
  
  // Kalau tidak ketemu di chain, cari dari awal
  const nextApprover = currentIndex >= 0 
    ? approvalChain[currentIndex + 1]
    : approvalChain[0] // fallback ke first approver

  if (nextApprover && nextApprover !== approverId) {
    // Ada approver berikutnya — update currentApproverId & kirim notif
    await prisma.transaction.update({
      where: { id: transactionId },
      data: { currentApproverId: nextApprover }
    })

    // Kirim notif WA & in-app ke approver berikutnya
    await notifyNextApprover(transactionId, nextApprover, transaction.entityId)
  } else {
    // Sudah mentok — FULLY APPROVED!
    await prisma.transaction.update({
      where: { id: transactionId },
      data: { approvalStatus: 'APPROVED', currentApproverId: null }
    })

    // Notif in-app ke pembuat transaksi
    await createNotification({
      personId: transaction.createdById,
      type: 'APPROVAL_APPROVED',
      title: '✅ Pengeluaran Disetujui',
      message: `Pengeluaran ${transaction.category.name} sebesar ${formatRupiah(transaction.amount)} telah disetujui sepenuhnya`,
      transactionId,
    })

    // Notif WA ke pembuat transaksi
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

    // Notif WA ke semua approver sebelumnya (opsional - biar semua tahu)
    for (const appId of approvalChain) {
      if (appId === transaction.createdById) continue
      const app = await prisma.person.findUnique({ where: { id: appId } })
      if (app?.phoneNumber && appId !== approverId) {
        await sendWhatsApp(
          app.phoneNumber,
          `✅ *Info: Pengeluaran Fully Approved*\n\nPengeluaran ${transaction.category.name} sebesar ${formatRupiah(transaction.amount)} dari ${transaction.entity.name} telah disetujui sepenuhnya.\n\n_Pesan otomatis Sistem Keuangan Masjid_`
        )
      }
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

  // Audit log
  await createAuditLog({
    entityName: 'Transaction',
    entityId: transactionId,
    action: 'REJECT',
    description: `Menolak pengeluaran ${transaction.category.name} sebesar ${formatRupiah(transaction.amount)}. Alasan: ${note}`,
    personId: approverId,
    personName: approver.fullName,
  })

  // Notif in-app ke pembuat
  await createNotification({
    personId: transaction.createdById,
    type: 'APPROVAL_REJECTED',
    title: '❌ Pengeluaran Ditolak',
    message: `Pengeluaran ${transaction.category.name} sebesar ${formatRupiah(transaction.amount)} ditolak oleh ${approver.fullName}. Alasan: ${note}`,
    transactionId,
  })

  // Notif WA ke pembuat
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