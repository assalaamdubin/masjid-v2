'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const allMenus = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊', roles: ['SUPER_ADMIN', 'KETUA', 'BENDAHARA_DKM', 'BENDAHARA_YAYASAN', 'VIEWER'] },
  { href: '/dashboard/transaksi', label: 'Transaksi', icon: '💰', roles: ['SUPER_ADMIN', 'KETUA', 'BENDAHARA_DKM', 'BENDAHARA_YAYASAN'] },
  { href: '/dashboard/approval', label: 'Approval', icon: '✅', roles: ['SUPER_ADMIN', 'KETUA'] },
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
        <div className="flex flex-col items-center gap-2">
          <Image
            src="/logo-masjid.png"
            alt="Logo Masjid"
            width={80}
            height={80}
            className="object-contain"
          />
          <div className="text-center">
            <h1 className="font-bold text-gray-900 text-sm">Masjid Al-Salam</h1>
            <p className="text-xs text-gray-500">Kintamani Duta Bintaro</p>
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
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col min-h-screen">
        <SidebarContent />
      </aside>

      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image src="/logo-masjid.png" alt="Logo Masjid" width={32} height={32} className="object-contain" />
          <span className="font-bold text-gray-900 text-sm">Masjid Al-Salam</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg hover:bg-gray-100">
          <span className="text-xl">{mobileOpen ? '✕' : '☰'}</span>
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-black/40" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={cn(
        'md:hidden fixed top-0 left-0 z-40 h-full w-64 bg-white flex flex-col transform transition-transform duration-300',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <SidebarContent />
      </aside>
    </>
  )
}
