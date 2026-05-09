'use server'

import { prisma } from '@/lib/prisma'
import { TransactionType } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export async function createKategori(formData: FormData) {
  const name = formData.get('name') as string
  const typeRaw = formData.get('type') as string

  if (!name || !typeRaw) throw new Error('Data tidak lengkap')

  const type = typeRaw === 'income' ? TransactionType.income : TransactionType.expense

  await prisma.category.create({
    data: { name, type }
  })

  revalidatePath('/dashboard/kategori')
}

export async function deleteKategori(id: string) {
  await prisma.category.delete({ where: { id } })
  revalidatePath('/dashboard/kategori')
}

export async function toggleKategori(id: string, isActive: boolean) {
  await prisma.category.update({
    where: { id },
    data: { isActive: !isActive }
  })
  revalidatePath('/dashboard/kategori')
}
