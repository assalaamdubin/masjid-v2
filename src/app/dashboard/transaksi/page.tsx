import { prisma } from '@/lib/prisma'
import TransaksiClient from './TransaksiClient'

export default async function TransaksiPage() {
  const [transaksi, kategori] = await Promise.all([
    prisma.transaction.findMany({
      where: { entityId: 'dkm-default' },
      include: { category: true, createdBy: true },
      orderBy: { date: 'desc' },
      take: 50,
    }),
    prisma.category.findMany({
      where: { entityId: 'dkm-default', isActive: true },
      orderBy: [{ type: 'asc' }, { name: 'asc' }]
    })
  ])

  return <TransaksiClient initialData={transaksi} kategori={kategori} />
}
