'use client'

import { useState } from 'react'
import { register } from './actions'

type Entity = { id: string; name: string; type: string }
type Mosque = { id: string; name: string; city: string | null; entities: Entity[] }

export default function RegisterForm({ mosques }: { mosques: Mosque[] }) {
  const [selectedMosqueId, setSelectedMosqueId] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const selectedMosque = mosques.find(m => m.id === selectedMosqueId)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError('')
    try {
      await register(formData)
      setSuccess(true)
    } catch (e: any) {
      setError(e.message || 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">✅</span>
        </div>
        <h3 className="font-bold text-gray-900 text-lg mb-2">Pendaftaran Berhasil!</h3>
        <p className="text-gray-500 text-sm">
          Akun Anda sedang menunggu persetujuan Admin. Role akan ditentukan oleh Admin setelah disetujui.
        </p>
        <a href="/login"
          className="mt-6 inline-block bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors">
          Kembali ke Login
        </a>
      </div>
    )
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3">⚠️ {error}</div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Lengkap</label>
        <input name="fullName" type="text" required placeholder="Ahmad Fauzi"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
        <input name="email" type="email" required placeholder="ahmad@email.com"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
        <input name="password" type="password" required placeholder="Min. 8 karakter" minLength={8}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">No. HP</label>
        <input name="phoneNumber" type="tel" placeholder="08123456789"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Masjid</label>
        <select name="mosqueId" required value={selectedMosqueId}
          onChange={(e) => setSelectedMosqueId(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
          <option value="">Pilih masjid...</option>
          {mosques.map(m => (
            <option key={m.id} value={m.id}>{m.name}{m.city ? ` — ${m.city}` : ''}</option>
          ))}
        </select>
      </div>

      {selectedMosque && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Entity / Divisi</label>
          <select name="entityId" required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="">Pilih entity...</option>
            {selectedMosque.entities.map(e => (
              <option key={e.id} value={e.id}>{e.name} ({e.type})</option>
            ))}
          </select>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-700">
          ℹ️ Role akan ditentukan oleh Admin setelah pendaftaran disetujui.
        </p>
      </div>

      <button type="submit" disabled={loading}
        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm mt-2">
        {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
      </button>
    </form>
  )
}
