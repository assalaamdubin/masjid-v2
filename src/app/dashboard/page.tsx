import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/login/actions'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow p-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">🕌 Dashboard Masjid</h1>
            <p className="text-gray-500 text-sm mt-1">Selamat datang, {user.email}</p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Keluar
            </button>
          </form>
        </div>

        <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
          <p className="text-emerald-700 font-medium">✅ Auth berhasil! Dashboard sedang dibangun...</p>
        </div>
      </div>
    </div>
  )
}
