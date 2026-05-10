import { prisma } from '@/lib/prisma'
import { createNotification } from '@/lib/notifications'
import { sendWhatsApp, pesanPengajuanPengeluaran, pesanApprovalDisetujui, pesanApprovalDitolak } from '@/lib/fonnte'

function formatRupiah(amount: any) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(Number(amount))
}

// Ambil chain approval: pengaju -> reportTo -> ... -> Bendahara -> ... -> Ketua
export async function buildApprovalChain(createdById: string, entityId: string) {
  const chain: string[] = []

  // Naik dari pengaju sampai mentok
  let current = await prisma.person.findUnique({
    where: { id: createdById },
    include: { reportTo: true }
  })

  // Naik ke atas lewat reportTo
  while (current?.reportToId) {
    current = await prisma.person.findUnique({
      where: { id: current.reportToId },
      include: { reportTo: true, entityMembers: true }
    })
    if (current) chain.push(current.id)
  }

  // Pastikan Bendahara entity ada di chain
  const bendahara = await prisma.entityMember.findFirst({
    where: { entityId, isBendahara: true, isActive: true },
    include: { person: true }
  })

  if (bendahara && !chain.includes(bendahara.personId)) {
    // Insert bendahara sebelum level terakhir
    chain.splice(Math.max(0, chain.length - 1), 0, bendahara.personId)
  }

  return chain
}

// Kirim notif ke approver berikutnya
export async function notifyNextApprover(
  transactionId: string,
  approverId: string,
  entityId: string
) {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { category: true, entity: true, createdBy: true }
  })

  if (!transaction) return

  const approver = await prisma.person.findUnique({
    where: { id: approverId }
  })

  if (!approver) return

  const approvalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/approval`

  // In-app notification
  await createNotification({
    personId: approverId,
    type: 'APPROVAL_REQUEST',
    title: '📤 Pengajuan Pengeluaran Menunggu Approval Anda',
    message: `${transaction.createdBy.fullName} mengajukan pengeluaran ${transaction.category.name} sebesar ${formatRupiah(transaction.amount)}`,
    transactionId,
  })

  // WA notification
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

  // Kalau di bawah threshold, cukup bendahara saja
  let approvalChain = chain
  if (threshold > 0 && amount <= threshold) {
    const bendahara = await prisma.entityMember.findFirst({
      where: { entityId, isBendahara: true, isActive: true }
    })
    approvalChain = bendahara ? [bendahara.personId] : chain
  }

  if (approvalChain.length === 0) {
    // Tidak ada approver, auto approve
    await prisma.transaction.update({
      where: { id: transactionId },
      data: { approvalStatus: 'APPROVED', currentApproverId: null }
    })
    return
  }

  const firstApprover = approvalChain[0]

  await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      approvalStatus: 'PENDING_APPROVAL',
      currentApproverId: firstApprover,
    }
  })

  await notifyNextApprover(transactionId, firstApprover, entityId)
}
