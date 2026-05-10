'use server'

import { prisma } from '@/lib/prisma'
import { TransactionType, ApprovalStatus, NotificationType } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { sendWhatsApp, pesanPengajuanPengeluaran } from '@/lib/fonnte'
import { createNotification } from '@/lib/notifications'

function formatRupiah(amount: any) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(Number(amount))
}

export async function createTransaksi(formData: FormData, entityId: string, personId: string) {
  const type = formData.get('type') as string
  const date = formData.get('date') as string
  const amount = formData.get('amount') as string
  const categoryId = formData.get('categoryId') as string
  const description = formData.get('description') as string
  const payerName = formData.get('payerName') as string
  const paymentMethod = formData.get('paymentMethod') as string
  const attachmentUrl = formData.get('attachmentUrl') as string
  const isExpense = type === 'EXPENSE'

  const transaction = await prisma.transaction.create({
    data: {
      entityId,
      type: isExpense ? TransactionType.EXPENSE : TransactionType.INCOME,
      date: new Date(date),
      amount: parseFloat(amount),
      categoryId,
      description,
      payerName,
      paymentMethod,
      attachmentUrl: attachmentUrl || null,
      createdById: personId,
      approvalStatus: isExpense ? ApprovalStatus.PENDING_KETUA : ApprovalStatus.APPROVED,
    },
    include: { category: true, entity: true, createdBy: true }
  })

  if (isExpense) {
    const ketuaMembers = await prisma.entityMember.findMany({
      where: { entityId, role: 'KETUA', isActive: true },
      include: { person: true }
    })

    const approvalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/approval`

    for (const member of ketuaMembers) {
      // Notifikasi in-app ke Ketua
      await createNotification({
        personId: member.personId,
        type: NotificationType.APPROVAL_REQUEST,
        title: '📤 Pengajuan Pengeluaran Baru',
        message: `${transaction.createdBy.fullName} mengajukan pengeluaran ${transaction.category.name} sebesar ${formatRupiah(transaction.amount)}`,
        transactionId: transaction.id,
      })

      // Notif WA ke Ketua
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
  }

  revalidatePath('/dashboard/transaksi')
  revalidatePath('/dashboard')
}

export async function updateTransaksi(id: string, formData: FormData) {
  const date = formData.get('date') as string
  const amount = formData.get('amount') as string
  const categoryId = formData.get('categoryId') as string
  const description = formData.get('description') as string
  const payerName = formData.get('payerName') as string
  const paymentMethod = formData.get('paymentMethod') as string
  const attachmentUrl = formData.get('attachmentUrl') as string

  await prisma.transaction.update({
    where: { id },
    data: {
      date: new Date(date),
      amount: parseFloat(amount),
      categoryId,
      description,
      payerName,
      paymentMethod,
      attachmentUrl: attachmentUrl || null,
    }
  })

  revalidatePath('/dashboard/transaksi')
  revalidatePath('/dashboard')
}

export async function deleteTransaksi(id: string) {
  await prisma.transaction.delete({ where: { id } })
  revalidatePath('/dashboard/transaksi')
  revalidatePath('/dashboard')
}

export async function updateAttachment(id: string, attachmentUrl: string) {
  await prisma.transaction.update({
    where: { id },
    data: { attachmentUrl }
  })
  revalidatePath('/dashboard/transaksi')
}
