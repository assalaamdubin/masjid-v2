import { prisma } from '@/lib/prisma'
import RegisterForm from './RegisterForm'
import Image from 'next/image'

export default async function RegisterPage() {
  const mosques = await prisma.mosque.findMany({
    where: { isActive: true },
    include: { entities: { where: { isActive: true } } }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image
              src="/logo-masjid.png"
              alt="Logo Masjid Al-Salam"
              width={80}
              height={80}
              className="object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Daftar Akun</h1>
          <p className="text-emerald-700 text-sm font-medium">Masjid Al-Salam Kintamani Duta Bintaro</p>
          <p className="text-gray-400 text-xs mt-1">Isi data diri untuk mendaftar sebagai pengurus</p>
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
