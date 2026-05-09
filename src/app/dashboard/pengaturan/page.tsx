import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import PengaturanClient from './PengaturanClient'

export default async function PengaturanPage() {
  const currentUser = await getCurrentUser()

  const mosque = await prisma.mosque.findFirst({
    where: { id: currentUser.mosqueId ?? '' }
  })

  return <PengaturanClient mosque={mosque} />
}
