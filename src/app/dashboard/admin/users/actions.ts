'use server'

import { prisma } from '@/lib/prisma'
import { PersonStatus, MemberRole } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createAuditLog } from '@/lib/audit'

function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function approveUser(personId: string) {
  await prisma.person.update({
    where: { id: personId },
    data: { status: PersonStatus.ACTIVE, isActive: true }
  })

  await prisma.entityMember.updateMany({
    where: { personId },
    data: { isActive: true }
  })

  const person = await prisma.person.findUnique({ where: { id: personId } })
  await createAuditLog({
    entityName: 'User',
    entityId: personId,
    action: 'ACTIVATE',
    description: `Approve user: ${person?.fullName ?? personId}`,
    personName: 'Admin',
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
  // Soft delete di database
  await prisma.person.update({
    where: { id: personId },
    data: { isActive: false, status: PersonStatus.SUSPENDED }
  })

  await prisma.user.update({
    where: { personId },
    data: { isActive: false }
  })

  await prisma.entityMember.updateMany({
    where: { personId },
    data: { isActive: false }
  })

  // Hard delete di Supabase Auth
  const user = await prisma.user.findUnique({ where: { personId } })
  if (user?.supabaseId) {
    const adminClient = getAdminClient()
    await adminClient.auth.admin.deleteUser(user.supabaseId)
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
