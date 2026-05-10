import { PrismaClient, EntityType, TransactionType, MemberRole, PersonStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const mosque = await prisma.mosque.upsert({
    where: { id: 'mosque-default' },
    update: {},
    create: {
      id: 'mosque-default',
      name: 'Masjid Al-Salam',
      city: 'Bintaro',
      province: 'Banten',
      isActive: true,
    }
  })

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

  // Person Types DKM
  const personTypesDKM = [
    'Ketua DKM', 'Wakil Ketua DKM', 'Sekretaris DKM',
    'Bendahara DKM', 'Pengurus', 'Marbot', 'Jamaah',
    'Muzaki', 'Mustahiq', 'Donatur',
  ]

  for (const name of personTypesDKM) {
    await prisma.personType.upsert({
      where: { id: `dkm-type-${name}` },
      update: {},
      create: {
        id: `dkm-type-${name}`,
        name,
        entityId: dkm.id,
        isActive: true,
      }
    })
  }

  // Person Types Yayasan
  const personTypesYayasan = [
    'Ketua Yayasan', 'Wakil Ketua Yayasan', 'Sekretaris Yayasan',
    'Bendahara Yayasan', 'Pengurus Yayasan', 'Guru', 'Staff',
    'Donatur Yayasan',
  ]

  for (const name of personTypesYayasan) {
    await prisma.personType.upsert({
      where: { id: `yayasan-type-${name}` },
      update: {},
      create: {
        id: `yayasan-type-${name}`,
        name,
        entityId: yayasan.id,
        isActive: true,
      }
    })
  }

  // Admin person
  const adminPerson = await prisma.person.upsert({
    where: { id: 'admin-default' },
    update: {},
    create: {
      id: 'admin-default',
      fullName: 'Super Admin',
      email: 'admin@masjid.com',
      isActive: true,
      status: PersonStatus.ACTIVE,
      entityId: dkm.id,
    }
  })

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

  // Seed kategori DKM
  const kategoriPemasukanDKM = ['Infaq Jumat', 'Donasi Jamaah', 'Kotak Amal', 'Kenclengan', 'Sewa Aula', 'Zakat', 'Qurban', 'Lain-lain']
  for (const name of kategoriPemasukanDKM) {
    await prisma.category.upsert({
      where: { id: `dkm-income-${name}` },
      update: {},
      create: { id: `dkm-income-${name}`, entityId: dkm.id, name, type: TransactionType.INCOME }
    })
  }

  const kategoriPengeluaranDKM = ['Listrik', 'Air', 'Honor Marbot', 'Konsumsi', 'Kegiatan Kajian', 'Santunan', 'Maintenance', 'Internet', 'Lain-lain']
  for (const name of kategoriPengeluaranDKM) {
    await prisma.category.upsert({
      where: { id: `dkm-expense-${name}` },
      update: {},
      create: { id: `dkm-expense-${name}`, entityId: dkm.id, name, type: TransactionType.EXPENSE }
    })
  }

  // Seed kategori Yayasan
  const kategoriPemasukanYayasan = ['Donasi Pendidikan', 'Wakaf', 'Bantuan Pemerintah', 'Unit Usaha', 'Lain-lain']
  for (const name of kategoriPemasukanYayasan) {
    await prisma.category.upsert({
      where: { id: `yayasan-income-${name}` },
      update: {},
      create: { id: `yayasan-income-${name}`, entityId: yayasan.id, name, type: TransactionType.INCOME }
    })
  }

  const kategoriPengeluaranYayasan = ['Operasional Sekolah', 'Gaji Guru', 'Alat Tulis', 'Renovasi', 'Lain-lain']
  for (const name of kategoriPengeluaranYayasan) {
    await prisma.category.upsert({
      where: { id: `yayasan-expense-${name}` },
      update: {},
      create: { id: `yayasan-expense-${name}`, entityId: yayasan.id, name, type: TransactionType.EXPENSE }
    })
  }

  console.log('✅ Seed berhasil!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
