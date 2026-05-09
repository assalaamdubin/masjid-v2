import { prisma } from '@/lib/prisma'
import RegisterForm from './RegisterForm'

export default async function RegisterPage() {
  const mosques = await prisma.mosque.findMany({
    where: { isActive: true },
    include: { entities: { where: { isActive: true } } }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">🕌</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Daftar Akun</h1>
          <p className="text-gray-500 text-sm mt-1">Isi data diri untuk mendaftar sebagai pengurus</p>
        </div>

        <RegisterForm mosques={mosques} />

        <p className="text-center text-sm text-gray-500 mt-6">
          Sudah punya akun?{' '}
          <a href="/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
            Masuk di sini
          </a>
        </p>
      </div>
    </div>
  )
}
