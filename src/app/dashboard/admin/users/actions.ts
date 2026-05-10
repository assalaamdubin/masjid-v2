'use server'

import { prisma } from '@/lib/prisma'
import { PersonStatus, MemberRole } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function approveUser(personId: string) {
  await prisma.person.update({
    where: { id: personId },
    data: { status: PersonStatus.ACTIVE, isActive: true }
  })

  await prisma.entityMember.updateMany({
    where: { personId },
    data: { isActive: true }
  })

  revalidatePath('/dashboard/admin/users')
}

export async function rejectUser(personId: string) {
  await prisma.person.update({
    where: { id: personId },
    data: { status: PersonStatus.REJECTED, isActive: false }
  })

  revalidatePath('/dashboard/admin/users')
}

export async function updateUserRole(personId: string, entityId: string, role: MemberRole, isBendahara: boolean) {
  await prisma.entityMember.updateMany({
    where: { personId, entityId },
    data: { role, isBendahara }
  })

  revalidatePath('/dashboard/admin/users')
}

export async function deleteUser(personId: string) {
  // Hapus entity members dulu
  await prisma.entityMember.deleteMany({ where: { personId } })

  // Hapus notifications
  await prisma.notification.deleteMany({ where: { personId } })

  // Ambil user untuk dapat supabaseId
  const user = await prisma.user.findUnique({ where: { personId } })

  // Hapus user record
  await prisma.user.deleteMany({ where: { personId } })

  // Hapus person
  await prisma.person.delete({ where: { id: personId } })

  // Hapus dari Supabase Auth
  if (user?.supabaseId) {
    const supabase = await createClient()
    await supabase.auth.admin.deleteUser(user.supabaseId)
  }

  revalidatePath('/dashboard/admin/users')
}

export async function updateUserStatus(personId: string, status: PersonStatus) {
  await prisma.person.update({
    where: { id: personId },
    data: {
      status,
      isActive: status === PersonStatus.ACTIVE
    }
  })

  await prisma.entityMember.updateMany({
    where: { personId },
    data: { isActive: status === PersonStatus.ACTIVE }
  })

  revalidatePath('/dashboard/admin/users')
}

export async function linkPersonToUser(userId: string, personId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { personId }
  })
  revalidatePath('/dashboard/admin/users')
}
