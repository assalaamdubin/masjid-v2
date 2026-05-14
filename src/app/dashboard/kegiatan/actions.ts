'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createKegiatan(formData: FormData, entityId: string, createdById: string) {
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const startDate = formData.get('startDate') as string
  const endDate = formData.get('endDate') as string
  const location = formData.get('location') as string

  await prisma.kegiatan.create({
    data: {
      name,
      description: description || null,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      location: location || null,
      entityId,
      createdById,
    }
  })

  revalidatePath('/dashboard/kegiatan')
}

export async function updateKegiatan(id: string, formData: FormData) {
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const startDate = formData.get('startDate') as string
  const endDate = formData.get('endDate') as string
  const location = formData.get('location') as string
  const status = formData.get('status') as string

  await prisma.kegiatan.update({
    where: { id },
    data: {
      name,
      description: description || null,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      location: location || null,
      status: status as any,
    }
  })

  revalidatePath('/dashboard/kegiatan')
}

export async function deleteKegiatan(id: string) {
  await prisma.kegiatan.update({
    where: { id },
    data: { isActive: false }
  })

  revalidatePath('/dashboard/kegiatan')
}

export async function addPanitia(kegiatanId: string, personId: string, jabatan: string) {
  await prisma.kegiatanPanitia.create({
    data: { kegiatanId, personId, jabatan }
  })

  revalidatePath('/dashboard/kegiatan')
}

export async function removePanitia(id: string) {
  await prisma.kegiatanPanitia.delete({ where: { id } })
  revalidatePath('/dashboard/kegiatan')
}

export async function addBudget(kegiatanId: string, categoryId: string, budgetAmount: number, description: string) {
  await prisma.kegiatanBudget.create({
    data: { kegiatanId, categoryId, budgetAmount, description: description || null }
  })

  revalidatePath('/dashboard/kegiatan')
}

export async function removeBudget(id: string) {
  await prisma.kegiatanBudget.delete({ where: { id } })
  revalidatePath('/dashboard/kegiatan')
}
