'use server'

import { prisma } from '@/lib/prisma'
import { TransactionType } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export async function createKategori(formData: FormData, entityId: string) {
  const name = formData.get('name') as string
  const type = formData.get('type') as string

  await prisma.category.create({
    data: {
      entityId,
      name,
      type: type === 'INCOME' ? TransactionType.INCOME : TransactionType.EXPENSE,
      isActive: true,
    }
  })

  revalidatePath('/dashboard/kategori')
}

export async function updateKategori(id: string, formData: FormData) {
  const name = formData.get('name') as string

  await prisma.category.update({
    where: { id },
    data: { name }
  })

  revalidatePath('/dashboard/kategori')
}

// Soft delete — nonaktifkan kategori
export async function deleteKategori(id: string) {
  await prisma.category.update({
    where: { id },
    data: { isActive: false }
  })

  revalidatePath('/dashboard/kategori')
}

export async function toggleKategori(id: string, isActive: boolean) {
  await prisma.category.update({
    where: { id },
    data: { isActive }
  })
  revalidatePath('/dashboard/kategori')
}
