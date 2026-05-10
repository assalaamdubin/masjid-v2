'use server'

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function updatePassword(formData: FormData) {
  const currentPassword = formData.get('currentPassword') as string
  const newPassword = formData.get('newPassword') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (newPassword !== confirmPassword) {
    throw new Error('Password baru tidak cocok')
  }

  if (newPassword.length < 8) {
    throw new Error('Password minimal 8 karakter')
  }

  const supabase = await createClient()

  // Verifikasi password lama dengan re-login
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) throw new Error('User tidak ditemukan')

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  })

  if (signInError) throw new Error('Password lama tidak benar')

  // Update password baru
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) throw new Error(error.message)
}

export async function updateProfil(formData: FormData, personId: string) {
  const fullName = formData.get('fullName') as string
  const phoneNumber = formData.get('phoneNumber') as string
  const address = formData.get('address') as string

  await prisma.person.update({
    where: { id: personId },
    data: { fullName, phoneNumber, address }
  })

  revalidatePath('/dashboard/profil')
}
