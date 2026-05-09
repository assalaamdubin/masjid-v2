import { PrismaClient, EntityType, TransactionType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Buat Entity DKM
  const dkm = await prisma.entity.upsert({
    where: { id: 'dkm-default' },
    update: {},
    create: {
      id: 'dkm-default',
      name: 'DKM Masjid',
      type: EntityType.DKM,
      description: 'Dewan Kemakmuran Masjid',
      isActive: true,
    }
  })

  // Buat Entity Yayasan
  const yayasan = await prisma.entity.upsert({
    where: { id: 'yayasan-default' },
    update: {},
    create: {
      id: 'yayasan-default',
      name: 'Yayasan Masjid',
      type: EntityType.YAYASAN,
      description: 'Yayasan Masjid',
      isActive: true,
    }
  })

  // Seed kategori DKM - Pemasukan
  const kategoriPemasukanDKM = [
    'Infaq Jumat', 'Donasi Jamaah', 'Kotak Amal',
    'Kenclengan', 'Sewa Aula', 'Zakat', 'Qurban', 'Lain-lain'
  ]

  for (const name of kategoriPemasukanDKM) {
    await prisma.category.upsert({
      where: { id: `dkm-income-${name}` },
      update: {},
      create: {
        id: `dkm-income-${name}`,
        entityId: dkm.id,
        name,
        type: TransactionType.INCOME,
      }
    })
  }

  // Seed kategori DKM - Pengeluaran
  const kategoriPengeluaranDKM = [
    'Listrik', 'Air', 'Honor Marbot', 'Konsumsi',
    'Kegiatan Kajian', 'Santunan', 'Maintenance', 'Internet', 'Lain-lain'
  ]

  for (const name of kategoriPengeluaranDKM) {
    await prisma.category.upsert({
      where: { id: `dkm-expense-${name}` },
      update: {},
      create: {
        id: `dkm-expense-${name}`,
        entityId: dkm.id,
        name,
        type: TransactionType.EXPENSE,
      }
    })
  }

  console.log('✅ Seed berhasil!')
  console.log(`DKM: ${dkm.id}`)
  console.log(`Yayasan: ${yayasan.id}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
