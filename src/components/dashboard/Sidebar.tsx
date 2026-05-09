'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const allMenus = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊', roles: ['SUPER_ADMIN', 'KETUA', 'BENDAHARA_DKM', 'BENDAHARA_YAYASAN', 'VIEWER'] },
  { href: '/dashboard/transaksi', label: 'Transaksi', icon: '💰', roles: ['SUPER_ADMIN', 'KETUA', 'BENDAHARA_DKM', 'BENDAHARA_YAYASAN'] },
  { href: '/dashboard/kategori', label: 'Kategori', icon: '🏷️', roles: ['SUPER_ADMIN', 'BENDAHARA_DKM', 'BENDAHARA_YAYASAN'] },
  { href: '/dashboard/laporan', label: 'Laporan', icon: '📋', roles: ['SUPER_ADMIN', 'KETUA', 'BENDAHARA_DKM', 'BENDAHARA_YAYASAN', 'VIEWER'] },
  { href: '/dashboard/admin/users', label: 'Manajemen User', icon: '👥', roles: ['SUPER_ADMIN'] },
  { href: '/dashboard/pengaturan', label: 'Pengaturan', icon: '⚙️', roles: ['SUPER_ADMIN'] },
]

export default function Sidebar({ role }: { role: string | null }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const menus = allMenus.filter(m => role && m.roles.includes(role))

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
            <span className="text-xl">🕌</span>
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-sm">Masjid App</h1>
            <p className="text-xs text-gray-500">Sistem Keuangan</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menus.map((menu) => {
          const isActive = pathname === menu.href || (menu.href !== '/dashboard' && pathname.startsWith(menu.href))
          return (
            <Link
              key={menu.href}
              href={menu.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <span className="text-lg">{menu.icon}</span>
              {menu.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <p className="text-xs text-gray-400 text-center">Aplikasi Bendahara Masjid © 2025</p>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col min-h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
            <span className="text-base">🕌</span>
          </div>
          <span className="font-bold text-gray-900 text-sm">Masjid App</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <span className="text-xl">{mobileOpen ? '✕' : '☰'}</span>
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside className={cn(
        'md:hidden fixed top-0 left-0 z-40 h-full w-64 bg-white flex flex-col transform transition-transform duration-300',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <SidebarContent />
      </aside>
    </>
  )
}
