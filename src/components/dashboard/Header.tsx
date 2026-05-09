import { logout } from '@/app/login/actions'
import { User } from '@supabase/supabase-js'

export default function Header({ user }: { user: User }) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div>
        <h2 className="text-sm font-medium text-gray-900">
          Selamat datang kembali! 👋
        </h2>
        <p className="text-xs text-gray-500">{user.email}</p>
      </div>

      <form action={logout}>
        <button
          type="submit"
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
        >
          <span>🚪</span>
          Keluar
        </button>
      </form>
    </header>
  )
}
