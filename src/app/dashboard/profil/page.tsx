import { getCurrentUser } from '@/lib/auth'
import ProfilClient from './ProfilClient'

export default async function ProfilPage() {
  const currentUser = await getCurrentUser()
  return <ProfilClient person={currentUser.person} />
}
