'use server'

import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { MemberRole, PersonStatus } from '@prisma/client'

export async function register(formData: FormData) {
  const fullName = formData.get('fullName') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const phoneNumber = formData.get('phoneNumber') as string
  const entityId = formData.get('entityId') as string
  const role = formData.get('role') as MemberRole

  if (!fullName || !email || !password || !entityId || !role) {
    throw new Error('Semua field wajib diisi')
  }

  const existing = await prisma.person.findUnique({ where: { email } })
  if (existing) throw new Error('Email sudah terdaftar')

  const supabase = await createClient()

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError) throw new Error(authError.message)

  // Langsung sign out setelah register — tunggu approval dulu
  await supabase.auth.signOut()

  const person = await prisma.person.create({
    data: {
      fullName,
      email,
      phoneNumber,
      status: PersonStatus.PENDING,
      isActive: false,
    }
  })

  await prisma.user.create({
    data: {
      personId: person.id,
      email,
      supabaseId: authData.user?.id,
    }
  })

  await prisma.entityMember.create({
    data: {
      personId: person.id,
      entityId,
      role,
      isActive: false,
    }
  })
}
