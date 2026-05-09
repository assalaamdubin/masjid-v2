import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const person = await prisma.person.findUnique({
    where: { email: user.email },
    include: {
      entityMembers: {
        where: { isActive: true },
        include: {
          entity: {
            include: { mosque: true }
          }
        }
      }
    }
  })

  if (!person || person.status !== 'ACTIVE') {
    const supabaseClient = await createClient()
    await supabaseClient.auth.signOut()
    redirect('/login')
  }

  const primaryMember = person.entityMembers[0]

  return {
    person,
    entityId: primaryMember?.entityId ?? null,
    entityName: primaryMember?.entity.name ?? null,
    mosqueName: primaryMember?.entity.mosque.name ?? null,
    role: primaryMember?.role ?? null,
    isAdmin: primaryMember?.role === 'SUPER_ADMIN',
  }
}
