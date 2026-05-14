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

// Soft delete — nonaktifkan role
export async function deleteRole(id: string) {
  const current = await prisma.role.findUnique({ where: { id } })
  const newIsActive = !current?.isActive
  await prisma.role.update({
    where: { id },
    data: { isActive: newIsActive }
  })
  revalidatePath('/dashboard/admin/users')
}

export async function assignRoleToMember(personId: string, entityId: string, roleId: string, memberRole: string, isBendahara: boolean) {
  await prisma.entityMember.updateMany({
    where: { personId, entityId },
    data: {
      role: memberRole as any,
      roleId: roleId || null,
      isBendahara,
    }
  })
  revalidatePath('/dashboard/admin/users')
}
