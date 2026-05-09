'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  console.log('Login attempt:', email)
  console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  console.log('Auth error:', JSON.stringify(error))
  console.log('Auth data:', JSON.stringify(data?.user?.email))

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
