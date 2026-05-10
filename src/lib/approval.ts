import { prisma } from '@/lib/prisma'
import { createNotification } from '@/lib/notifications'
import { sendWhatsApp, pesanPengajuanPengeluaran } from '@/lib/fonnte'

function formatRupiah(amount: any) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(Number(amount))
}

// Build chain: line managers -> Bendahara entity -> Ketua entity
export async function buildApprovalChain(createdById: string, entityId: string) {
  const chain: string[] = []

  // Ambil Bendahara entity
  const bendahara = await prisma.entityMember.findFirst({
    where: { entityId, isBendahara: true, isActive: true },
    include: { person: true }
  })

  // Ambil Ketua entity
  const ketua = await prisma.entityMember.findFirst({
    where: { entityId, role: 'KETUA', isActive: true },
    include: { person: true }
  })

  // Naik dari pengaju lewat reportTo, tapi stop sebelum Bendahara/Ketua
  let current = await prisma.person.findUnique({
    where: { id: createdById },
    include: { reportTo: true }
  })

  while (current?.reportToId) {
    current = await prisma.person.findUnique({
      where: { id: current.reportToId },
      include: { reportTo: true }
    })

    if (!current) break

    // Stop kalau sudah sampai Bendahara atau Ketua — akan ditambah manual di bawah
    const isBendahara = bendahara?.personId === current.id
    const isKetua = ketua?.personId === current.id
    if (isBendahara || isKetua) break

    chain.push(current.id)
  }

  // Tambah Bendahara sebelum Ketua (wajib, sesuai entity)
  if (bendahara && !chain.includes(bendahara.personId)) {
    chain.push(bendahara.personId)
  }

  // Tambah Ketua di akhir (level tertinggi)
  if (ketua && !chain.includes(ketua.personId)) {
    chain.push(ketua.personId)
  }

  return chain
}

// Kirim notif ke approver berikutnya
export async function notifyNextApprover(transactionId: string, approverId: string, entityId: string) {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { category: true, entity: true, createdBy: true }
  })
  if (!transaction) return

  const approver = await prisma.person.findUnique({ where: { id: approverId } })
  if (!approver) return

  const approvalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/approval`

  await createNotification({
    personId: approverId,
    type: 'APPROVAL_REQUEST',
    title: '📤 Pengajuan Pengeluaran Menunggu Approval Anda',
    message: `${transaction.createdBy.fullName} mengajukan pengeluaran ${transaction.category.name} sebesar ${formatRupiah(transaction.amount)}`,
    transactionId,
  })

  if (approver.phoneNumber) {
    await sendWhatsApp(
      approver.phoneNumber,
      pesanPengajuanPengeluaran({
        namaKategori: transaction.category.name,
        nominal: formatRupiah(transaction.amount),
        keterangan: transaction.description ?? '',
        diajukanOleh: transaction.createdBy.fullName,
        entityName: transaction.entity.name,
        approvalUrl,
      })
    )
  }
}

// Submit transaksi untuk approval
export async function submitTransactionForApproval(
  transactionId: string,
  createdById: string,
  entityId: string,
  amount: number
) {
  const chain = await buildApprovalChain(createdById, entityId)

  // Cek threshold entity
  const entity = await prisma.entity.findUnique({ where: { id: entityId } })
  const threshold = Number(entity?.approvalThreshold ?? 0)

  // Kalau di bawah threshold, cukup Bendahara saja
  let approvalChain = chain
  if (threshold > 0 && amount <= threshold) {
    const bendahara = await prisma.entityMember.findFirst({
      where: { entityId, isBendahara: true, isActive: true }
    })
    approvalChain = bendahara ? [bendahara.personId] : chain
  }

  if (approvalChain.length === 0) {
    await prisma.transaction.update({
      where: { id: transactionId },
      data: { approvalStatus: 'APPROVED', currentApproverId: null }
    })
    return
  }

  const firstApprover = approvalChain[0]

  await prisma.transaction.update({
    where: { id: transactionId },
    data: { approvalStatus: 'PENDING_APPROVAL', currentApproverId: firstApprover }
  })

  await notifyNextApprover(transactionId, firstApprover, entityId)
}
