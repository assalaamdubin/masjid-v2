'use server'

import { prisma } from '@/lib/prisma'
import { PersonStatus } from '@prisma/client'
import { revalidatePath } from 'next/cache'

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
