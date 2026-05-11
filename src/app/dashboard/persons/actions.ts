'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createPerson(formData: FormData) {
  const fullName = formData.get('fullName') as string
  const phoneNumber = formData.get('phoneNumber') as string
  const email = formData.get('email') as string
  const address = formData.get('address') as string
  const personTypeId = formData.get('personTypeId') as string
  const entityId = formData.get('entityId') as string
  const reportToId = formData.get('reportToId') as string

  await prisma.person.create({
    data: {
      fullName,
      phoneNumber: phoneNumber || null,
      email: email || null,
      address: address || null,
      personTypeId: personTypeId || null,
      entityId: entityId || null,
      reportToId: reportToId || null,
      status: 'ACTIVE',
      isActive: true,
    }
  })

  revalidatePath('/dashboard/persons')
}

export async function updatePerson(id: string, formData: FormData) {
  const fullName = formData.get('fullName') as string
  const phoneNumber = formData.get('phoneNumber') as string
  const email = formData.get('email') as string
  const address = formData.get('address') as string
  const personTypeId = formData.get('personTypeId') as string
  const entityId = formData.get('entityId') as string
  const reportToId = formData.get('reportToId') as string

  await prisma.person.update({
    where: { id },
    data: {
      fullName,
      phoneNumber: phoneNumber || null,
      email: email || null,
      address: address || null,
      personTypeId: personTypeId || null,
      entityId: entityId || null,
      reportToId: reportToId || null,
    }
  })

  revalidatePath('/dashboard/persons')
}

// Soft delete — nonaktifkan person
export async function deletePerson(id: string) {
  const current = await prisma.person.findUnique({ where: { id } })
  const newIsActive = !current?.isActive
  await prisma.person.update({
    where: { id },
    data: { 
      isActive: newIsActive,
      status: newIsActive ? 'ACTIVE' : 'SUSPENDED'
    }
  })
  revalidatePath('/dashboard/persons')
}

export async function createPersonType(formData: FormData) {
  const name = formData.get('name') as string
  const entityId = formData.get('entityId') as string
  const isPengurus = formData.get('isPengurus') === 'true'

  await prisma.personType.create({
    data: { name, entityId, isPengurus, isActive: true }
  })

  revalidatePath('/dashboard/persons')
}

export async function updatePersonType(id: string, formData: FormData) {
  const name = formData.get('name') as string
  const isPengurus = formData.get('isPengurus') === 'true'

  await prisma.personType.update({
    where: { id },
    data: { name, isPengurus }
  })

  revalidatePath('/dashboard/persons')
}

// Soft delete — nonaktifkan tipe person
export async function deletePersonType(id: string) {
  await prisma.personType.update({
    where: { id },
    data: { isActive: false }
  })
  revalidatePath('/dashboard/persons')
}

export async function linkPersonToUser(userId: string, personId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { personId }
  })
  revalidatePath('/dashboard/admin/users')
}
