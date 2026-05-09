import { prisma } from '@/lib/prisma'
import KategoriClient from './KategoriClient'

export default async function KategoriPage() {
  const kategori = await prisma.category.findMany({
    where: { entityId: 'dkm-default' },
    orderBy: [{ type: 'asc' }, { name: 'asc' }]
  })

  return <KategoriClient initialData={kategori} />
}
