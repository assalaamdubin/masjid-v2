'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function addComment(transactionId: string, personId: string, message: string) {
  if (!message.trim()) return

  await prisma.transactionComment.create({
    data: { transactionId, personId, message: message.trim() }
  })

  revalidatePath('/dashboard/transaksi')
}

export async function deleteComment(commentId: string) {
  await prisma.transactionComment.delete({ where: { id: commentId } })
  revalidatePath('/dashboard/transaksi')
}
