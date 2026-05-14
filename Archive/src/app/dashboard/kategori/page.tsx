import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import KategoriClient from './KategoriClient'

export default async function KategoriPage() {
  const currentUser = await getCurrentUser()
  const entityId = currentUser.entityId

  if (!entityId) {
    return (
      <div className="text-center py-12 text-gray-400">
        <span className="text-4xl block mb-3">⚠️</span>
        <p className="text-sm">Anda belum terdaftar di entity manapun</p>
      </div>
    )
  }

  const kategori = await prisma.category.findMany({
    where: { entityId },
    orderBy: [{ type: 'asc' }, { name: 'asc' }]
  })

  return <KategoriClient initialData={kategori} entityId={entityId} />
}
