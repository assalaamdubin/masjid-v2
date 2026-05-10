'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createRole(formData: FormData) {
  const name = formData.get('name') as string
  const entityId = formData.get('entityId') as string

  if (!name || !entityId) throw new Error('Data tidak lengkap')

  await prisma.role.create({
    data: { name, entityId, isDefault: false, isActive: true }
  })

  revalidatePath('/dashboard/admin/users')
}

export async function updateRole(id: string, formData: FormData) {
  const name = formData.get('name') as string
  await prisma.role.update({
    where: { id },
    data: { name }
  })
  revalidatePath('/dashboard/admin/users')
}

export async function deleteRole(id: string) {
  await prisma.role.delete({ where: { id } })
  revalidatePath('/dashboard/admin/users')
}
