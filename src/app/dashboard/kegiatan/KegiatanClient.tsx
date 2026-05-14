'use client'

import { useState } from 'react'
import { createKegiatan, updateKegiatan, deleteKegiatan, addPanitia, removePanitia } from './actions'

type Person = { id: string; fullName: string }
type Entity = { id: string; name: string; type: string }
type Panitia = { id: string; jabatan: string; person: Person }
type Budget = { id: string; budgetAmount: any; description: string | null; category: { name: string; type: string } }
type Transaction = { id: string; amount: any; type: string; category: { name: string } }
type Kegiatan = {
  id: string
  name: string
  description: string | null
  startDate: Date
  endDate: Date | null
  location: string | null
  status: string
  isActive: boolean
  entity: Entity
  createdBy: Person
  panitia: Panitia[]
  transactions: Transaction[]
  budgets: Budget[]
}

const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
  PLANNED: { label: 'Direncanakan', color: 'bg-blue-100 text-blue-700', icon: '📅' },
  ONGOING: { label: 'Berlangsung', color: 'bg-emerald-100 text-emerald-700', icon: '🟢' },
  COMPLETED: { label: 'Selesai', color: 'bg-gray-100 text-gray-600', icon: '✅' },
  CANCELLED: { label: 'Dibatalkan', color: 'bg-red-100 text-red-700', icon: '❌' },
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(date))
}

function formatRupiah(amount: any) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(amount))
}

export default function KegiatanClient({
  initialData,
  entities,
  persons,
  currentPersonId,
  isAdmin,
}: {
  initialData: Kegiatan[]
  entities: Entity[]
  persons: Person[]
  currentPersonId: string
  isAdmin: boolean
}) {
  const [showForm, setShowForm] = useState(false)
  const [editingKegiatan, setEditingKegiatan] = useState<Kegiatan | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [selectedEntityId, setSelectedEntityId] = useState(entities[0]?.id ?? '')
  const [addingPanitia, setAddingPanitia] = useState<string | null>(null)
  const [panitiaPersonId, setPanitiaPersonId] = useState('')
  const [panitiaJabatan, setPanitiaJabatan] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const filtered = initialData.filter(k =>
    k.isActive && (filterStatus === 'all' ? true : k.status === filterStatus)
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Manajemen Kegiatan</h1>
          <p className="text-sm text-gray-500 mt-0.5">Kelola kegiatan, panitia, dan anggaran</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingKegiatan(null) }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
          + Tambah Kegiatan
        </button>
      </div>

      {/* Filter Status */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'PLANNED', 'ONGOING', 'COMPLETED', 'CANCELLED'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === s ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
            }`}>
            {s === 'all' ? 'Semua' : statusConfig[s]?.label}
          </button>
        ))}
      </div>

      {/* Form Tambah/Edit */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-5">
            {editingKegiatan ? '✏️ Edit Kegiatan' : '+ Tambah Kegiatan Baru'}
          </h3>
          <form action={async (formData) => {
            if (editingKegiatan) {
              await updateKegiatan(editingKegiatan.id, formData)
            } else {
              await createKegiatan(formData, selectedEntityId, currentPersonId)
            }
            setShowForm(false)
            setEditingKegiatan(null)
          }} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Nama Kegiatan *</label>
                <input name="name" required defaultValue={editingKegiatan?.name}
                  placeholder="Contoh: Bazar Ramadan 2026"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Lokasi</label>
                <input name="location" defaultValue={editingKegiatan?.location ?? ''}
                  placeholder="Contoh: Halaman Masjid"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Tanggal Mulai *</label>
                <input name="startDate" type="date" required
                  defaultValue={editingKegiatan ? new Date(editingKegiatan.startDate).toISOString().split('T')[0] : ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Tanggal Selesai</label>
                <input name="endDate" type="date"
                  defaultValue={editingKegiatan?.endDate ? new Date(editingKegiatan.endDate).toISOString().split('T')[0] : ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>
            {editingKegiatan && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Status</label>
                <select name="status" defaultValue={editingKegiatan.status}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  {Object.entries(statusConfig).map(([val, cfg]) => (
                    <option key={val} value={val}>{cfg.icon} {cfg.label}</option>
                  ))}
                </select>
              </div>
            )}
            {!editingKegiatan && entities.length > 1 && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Entity</label>
                <select value={selectedEntityId} onChange={e => setSelectedEntityId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  {entities.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Deskripsi</label>
              <textarea name="description" rows={3} defaultValue={editingKegiatan?.description ?? ''}
                placeholder="Deskripsi kegiatan..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2.5 rounded-lg">
                {editingKegiatan ? 'Simpan Perubahan' : 'Buat Kegiatan'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditingKegiatan(null) }}
                className="px-6 text-gray-500 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List Kegiatan */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 text-center py-12 text-gray-400">
          <span className="text-4xl block mb-3">🎪</span>
          <p className="text-sm">Belum ada kegiatan</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(k => {
            const status = statusConfig[k.status]
            const totalPemasukan = k.transactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0)
            const totalPengeluaran = k.transactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0)
            const totalBudget = k.budgets.reduce((s, b) => s + Number(b.budgetAmount), 0)
            const isExpanded = expandedId === k.id

            return (
              <div key={k.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                {/* Header Card */}
                <div className="p-4 md:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}>
                          {status.icon} {status.label}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {k.entity.name}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-gray-900">{k.name}</h3>
                      <div className="flex items-center gap-3 mt-1 flex-wrap text-xs text-gray-500">
                        <span>📅 {formatDate(k.startDate)}{k.endDate ? ` — ${formatDate(k.endDate)}` : ''}</span>
                        {k.location && <span>📍 {k.location}</span>}
                        <span>👥 {k.panitia.length} panitia</span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => { setEditingKegiatan(k); setShowForm(true) }}
                        className="text-xs text-blue-500 px-3 py-1.5 rounded-lg border border-blue-200">
                        ✏️ Edit
                      </button>
                      <button onClick={() => setExpandedId(isExpanded ? null : k.id)}
                        className="text-xs text-emerald-600 px-3 py-1.5 rounded-lg border border-emerald-200">
                        {isExpanded ? '🔼 Tutup' : '🔽 Detail'}
                      </button>
                    </div>
                  </div>

                  {/* Summary keuangan */}
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    <div className="bg-blue-50 rounded-xl p-3">
                      <p className="text-xs text-blue-600 font-medium">Budget</p>
                      <p className="text-sm font-bold text-blue-700 truncate">{formatRupiah(totalBudget)}</p>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-3">
                      <p className="text-xs text-emerald-600 font-medium">Pemasukan</p>
                      <p className="text-sm font-bold text-emerald-700 truncate">{formatRupiah(totalPemasukan)}</p>
                    </div>
                    <div className="bg-red-50 rounded-xl p-3">
                      <p className="text-xs text-red-600 font-medium">Pengeluaran</p>
                      <p className="text-sm font-bold text-red-700 truncate">{formatRupiah(totalPengeluaran)}</p>
                    </div>
                  </div>
                </div>

                {/* Detail Panel */}
                {isExpanded && (
                  <div className="border-t border-gray-100 p-4 md:p-6 space-y-5 bg-gray-50">
                    {/* Deskripsi */}
                    {k.description && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Deskripsi</p>
                        <p className="text-sm text-gray-700">{k.description}</p>
                      </div>
                    )}

                    {/* Panitia */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase">👥 Panitia ({k.panitia.length})</p>
                        <button onClick={() => setAddingPanitia(addingPanitia === k.id ? null : k.id)}
                          className="text-xs text-emerald-600 px-2 py-1 rounded border border-emerald-200">
                          + Tambah
                        </button>
                      </div>

                      {addingPanitia === k.id && (
                        <div className="bg-white rounded-xl p-3 mb-3 space-y-2 border border-emerald-200">
                          <select value={panitiaPersonId} onChange={e => setPanitiaPersonId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                            <option value="">Pilih person...</option>
                            {persons.filter(p => !k.panitia.find(kp => kp.person.id === p.id)).map(p => (
                              <option key={p.id} value={p.id}>{p.fullName}</option>
                            ))}
                          </select>
                          <input value={panitiaJabatan} onChange={e => setPanitiaJabatan(e.target.value)}
                            placeholder="Jabatan (contoh: Ketua Panitia)"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                          <div className="flex gap-2">
                            <button onClick={async () => {
                              if (!panitiaPersonId || !panitiaJabatan) return
                              await addPanitia(k.id, panitiaPersonId, panitiaJabatan)
                              setAddingPanitia(null)
                              setPanitiaPersonId('')
                              setPanitiaJabatan('')
                            }} className="flex-1 bg-emerald-600 text-white text-xs py-1.5 rounded-lg">
                              Simpan
                            </button>
                            <button onClick={() => setAddingPanitia(null)}
                              className="flex-1 text-gray-500 text-xs py-1.5 rounded-lg border border-gray-300">
                              Batal
                            </button>
                          </div>
                        </div>
                      )}

                      {k.panitia.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">Belum ada panitia</p>
                      ) : (
                        <div className="space-y-1">
                          {k.panitia.map(p => (
                            <div key={p.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center text-xs font-bold text-emerald-700">
                                  {p.person.fullName.charAt(0)}
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-gray-900">{p.person.fullName}</p>
                                  <p className="text-xs text-gray-500">{p.jabatan}</p>
                                </div>
                              </div>
                              <form action={removePanitia.bind(null, p.id)}>
                                <button type="submit" className="text-xs text-red-400 hover:text-red-600">✕</button>
                              </form>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Transaksi */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">💰 Transaksi ({k.transactions.length})</p>
                      {k.transactions.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">Belum ada transaksi</p>
                      ) : (
                        <div className="space-y-1">
                          {k.transactions.slice(0, 5).map(t => (
                            <div key={t.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2">
                              <span className="text-xs text-gray-600">{t.category.name}</span>
                              <span className={`text-xs font-semibold ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'}`}>
                                {t.type === 'INCOME' ? '+' : '-'}{formatRupiah(t.amount)}
                              </span>
                            </div>
                          ))}
                          {k.transactions.length > 5 && (
                            <p className="text-xs text-gray-400 text-center pt-1">+{k.transactions.length - 5} transaksi lainnya</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
