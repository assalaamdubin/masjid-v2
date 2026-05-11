import { prisma } from '@/lib/prisma'

type AuditAction = 
  | 'CREATE' | 'UPDATE' | 'DELETE' | 'ACTIVATE' | 'DEACTIVATE'
  | 'APPROVE' | 'REJECT' | 'LOGIN' | 'LOGOUT' | 'UPLOAD'

export async function createAuditLog({
  entityName,
  entityId,
  action,
  description,
  metadata,
  personId,
  personName,
}: {
  entityName: string
  entityId?: string
  action: AuditAction
  description: string
  metadata?: Record<string, any>
  personId?: string
  personName: string
}) {
  try {
    await prisma.auditLog.create({
      data: {
        entityName,
        entityId,
        action,
        description,
        metadata,
        personId,
        personName,
      }
    })
  } catch (error) {
    // Audit log tidak boleh crash app utama
    console.error('Audit log error:', error)
  }
}
