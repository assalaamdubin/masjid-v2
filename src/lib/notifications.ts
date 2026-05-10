import { prisma } from '@/lib/prisma'
import { NotificationType } from '@prisma/client'

export async function createNotification({
  personId,
  type,
  title,
  message,
  transactionId,
}: {
  personId: string
  type: NotificationType
  title: string
  message: string
  transactionId?: string
}) {
  await prisma.notification.create({
    data: { personId, type, title, message, transactionId }
  })
}

export async function getUnreadCount(personId: string) {
  return prisma.notification.count({
    where: { personId, isRead: false }
  })
}

export async function getNotifications(personId: string) {
  return prisma.notification.findMany({
    where: { personId },
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: { transaction: { include: { category: true } } }
  })
}

export async function markAsRead(notificationId: string) {
  await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true }
  })
}

export async function markAllAsRead(personId: string) {
  await prisma.notification.updateMany({
    where: { personId, isRead: false },
    data: { isRead: true }
  })
}
