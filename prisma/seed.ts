import { PrismaClient, EntityType, TransactionType, MemberRole, PersonStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Buat Mosque
  const mosque = await prisma.mosque.upsert({
    where: { id: 'mosque-default' },
    update: {},
    create: {
      id: 'mosque-default',
      name: 'Masjid Assalaam',
      city: 'Jakarta',
      province: 'DKI Jakarta',
      isActive: true,
    }
  })

  // Buat Entity DKM
  const dkm = await prisma.entity.upsert({
    where: { id: 'dkm-default' },
    update: {},
    create: {
      id: 'dkm-default',
      mosqueId: mosque.id,
      name: 'DKM Masjid Assalaam',
      type: EntityType.DKM,
      isActive: true,
    }
  })

  // Buat Entity Yayasan
  const yayasan = await prisma.entity.upsert({
    where: { id: 'yayasan-default' },
    update: {},
    create: {
      id: 'yayasan-default',
      mosqueId: mosque.id,
      name: 'Yayasan Masjid Assalaam',
      type: EntityType.YAYASAN,
      isActive: true,
    }
  })

  // Buat Super Admin Person
  const adminPerson = await prisma.person.upsert({
    where: { id: 'admin-default' },
    update: {},
    create: {
      id: 'admin-default',
      fullName: 'Super Admin',
      email: 'admin@masjid.com',
      isActive: true,
      status: PersonStatus.ACTIVE,
    }
  })

  // Buat Super Admin EntityMember
  await prisma.entityMember.upsert({
    where: { personId_entityId: { personId: 'admin-default', entityId: 'dkm-default' } },
    update: {},
    create: {
      personId: adminPerson.id,
      entityId: dkm.id,
      role: MemberRole.SUPER_ADMIN,
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

  // Seed kategori Yayasan - Pemasukan
  const kategoriPemasukanYayasan = [
    'Donasi Pendidikan', 'Wakaf', 'Bantuan Pemerintah', 'Unit Usaha', 'Lain-lain'
  ]

  for (const name of kategoriPemasukanYayasan) {
    await prisma.category.upsert({
      where: { id: `yayasan-income-${name}` },
      update: {},
      create: {
        id: `yayasan-income-${name}`,
        entityId: yayasan.id,
        name,
        type: TransactionType.INCOME,
      }
    })
  }

  // Seed kategori Yayasan - Pengeluaran
  const kategoriPengeluaranYayasan = [
    'Operasional Sekolah', 'Gaji Guru', 'Alat Tulis', 'Renovasi', 'Lain-lain'
  ]

  for (const name of kategoriPengeluaranYayasan) {
    await prisma.category.upsert({
      where: { id: `yayasan-expense-${name}` },
      update: {},
      create: {
        id: `yayasan-expense-${name}`,
        entityId: yayasan.id,
        name,
        type: TransactionType.EXPENSE,
      }
    })
  }

  console.log('✅ Seed berhasil!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
