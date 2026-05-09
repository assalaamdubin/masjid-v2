import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import KategoriClient from './KategoriClient'

export default async function KategoriPage() {
  const kategori = await prisma.category.findMany({
    orderBy: [{ type: 'asc' }, { name: 'asc' }]
  })

  return <KategoriClient initialData={kategori} />
}
