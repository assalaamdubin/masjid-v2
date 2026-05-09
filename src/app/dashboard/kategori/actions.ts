'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createKategori(formData: FormData) {
  const name = formData.get('name') as string
  const type = formData.get('type') as string

  if (!name || !type) throw new Error('Data tidak lengkap')

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
