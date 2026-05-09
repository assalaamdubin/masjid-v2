'use client'

import { useState } from 'react'
import { updateMosque } from './actions'

type Mosque = {
  id: string
  name: string
  address: string | null
  city: string | null
  province: string | null
  phone: string | null
  email: string | null
}

export default function PengaturanClient({ mosque }: { mosque: Mosque | null }) {
  const [saved, setSaved] = useState(false)

  if (!mosque) return (
    <div className="text-center py-12 text-gray-400">
      <span className="text-4xl block mb-3">⚠️</span>
      <p className="text-sm">Data masjid tidak ditemukan</p>
    </div>
  )

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Pengaturan</h1>
        <p className="text-sm text-gray-500 mt-0.5">Kelola profil masjid</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-6">📋 Profil Masjid</h3>

        {saved && (
          <div className="bg-emerald-50 text-emerald-700 text-sm rounded-lg p-3 mb-6">
            ✅ Perubahan berhasil disimpan!
          </div>
        )}

        <form action={async (formData) => {
          await updateMosque(formData, mosque.id)
          setSaved(true)
          setTimeout(() => setSaved(false), 3000)
        }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Masjid</label>
            <input
              name="name"
              defaultValue={mosque.name}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Alamat</label>
            <textarea
              name="address"
              defaultValue={mosque.address ?? ''}
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Kota</label>
              <input
                name="city"
                defaultValue={mosque.city ?? ''}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Provinsi</label>
              <input
                name="province"
                defaultValue={mosque.province ?? ''}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">No. Telepon</label>
              <input
                name="phone"
                defaultValue={mosque.phone ?? ''}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                name="email"
                type="email"
                defaultValue={mosque.email ?? ''}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors"
          >
            Simpan Perubahan
          </button>
        </form>
      </div>
    </div>
  )
}
