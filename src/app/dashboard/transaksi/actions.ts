'use server'

import { prisma } from '@/lib/prisma'
import { TransactionType } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export async function createTransaksi(formData: FormData, entityId: string, personId: string) {
  const type = formData.get('type') as string
  const date = formData.get('date') as string
  const amount = formData.get('amount') as string
  const categoryId = formData.get('categoryId') as string
  const description = formData.get('description') as string
  const payerName = formData.get('payerName') as string
  const paymentMethod = formData.get('paymentMethod') as string
  const attachmentUrl = formData.get('attachmentUrl') as string

  await prisma.transaction.create({
    data: {
      entityId,
      type: type === 'INCOME' ? TransactionType.INCOME : TransactionType.EXPENSE,
      date: new Date(date),
      amount: parseFloat(amount),
      categoryId,
      description,
      payerName,
      paymentMethod,
      attachmentUrl: attachmentUrl || null,
      createdById: personId,
    }
  })

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
