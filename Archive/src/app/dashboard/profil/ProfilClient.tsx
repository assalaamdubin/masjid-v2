'use client'

import { useState } from 'react'
import { updatePassword, updateProfil } from './actions'

type Person = {
  id: string
  fullName: string
  email: string | null
  phoneNumber: string | null
  address: string | null
  personType: { name: string } | null
}

export default function ProfilClient({ person }: { person: any }) {
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [profilSuccess, setProfilSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handlePasswordSubmit(formData: FormData) {
    setLoading(true)
    setPasswordError('')
    setPasswordSuccess(false)
    try {
      await updatePassword(formData)
      setPasswordSuccess(true)
    } catch (e: any) {
      setPasswordError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleProfilSubmit(formData: FormData) {
    setLoading(true)
    setProfilSuccess(false)
    try {
      await updateProfil(formData, person.id)
      setProfilSuccess(true)
    } catch (e: any) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Profil Saya</h1>
        <p className="text-sm text-gray-500 mt-0.5">Kelola informasi profil dan password</p>
      </div>

      {/* Info Profil */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-2xl font-bold text-emerald-700">
            {person.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-lg">{person.fullName}</p>
            <p className="text-sm text-gray-500">{person.email}</p>
            {person.personType && (
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full mt-1 inline-block">
                {person.personType.name}
              </span>
            )}
          </div>
        </div>

        {profilSuccess && (
          <div className="bg-emerald-50 text-emerald-700 text-sm rounded-lg p-3 mb-4">
            ✅ Profil berhasil diupdate!
          </div>
        )}

        <form action={handleProfilSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Nama Lengkap</label>
            <input name="fullName" defaultValue={person.fullName} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">No. HP</label>
            <input name="phoneNumber" defaultValue={person.phoneNumber ?? ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Alamat</label>
            <textarea name="address" rows={2} defaultValue={person.address ?? ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
          </div>
          <button type="submit" disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-medium px-6 py-2.5 rounded-lg">
            Simpan Profil
          </button>
        </form>
      </div>

      {/* Ganti Password */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-6">🔐 Ganti Password</h3>

        {passwordError && (
          <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">
            ⚠️ {passwordError}
          </div>
        )}

        {passwordSuccess && (
          <div className="bg-emerald-50 text-emerald-700 text-sm rounded-lg p-3 mb-4">
            ✅ Password berhasil diubah!
          </div>
        )}

        <form action={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Password Lama</label>
            <input name="currentPassword" type="password" required placeholder="••••••••"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Password Baru</label>
            <input name="newPassword" type="password" required placeholder="Min. 8 karakter" minLength={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Konfirmasi Password Baru</label>
            <input name="confirmPassword" type="password" required placeholder="Ulangi password baru"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <button type="submit" disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-6 py-2.5 rounded-lg">
            {loading ? 'Menyimpan...' : 'Ganti Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
