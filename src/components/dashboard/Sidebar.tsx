'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { logout } from '@/app/login/actions'
import NotificationBell from './NotificationBell'
import {
  LayoutDashboard,
  Wallet,
  CheckSquare,
  Tag,
  FileText,
  CalendarDays,
  Users,
  UserCog,
  ClipboardList,
  UserCircle,
  Settings,
  X,
  Menu,
  LogOut,
} from 'lucide-react'

const allMenus = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'KETUA', 'BENDAHARA', 'PENGURUS', 'BENDAHARA_DKM', 'BENDAHARA_YAYASAN', 'VIEWER'] },
  { href: '/dashboard/transaksi', label: 'Transaksi', icon: Wallet, roles: ['SUPER_ADMIN', 'KETUA', 'BENDAHARA', 'PENGURUS', 'BENDAHARA_DKM', 'BENDAHARA_YAYASAN'] },
  { href: '/dashboard/approval', label: 'Approval', icon: CheckSquare, roles: ['SUPER_ADMIN', 'KETUA', 'BENDAHARA', 'PENGURUS'] },
  { href: '/dashboard/kategori', label: 'Kategori', icon: Tag, roles: ['SUPER_ADMIN', 'BENDAHARA', 'BENDAHARA_DKM', 'BENDAHARA_YAYASAN'] },
  { href: '/dashboard/laporan', label: 'Laporan', icon: FileText, roles: ['SUPER_ADMIN', 'KETUA', 'BENDAHARA', 'PENGURUS', 'BENDAHARA_DKM', 'BENDAHARA_YAYASAN', 'VIEWER'] },
  { href: '/dashboard/kegiatan', label: 'Kegiatan', icon: CalendarDays, roles: ['SUPER_ADMIN', 'KETUA', 'BENDAHARA', 'PENGURUS'] },
  { href: '/dashboard/persons', label: 'Data Person', icon: Users, roles: ['SUPER_ADMIN', 'KETUA'] },
  { href: '/dashboard/admin/users', label: 'Manajemen User', icon: UserCog, roles: ['SUPER_ADMIN'] },
  { href: '/dashboard/audit', label: 'Audit Log', icon: ClipboardList, roles: ['SUPER_ADMIN'] },
  { href: '/dashboard/profil', label: 'Profil Saya', icon: UserCircle, roles: ['SUPER_ADMIN', 'KETUA', 'BENDAHARA', 'PENGURUS', 'VIEWER'] },
  { href: '/dashboard/pengaturan', label: 'Pengaturan', icon: Settings, roles: ['SUPER_ADMIN'] },
]

type SidebarProps = {
  role: string | null
  fullName: string
  mosqueName: string
  entityName: string
  notifications: any[]
  unreadCount: number
}

export default function Sidebar({ role, fullName, mosqueName, entityName, notifications, unreadCount }: SidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const menus = allMenus.filter(m => role && m.roles.includes(role))

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col items-center gap-2">
          <Image src="/logo-masjid.png" alt="Logo Masjid" width={80} height={80} className="object-contain" />
          <div className="text-center">
            <h1 className="font-bold text-gray-900 text-sm">Masjid Al-Salam</h1>
            <p className="text-xs text-gray-500">Kintamani Duta Bintaro</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {menus.map((menu) => {
          const isActive = pathname === menu.href || (menu.href !== '/dashboard' && pathname.startsWith(menu.href))
          const Icon = menu.icon
          return (
            <Link key={menu.href} href={menu.href} onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
              )}>
              <Icon className={cn('w-4.5 h-4.5 flex-shrink-0', isActive ? 'text-white' : 'text-emerald-600')} size={18} />
              {menu.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center">Masjid Al-Salam © 2026</p>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-100 flex-col min-h-screen shadow-sm">
        <SidebarContent />
      </aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <Image src="/logo-masjid.png" alt="Logo Masjid" width={32} height={32} className="object-contain" />
          <div>
            <span className="font-bold text-gray-900 text-sm">Masjid Al-Salam</span>
            <p className="text-xs text-gray-500">{entityName || mosqueName}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <NotificationBell notifications={notifications} unreadCount={unreadCount} />
          <button onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl hover:bg-emerald-50 text-emerald-600 transition-colors">
            {mobileOpen
              ? <X size={20} />
              : <Menu size={20} />
            }
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile Drawer */}
      <aside className={cn(
        'md:hidden fixed top-0 left-0 z-50 h-full w-64 bg-white flex flex-col transform transition-transform duration-300 shadow-xl',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* User info di drawer */}
        <div className="p-4 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg">
              {fullName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{fullName}</p>
              <p className="text-xs opacity-80 truncate">{mosqueName}</p>
              <p className="text-xs opacity-70 truncate">{entityName}</p>
            </div>
          </div>
          <form action={logout} className="mt-3">
            <button type="submit"
              className="flex items-center gap-2 text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg transition-colors w-full">
              <LogOut size={14} />
              Keluar
            </button>
          </form>
        </div>
        <SidebarContent />
      </aside>
    </>
  )
}
