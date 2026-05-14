import { logout } from '@/app/login/actions'
import NotificationBell from './NotificationBell'
import { LogOut, Building2, Star } from 'lucide-react'

type HeaderProps = {
  fullName: string
  email: string
  entityName: string
  mosqueName: string
  role: string
  notifications: any[]
  unreadCount: number
}

const roleConfig: Record<string, { label: string; color: string }> = {
  SUPER_ADMIN: { label: 'Super Admin', color: 'text-red-600 bg-red-50' },
  KETUA: { label: 'Ketua', color: 'text-purple-600 bg-purple-50' },
  BENDAHARA: { label: 'Bendahara', color: 'text-yellow-600 bg-yellow-50' },
  BENDAHARA_DKM: { label: 'Bendahara DKM', color: 'text-yellow-600 bg-yellow-50' },
  BENDAHARA_YAYASAN: { label: 'Bendahara Yayasan', color: 'text-yellow-600 bg-yellow-50' },
  PENGURUS: { label: 'Pengurus', color: 'text-emerald-600 bg-emerald-50' },
  VIEWER: { label: 'Viewer', color: 'text-gray-600 bg-gray-100' },
}

export default function Header({
  fullName, email, entityName, mosqueName, role, notifications, unreadCount
}: HeaderProps) {
  const roleInfo = roleConfig[role] ?? { label: role, color: 'text-gray-600 bg-gray-100' }

  return (
    <header className="hidden md:flex bg-white border-b border-gray-100 px-6 py-3 items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center font-bold text-emerald-700">
          {fullName.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{fullName}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Building2 size={11} className="text-gray-400" />
              <span>{mosqueName}</span>
              {entityName && (
                <>
                  <span className="text-gray-300">•</span>
                  <span>{entityName}</span>
                </>
              )}
            </div>
            {role && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleInfo.color}`}>
                {roleInfo.label}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <NotificationBell notifications={notifications} unreadCount={unreadCount} />
        <form action={logout}>
          <button type="submit"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors px-3 py-2 rounded-xl hover:bg-red-50">
            <LogOut size={16} />
            <span>Keluar</span>
          </button>
        </form>
      </div>
    </header>
  )
}
