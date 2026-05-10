'use server'

import { prisma } from '@/lib/prisma'
import { ApprovalStatus } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { sendWhatsApp, pesanApprovalDisetujui, pesanApprovalDitolak, pesanPengajuanPengeluaran } from '@/lib/fonnte'

function formatRupiah(amount: any) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(Number(amount))
}

export async function submitForApproval(transactionId: string) {
  const transaction = await prisma.transaction.update({
    where: { id: transactionId },
    data: { approvalStatus: ApprovalStatus.PENDING_KETUA },
    include: {
      category: true,
      entity: true,
      createdBy: true,
    }
  })

  // Ambil semua Ketua di entity yang sama
  const ketuaMembers = await prisma.entityMember.findMany({
    where: {
      entityId: transaction.entityId,
      role: 'KETUA',
      isActive: true,
    },
    include: { person: true }
  })

  // Kirim notif WA ke semua Ketua
  const approvalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/approval`
  
  for (const member of ketuaMembers) {
    if (member.person.phoneNumber) {
      await sendWhatsApp(
        member.person.phoneNumber,
        pesanPengajuanPengeluaran({
          namaKategori: transaction.category.name,
          nominal: formatRupiah(transaction.amount),
          keterangan: transaction.description ?? '',
          diajukanOleh: transaction.createdBy.fullName,
          entityName: transaction.entity.name,
          approvalUrl,
        })
      )
    }
  }

  revalidatePath('/dashboard/transaksi')
}

export async function approveTransaction(transactionId: string, approverName: string, note?: string) {
  const transaction = await prisma.transaction.update({
    where: { id: transactionId },
    data: { approvalStatus: ApprovalStatus.APPROVED },
    include: {
      category: true,
      entity: true,
      createdBy: true,
    }
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

  // Kirim notif WA ke pembuat transaksi
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
    include: {
      category: true,
      entity: true,
      createdBy: true,
    }
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

  // Kirim notif WA ke pembuat transaksi
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
