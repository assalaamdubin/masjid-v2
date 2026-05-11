'use client'

import { useState } from 'react'
import { createKategori, updateKategori, toggleKategori } from './actions'

type Kategori = {
  id: string
  name: string
  type: string
  isActive: boolean
}

export default function KategoriClient({
  initialData,
  entityId,
}: {
  initialData: Kategori[]
  entityId: string
}) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [filter, setFilter] = useState('all')
  const [showInactive, setShowInactive] = useState(false)
  const [confirmToggle, setConfirmToggle] = useState<string | null>(null)

  const filtered = initialData.filter(k => {
    const matchActive = showInactive ? true : k.isActive
    const matchType = filter === 'all' ? true : k.type === filter
    return matchActive && matchType
  })

  const pemasukan = initialData.filter(k => k.type === 'INCOME' && k.isActive)
  const pengeluaran = initialData.filter(k => k.type === 'EXPENSE' && k.isActive)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Master Kategori</h1>
          <p className="text-sm text-gray-500 mt-0.5">Kelola kategori pemasukan dan pengeluaran</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
          + Tambah Kategori
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Tambah Kategori Baru</h3>
          <form action={async (formData) => {
            await createKategori(formData, entityId)
            setShowForm(false)
          }} className="space-y-3">
            <input name="name" placeholder="Nama kategori..." required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            <select name="type" required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="INCOME">Pemasukan</option>
              <option value="EXPENSE">Pengeluaran</option>
            </select>
            <div className="flex gap-3">
              <button type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
                Simpan
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="flex-1 text-gray-500 text-sm px-4 py-2 rounded-lg border border-gray-300">
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {editingId && (
        <div className="bg-white rounded-2xl border border-emerald-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">✏️ Edit Kategori</h3>
          <form action={async (formData) => {
            await updateKategori(editingId, formData)
            setEditingId(null)
          }} className="space-y-3">
            <input name="name" value={editName} onChange={e => setEditName(e.target.value)} required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            <div className="flex gap-3">
              <button type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
                Simpan
              </button>
              <button type="button" onClick={() => setEditingId(null)}
                className="flex-1 text-gray-500 text-sm px-4 py-2 rounded-lg border border-gray-300">
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
          <p className="text-sm text-emerald-700 font-medium">Pemasukan</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{pemasukan.length}</p>
        </div>
        <div className="bg-red-50 rounded-2xl p-4 border border-red-100">
          <p className="text-sm text-red-700 font-medium">Pengeluaran</p>
          <p className="text-2xl font-bold text-red-700 mt-1">{pengeluaran.length}</p>
        </div>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2">
          {['all', 'INCOME', 'EXPENSE'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === f ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
              }`}>
              {f === 'all' ? 'Semua' : f === 'INCOME' ? '📈' : '📉'}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input type="checkbox" checked={showInactive} onChange={e => setShowInactive(e.target.checked)}
            className="w-4 h-4 text-emerald-600 rounded border-gray-300" />
          Tampilkan nonaktif
        </label>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <span className="text-4xl block mb-3">🏷️</span>
            <p className="text-sm">Belum ada kategori</p>
          </div>
        ) : (
          <>
            {/* Mobile Card Layout */}
            <div className="md:hidden divide-y divide-gray-100">
              {filtered.map(k => (
                <div key={k.id} className={`p-4 space-y-2 ${!k.isActive ? 'opacity-50' : ''}`}>
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{k.name}</p>
                      <div className="flex gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          k.type === 'INCOME' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {k.type === 'INCOME' ? '📈 Pemasukan' : '📉 Pengeluaran'}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          k.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {k.isActive ? '✅ Aktif' : '⛔ Nonaktif'}
                        </span>
                      </div>
                    </div>
                  </div>
                  {confirmToggle === k.id && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-orange-600">{k.isActive ? 'Yakin nonaktifkan?' : 'Yakin aktifkan?'}</span>
                      <form action={toggleKategori.bind(null, k.id, !k.isActive)}>
                        <button type="submit" className="text-xs bg-orange-500 text-white px-2 py-1 rounded">Ya</button>
                      </form>
                      <button onClick={() => setConfirmToggle(null)} className="text-xs text-gray-500 px-2 py-1 rounded border border-gray-200">Batal</button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    {k.isActive && (
                      <button onClick={() => { setEditingId(k.id); setEditName(k.name) }}
                        className="text-xs text-blue-500 px-3 py-1.5 rounded-lg border border-blue-200">
                        ✏️ Edit
                      </button>
                    )}
                    <button onClick={() => setConfirmToggle(confirmToggle === k.id ? null : k.id)}
                      className={`text-xs px-3 py-1.5 rounded-lg border ${
                        k.isActive ? 'text-orange-500 border-orange-200' : 'text-emerald-600 border-emerald-200'
                      }`}>
                      {k.isActive ? '🔒 Nonaktifkan' : '🔓 Aktifkan'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden md:block">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Nama</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Tipe</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Status</th>
                    <th className="text-right text-xs font-medium text-gray-500 px-6 py-3">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(k => (
                    <tr key={k.id} className={`hover:bg-gray-50 ${!k.isActive ? 'opacity-50' : ''}`}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{k.name}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          k.type === 'INCOME' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {k.type === 'INCOME' ? '📈 Pemasukan' : '📉 Pengeluaran'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          k.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {k.isActive ? '✅ Aktif' : '⛔ Nonaktif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {confirmToggle === k.id && (
                          <div className="flex items-center justify-end gap-2 mb-2">
                            <span className="text-xs text-orange-600">{k.isActive ? 'Yakin nonaktifkan?' : 'Yakin aktifkan?'}</span>
                            <form action={toggleKategori.bind(null, k.id, !k.isActive)}>
                              <button type="submit" className="text-xs bg-orange-500 text-white px-2 py-1 rounded">Ya</button>
                            </form>
                            <button onClick={() => setConfirmToggle(null)} className="text-xs text-gray-500 px-2 py-1 rounded border border-gray-200">Batal</button>
                          </div>
                        )}
                        <div className="flex items-center justify-end gap-2">
                          {k.isActive && (
                            <button onClick={() => { setEditingId(k.id); setEditName(k.name) }}
                              className="text-xs text-blue-500 hover:text-blue-700 px-2 py-1 rounded border border-blue-200 hover:bg-blue-50">
                              ✏️ Edit
                            </button>
                          )}
                          <button onClick={() => setConfirmToggle(confirmToggle === k.id ? null : k.id)}
                            className={`text-xs px-2 py-1 rounded border transition-colors ${
                              k.isActive ? 'text-orange-500 border-orange-200 hover:bg-orange-50' : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                            }`}>
                            {k.isActive ? '🔒 Nonaktifkan' : '🔓 Aktifkan'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
