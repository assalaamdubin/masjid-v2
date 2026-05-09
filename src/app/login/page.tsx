import { login } from './actions'

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">🕌</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Masjid App</h1>
          <p className="text-gray-500 text-sm mt-1">Sistem Keuangan Masjid Digital</p>
        </div>

        {/* Error Message */}
        {searchParams.then(p => p.error) && (
          <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-6">
            ⚠️ Email atau password salah
          </div>
        )}

        {/* Form */}
        <form action={login} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              placeholder="bendahara@masjid.com"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Password
            </label>
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

        <p className="text-center text-xs text-gray-400 mt-8">
          Aplikasi Bendahara Masjid © 2025
        </p>
      </div>
    </div>
  )
}
