'use server'

import { prisma } from '@/lib/prisma'
import { TransactionType } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const DEFAULT_ENTITY_ID = 'dkm-default'
const DEFAULT_PERSON_ID = 'admin-default'

export async function createTransaksi(formData: FormData) {
  const type = formData.get('type') as string
  const date = formData.get('date') as string
  const amount = formData.get('amount') as string
  const categoryId = formData.get('categoryId') as string
  const description = formData.get('description') as string
  const payerName = formData.get('payerName') as string
  const paymentMethod = formData.get('paymentMethod') as string

  // Pastikan person admin ada
  await prisma.person.upsert({
    where: { id: DEFAULT_PERSON_ID },
    update: {},
    create: {
      id: DEFAULT_PERSON_ID,
      fullName: 'Admin',
      email: 'admin@masjid.com',
    }
  })

  await prisma.transaction.create({
    data: {
      entityId: DEFAULT_ENTITY_ID,
      type: type === 'INCOME' ? TransactionType.INCOME : TransactionType.EXPENSE,
      date: new Date(date),
      amount: parseFloat(amount),
      categoryId,
      description,
      payerName,
      paymentMethod,
      createdById: DEFAULT_PERSON_ID,
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
