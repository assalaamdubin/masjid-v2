'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function updateMosque(formData: FormData, mosqueId: string) {
  const name = formData.get('name') as string
  const address = formData.get('address') as string
  const city = formData.get('city') as string
  const province = formData.get('province') as string
  const phone = formData.get('phone') as string
  const email = formData.get('email') as string

  await prisma.mosque.update({
    where: { id: mosqueId },
    data: { name, address, city, province, phone, email }
  })

  revalidatePath('/dashboard/pengaturan')
}
