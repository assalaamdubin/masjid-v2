import { logout } from '@/app/login/actions'
import NotificationBell from './NotificationBell'

type HeaderProps = {
  fullName: string
  email: string
  entityName: string
  mosqueName: string
  role: string
  notifications: any[]
  unreadCount: number
}

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: '⭐ Super Admin',
  KETUA: '👑 Ketua',
  BENDAHARA: '💰 Bendahara',
  BENDAHARA_DKM: '💰 Bendahara DKM',
  BENDAHARA_YAYASAN: '💰 Bendahara Yayasan',
  PENGURUS: '🏢 Pengurus',
  VIEWER: '👁️ Viewer',
}

export default function Header({
  fullName, email, entityName, mosqueName, role, notifications, unreadCount
}: HeaderProps) {
  return (
    <header className="hidden md:flex bg-white border-b border-gray-200 px-6 py-3 items-center justify-between">
      <div>
        <p className="text-sm font-semibold text-gray-900">{fullName}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-gray-500">{mosqueName}</span>
          {entityName && (
            <>
              <span className="text-gray-300">•</span>
              <span className="text-xs text-gray-500">{entityName}</span>
            </>
          )}
          {role && (
            <>
              <span className="text-gray-300">•</span>
              <span className="text-xs text-emerald-600 font-medium">{roleLabels[role] ?? role}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <NotificationBell notifications={notifications} unreadCount={unreadCount} />
        <form action={logout}>
          <button type="submit"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-red-50">
            <span>🚪</span>
            Keluar
          </button>
        </form>
      </div>
    </header>
  )
}
