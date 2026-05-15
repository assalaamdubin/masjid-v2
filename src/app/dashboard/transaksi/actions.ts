'use server'

import { prisma } from '@/lib/prisma'
import { TransactionType } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { submitTransactionForApproval } from '@/lib/approval'
import { createAuditLog } from '@/lib/audit'

export async function createTransaksi(formData: FormData, entityId: string, personId: string) {
  const type = formData.get('type') as string
  const date = formData.get('date') as string
  const amount = formData.get('amount') as string
  const categoryId = formData.get('categoryId') as string
  const description = formData.get('description') as string
  const payerName = formData.get('payerName') as string
  const paymentMethod = formData.get('paymentMethod') as string
  const attachmentUrl = formData.get('attachmentUrl') as string
  const kegiatanId = formData.get('kegiatanId') as string
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
      approvalStatus: isExpense ? 'PENDING_APPROVAL' : 'APPROVED',
      kegiatanId: kegiatanId || null,
    }
  })

  // Audit log
  const person = await prisma.person.findUnique({ where: { id: personId } })
  await createAuditLog({
    entityName: 'Transaction',
    entityId: transaction.id,
    action: 'CREATE',
    description: `Menambah transaksi ${isExpense ? 'pengeluaran' : 'pemasukan'} ${formData.get('description') || ''}`,
    personId,
    personName: person?.fullName ?? 'Unknown',
  })

  if (isExpense) {
    await submitTransactionForApproval(
      transaction.id,
      personId,
      entityId,
      parseFloat(amount)
    )
  }

  revalidatePath('/dashboard/transaksi')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/kegiatan')
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
  revalidatePath('/dashboard/kegiatan')
}

// Soft delete — cancel transaksi
export async function deleteTransaksi(id: string) {
  await prisma.transaction.update({
    where: { id },
    data: { approvalStatus: 'CANCELLED' }
  })
  revalidatePath('/dashboard/transaksi')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/kegiatan')
}

export async function updateAttachment(id: string, attachmentUrl: string) {
  await prisma.transaction.update({
    where: { id },
    data: { attachmentUrl }
  })
  revalidatePath('/dashboard/transaksi')
}
