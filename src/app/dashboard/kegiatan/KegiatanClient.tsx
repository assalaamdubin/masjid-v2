'use client'

import { useState } from 'react'
import { createKegiatan, updateKegiatan, deleteKegiatan, addPanitia, removePanitia } from './actions'
import { createTransaksi } from '../transaksi/actions'

type Person = { id: string; fullName: string }
type Entity = { id: string; name: string; type: string }
type Panitia = { id: string; jabatan: string; person: Person }
type Budget = { id: string; budgetAmount: any; description: string | null; category: { name: string; type: string } }
type Transaction = { id: string; amount: any; type: string; description: string | null; category: { name: string } }
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
  kategori,
  currentPersonId,
  isAdmin,
}: {
  initialData: Kegiatan[]
  entities: Entity[]
  persons: Person[]
  kategori: any[]
  currentPersonId: string
  isAdmin: boolean
}) {
  const [showForm, setShowForm] = useState(false)
  const [editingKegiatan, setEditingKegiatan] = useState<Kegiatan | null>(null)
  const [selectedKegiatanId, setSelectedKegiatanId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'panitia' | 'transaksi' | 'laporan'>('panitia')
  const [selectedEntityId, setSelectedEntityId] = useState(entities[0]?.id ?? '')
  const [addingPanitia, setAddingPanitia] = useState(false)
  const [panitiaPersonId, setPanitiaPersonId] = useState('')
  const [panitiaJabatan, setPanitiaJabatan] = useState('')
  const [showTrxForm, setShowTrxForm] = useState(false)
  const [trxType, setTrxType] = useState('INCOME')
  const [filterStatus, setFilterStatus] = useState('all')

  const filtered = initialData.filter(k =>
    k.isActive && (filterStatus === 'all' ? true : k.status === filterStatus)
  )

  const selectedKegiatan = initialData.find(k => k.id === selectedKegiatanId) ?? null

  function openDetail(kegiatan: Kegiatan) {
    setSelectedKegiatanId(kegiatan.id)
    setActiveTab('panitia')
  }

  function openEdit(kegiatan: Kegiatan) {
    setEditingKegiatan(kegiatan)
    setShowForm(true)
    setSelectedKegiatanId(null)
  }

  // Laporan
  const totalPemasukan = selectedKegiatan?.transactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0) ?? 0
  const totalPengeluaran = selectedKegiatan?.transactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0) ?? 0
  const totalBudget = selectedKegiatan?.budgets.reduce((s, b) => s + Number(b.budgetAmount), 0) ?? 0
  const kategoriKegiatan = kategori.filter(k => k.entity.id === (selectedKegiatan?.entity.id ?? selectedEntityId))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Manajemen Kegiatan</h1>
          <p className="text-sm text-gray-500 mt-0.5">Kelola kegiatan, panitia, dan anggaran</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingKegiatan(null); setSelectedKegiatanId(null) }}
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

      {/* Detail Panel */}
      {selectedKegiatan && (
        <div className="bg-white rounded-2xl border border-emerald-200 overflow-hidden">
          {/* Detail Header */}
          <div className="p-4 bg-emerald-50 border-b border-emerald-100 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusConfig[selectedKegiatan.status].color}`}>
                  {statusConfig[selectedKegiatan.status].icon} {statusConfig[selectedKegiatan.status].label}
                </span>
                <span className="text-xs bg-white text-gray-600 px-2 py-0.5 rounded-full border">{selectedKegiatan.entity.name}</span>
              </div>
              <h3 className="text-base font-bold text-gray-900">{selectedKegiatan.name}</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                📅 {formatDate(selectedKegiatan.startDate)}
                {selectedKegiatan.endDate ? ` — ${formatDate(selectedKegiatan.endDate)}` : ''}
                {selectedKegiatan.location ? ` • 📍 ${selectedKegiatan.location}` : ''}
              </p>
            </div>
            <button onClick={() => setSelectedKegiatanId(null)}
              className="text-gray-400 hover:text-gray-600 text-xl font-bold flex-shrink-0">✕</button>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-0 border-b border-gray-100">
            <div className="p-4 text-center border-r border-gray-100">
              <p className="text-xs text-blue-600 font-medium">Budget</p>
              <p className="text-sm font-bold text-blue-700 truncate">{formatRupiah(totalBudget)}</p>
            </div>
            <div className="p-4 text-center border-r border-gray-100">
              <p className="text-xs text-emerald-600 font-medium">Pemasukan</p>
              <p className="text-sm font-bold text-emerald-700 truncate">{formatRupiah(totalPemasukan)}</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-xs text-red-600 font-medium">Pengeluaran</p>
              <p className="text-sm font-bold text-red-700 truncate">{formatRupiah(totalPengeluaran)}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            {(['panitia', 'transaksi', 'laporan'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'text-emerald-600 border-b-2 border-emerald-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}>
                {tab === 'panitia' ? '👥 Panitia' : tab === 'transaksi' ? '💰 Transaksi' : '📊 Laporan'}
              </button>
            ))}
          </div>

          {/* Tab: Panitia */}
          {activeTab === 'panitia' && (
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-700">Daftar Panitia ({selectedKegiatan.panitia.length})</p>
                <button onClick={() => setAddingPanitia(!addingPanitia)}
                  className="text-xs text-emerald-600 px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-50">
                  + Tambah Panitia
                </button>
              </div>

              {addingPanitia && (
                <div className="bg-emerald-50 rounded-xl p-4 space-y-3 border border-emerald-200">
                  <select value={panitiaPersonId} onChange={e => setPanitiaPersonId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <option value="">Pilih person...</option>
                    {persons.filter(p => !selectedKegiatan.panitia.find(kp => kp.person.id === p.id)).map(p => (
                      <option key={p.id} value={p.id}>{p.fullName}</option>
                    ))}
                  </select>
                  <input value={panitiaJabatan} onChange={e => setPanitiaJabatan(e.target.value)}
                    placeholder="Jabatan (contoh: Ketua Panitia)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  <div className="flex gap-2">
                    <button onClick={async () => {
                      if (!panitiaPersonId || !panitiaJabatan) return
                      await addPanitia(selectedKegiatan.id, panitiaPersonId, panitiaJabatan)
                      setAddingPanitia(false)
                      setPanitiaPersonId('')
                      setPanitiaJabatan('')
                    }} className="flex-1 bg-emerald-600 text-white text-sm py-2 rounded-lg">
                      Simpan
                    </button>
                    <button onClick={() => setAddingPanitia(false)}
                      className="flex-1 text-gray-500 text-sm py-2 rounded-lg border border-gray-300">
                      Batal
                    </button>
                  </div>
                </div>
              )}

              {selectedKegiatan.panitia.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <span className="text-3xl block mb-2">👥</span>
                  <p className="text-sm">Belum ada panitia</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedKegiatan.panitia.map(p => (
                    <div key={p.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center text-sm font-bold text-emerald-700">
                          {p.person.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{p.person.fullName}</p>
                          <p className="text-xs text-gray-500">{p.jabatan}</p>
                        </div>
                      </div>
                      <form action={removePanitia.bind(null, p.id)}>
                        <button type="submit" className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded border border-red-200 hover:bg-red-50">
                          Hapus
                        </button>
                      </form>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: Transaksi */}
          {activeTab === 'transaksi' && (
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-700">Transaksi Kegiatan ({selectedKegiatan.transactions.length})</p>
                <button onClick={() => setShowTrxForm(!showTrxForm)}
                  className="text-xs text-emerald-600 px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-50">
                  + Tambah Transaksi
                </button>
              </div>

              {showTrxForm && (
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 space-y-3">
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setTrxType('INCOME')}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium ${trxType === 'INCOME' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 border'}`}>
                      📈 Pemasukan
                    </button>
                    <button type="button" onClick={() => setTrxType('EXPENSE')}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium ${trxType === 'EXPENSE' ? 'bg-red-500 text-white' : 'bg-white text-gray-600 border'}`}>
                      📉 Pengeluaran
                    </button>
                  </div>
                  <form action={async (formData) => {
                    formData.set('type', trxType)
                    formData.set('attachmentUrl', '')
                    formData.set('kegiatanId', selectedKegiatan.id)
                    await createTransaksi(formData, selectedKegiatan.entity.id, currentPersonId)
                    setShowTrxForm(false)
                  }} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Tanggal</label>
                        <input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Nominal (Rp)</label>
                        <input name="amount" type="number" required min="0" placeholder="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Kategori</label>
                      <select name="categoryId" required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                        <option value="">Pilih kategori...</option>
                        {kategoriKegiatan.filter(k => k.type === trxType).map(k => (
                          <option key={k.id} value={k.id}>{k.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Keterangan</label>
                      <input name="description" placeholder="Opsional"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>
                    <input name="paymentMethod" type="hidden" value="TUNAI" />
                    <div className="flex gap-2">
                      <button type="submit"
                        className={`flex-1 text-white text-sm py-2 rounded-lg ${trxType === 'EXPENSE' ? 'bg-red-500' : 'bg-emerald-600'}`}>
                        Simpan
                      </button>
                      <button type="button" onClick={() => setShowTrxForm(false)}
                        className="flex-1 text-gray-500 text-sm py-2 rounded-lg border border-gray-300">
                        Batal
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {selectedKegiatan.transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <span className="text-3xl block mb-2">💰</span>
                  <p className="text-sm">Belum ada transaksi</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedKegiatan.transactions.map(t => (
                    <div key={t.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                      <div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          t.type === 'INCOME' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {t.category.name}
                        </span>
                        {t.description && <p className="text-xs text-gray-500 mt-0.5">{t.description}</p>}
                      </div>
                      <span className={`text-sm font-bold ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {t.type === 'INCOME' ? '+' : '-'}{formatRupiah(t.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: Laporan */}
          {activeTab === 'laporan' && (
            <div className="p-4 space-y-4">
              <p className="text-sm font-semibold text-gray-700">📊 Laporan Kegiatan: {selectedKegiatan.name}</p>

              {/* Summary */}
              <div className="grid grid-cols-1 gap-3">
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-emerald-700 font-medium">Total Pemasukan</p>
                    <p className="text-lg font-bold text-emerald-700">{formatRupiah(totalPemasukan)}</p>
                  </div>
                </div>
                <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-red-700 font-medium">Total Pengeluaran</p>
                    <p className="text-lg font-bold text-red-700">{formatRupiah(totalPengeluaran)}</p>
                  </div>
                </div>
                <div className={`rounded-xl p-4 border ${totalPemasukan - totalPengeluaran >= 0 ? 'bg-blue-50 border-blue-100' : 'bg-orange-50 border-orange-100'}`}>
                  <div className="flex justify-between items-center">
                    <p className={`text-sm font-medium ${totalPemasukan - totalPengeluaran >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>Saldo Kegiatan</p>
                    <p className={`text-lg font-bold ${totalPemasukan - totalPengeluaran >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                      {formatRupiah(totalPemasukan - totalPengeluaran)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rekap per kategori */}
              {selectedKegiatan.transactions.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Rekap per Kategori</p>
                  <div className="space-y-2">
                    {Object.entries(
                      selectedKegiatan.transactions.reduce((acc, t) => {
                        const key = t.category.name
                        if (!acc[key]) acc[key] = { income: 0, expense: 0, type: t.type }
                        if (t.type === 'INCOME') acc[key].income += Number(t.amount)
                        else acc[key].expense += Number(t.amount)
                        return acc
                      }, {} as Record<string, { income: number; expense: number; type: string }>)
                    ).map(([name, val]) => (
                      <div key={name} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                        <p className="text-sm text-gray-700">{name}</p>
                        <div className="text-right">
                          {val.income > 0 && <p className="text-xs font-semibold text-emerald-600">+{formatRupiah(val.income)}</p>}
                          {val.expense > 0 && <p className="text-xs font-semibold text-red-600">-{formatRupiah(val.expense)}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* List Kegiatan */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 text-center py-12 text-gray-400">
          <span className="text-4xl block mb-3">🎪</span>
          <p className="text-sm">Belum ada kegiatan</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(k => {
            const status = statusConfig[k.status]
            const tPemasukan = k.transactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0)
            const tPengeluaran = k.transactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0)
            const tBudget = k.budgets.reduce((s, b) => s + Number(b.budgetAmount), 0)
            const isSelected = selectedKegiatanId === k.id

            return (
              <div key={k.id} className={`bg-white rounded-2xl border overflow-hidden transition-all ${
                isSelected ? 'border-emerald-300 shadow-md' : 'border-gray-200'
              }`}>
                <div className="p-4">
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
                        <span>💰 {k.transactions.length} transaksi</span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => openEdit(k)}
                        className="text-xs text-blue-500 px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-50">
                        ✏️ Edit
                      </button>
                      <button onClick={() => openDetail(k)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                        }`}>
                        {isSelected ? '🔼 Tutup' : '🔽 Detail'}
                      </button>
                    </div>
                  </div>

                  {/* Summary mini */}
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    <div className="bg-blue-50 rounded-lg p-2 text-center">
                      <p className="text-xs text-blue-600">Budget</p>
                      <p className="text-xs font-bold text-blue-700 truncate">{formatRupiah(tBudget)}</p>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-2 text-center">
                      <p className="text-xs text-emerald-600">Masuk</p>
                      <p className="text-xs font-bold text-emerald-700 truncate">{formatRupiah(tPemasukan)}</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-2 text-center">
                      <p className="text-xs text-red-600">Keluar</p>
                      <p className="text-xs font-bold text-red-700 truncate">{formatRupiah(tPengeluaran)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
