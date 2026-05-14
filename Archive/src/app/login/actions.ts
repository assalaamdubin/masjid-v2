'use server'

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = (formData.get('email') as string).toLowerCase().trim()
  const password = formData.get('password') as string

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  // Cek status person di database
  const person = await prisma.person.findUnique({
    where: { email }
  })

  if (!person) {
    await supabase.auth.signOut()
    redirect(`/login?error=${encodeURIComponent('Akun tidak ditemukan')}`)
  }

  if (person.status === 'PENDING') {
    await supabase.auth.signOut()
    redirect(`/login?error=${encodeURIComponent('Akun Anda sedang menunggu persetujuan Admin')}`)
  }

  if (person.status === 'REJECTED') {
    await supabase.auth.signOut()
    redirect(`/login?error=${encodeURIComponent('Akun Anda ditolak. Hubungi Admin untuk info lebih lanjut')}`)
  }

  if (person.status === 'SUSPENDED') {
    await supabase.auth.signOut()
    redirect(`/login?error=${encodeURIComponent('Akun Anda disuspend. Hubungi Admin')}`)
  }

  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
