import { login } from './actions'
import Image from 'next/image'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image
              src="/logo-masjid.png"
              alt="Logo Masjid Al-Salam"
              width={100}
              height={100}
              className="object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Masjid Al-Salam</h1>
          <p className="text-emerald-700 text-sm font-medium">Kintamani Duta Bintaro</p>
          <p className="text-gray-400 text-xs mt-1">Sistem Keuangan Digital</p>
        </div>

        {params.error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-6">
            ⚠️ {params.error}
          </div>
        )}

        <form action={login} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              name="email"
              type="email"
              required
              placeholder="bendahara@masjid.com"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <input
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
          >
            Masuk
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Belum punya akun?{' '}
          <a href="/register" className="text-emerald-600 hover:text-emerald-700 font-medium">
            Daftar di sini
          </a>
        </p>

        <div className="mt-4 pt-4 border-t border-gray-100 text-center">
          <a href="/publik" className="text-xs text-gray-400 hover:text-emerald-600 transition-colors">
            📊 Lihat Laporan Keuangan Publik
          </a>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          © 2025 Masjid Al-Salam Kintamani Duta Bintaro
        </p>
      </div>
    </div>
  )
}
