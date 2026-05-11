'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { createTransaksi, deleteTransaksi, updateTransaksi, updateAttachment } from './actions'

const UploadBukti = dynamic(() => import('@/components/dashboard/UploadBukti'), { ssr: false })

type Kategori = {
  id: string
  name: string
  type: string
  entity: { id: string; name: string }
}

type Entity = { id: string; name: string }

type Transaksi = {
  id: string
  type: string
  date: Date
  amount: any
  description: string | null
  payerName: string | null
  paymentMethod: string | null
  attachmentUrl: string | null
  approvalStatus: string
  category: { id: string; name: string; type: string }
  entity: { name: string }
}

function formatRupiah(amount: any) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(Number(amount))
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(date))
}

function StatusBadge({ status, type }: { status: string; type: string }) {
  if (type === 'INCOME') return null

  const config: Record<string, { label: string; className: string }> = {
    PENDING_KETUA: { label: '⏳ Waiting Approval', className: 'bg-yellow-100 text-yellow-700' },
    APPROVED: { label: '✅ Approved', className: 'bg-emerald-100 text-emerald-700' },
    REJECTED: { label: '❌ Rejected', className: 'bg-red-100 text-red-700' },
    DRAFT: { label: '📝 Draft', className: 'bg-gray-100 text-gray-600' },
  }

  const s = config[status] ?? { label: status, className: 'bg-gray-100 text-gray-600' }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${s.className}`}>
      {s.label}
    </span>
  )
}

function canEdit(t: Transaksi) {
  if (t.type === 'INCOME') return true
  return t.approvalStatus === 'DRAFT' || t.approvalStatus === 'REJECTED'
}

export default function TransaksiClient({
  initialData,
  kategori,
  entityId,
  personId,
  isAdmin,
  entities,
}: {
  initialData: Transaksi[]
  kategori: Kategori[]
  entityId: string
  personId: string
  isAdmin: boolean
  entities: Entity[]
}) {
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [formType, setFormType] = useState('INCOME')
  const [selectedEntityId, setSelectedEntityId] = useState(entityId)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Transaksi | null>(null)
  const [newAttachmentUrl, setNewAttachmentUrl] = useState('')
  const [editAttachmentUrl, setEditAttachmentUrl] = useState('')
  const [viewingImage, setViewingImage] = useState<string | null>(null)

  const filtered = initialData.filter(t => {
    const matchType = filter === 'all' ? true : t.type === filter
    const matchSearch = search === '' ? true :
      t.category.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.description?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (t.payerName?.toLowerCase().includes(search.toLowerCase()) ?? false)
    return matchType && matchSearch
  })

  const totalPemasukan = initialData.filter(t => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0)
  const totalPengeluaran = initialData.filter(t => t.type === 'EXPENSE' && t.approvalStatus === 'APPROVED').reduce((s, t) => s + Number(t.amount), 0)
  const saldo = totalPemasukan - totalPengeluaran
  const kategoriFiltered = kategori.filter(k => k.type === formType && k.entity.id === selectedEntityId)

  function startEdit(t: Transaksi) {
    setEditingId(t.id)
    setEditData(t)
    setEditAttachmentUrl(t.attachmentUrl ?? '')
    setShowForm(false)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditData(null)
    setEditAttachmentUrl('')
  }

  return (
    <div className="space-y-6">
      {/* Image Viewer Modal */}
      {viewingImage && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setViewingImage(null)}>
          <div className="relative max-w-2xl w-full">
            <Image src={viewingImage} alt="Bukti transaksi" width={800} height={600}
              className="object-contain rounded-lg w-full h-auto" unoptimized />
            <button className="absolute top-2 right-2 bg-white text-gray-900 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold"
              onClick={() => setViewingImage(null)}>✕</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Transaksi</h1>
          <p className="text-sm text-gray-500 mt-0.5">Kelola pemasukan dan pengeluaran</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); cancelEdit() }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          + Tambah Transaksi
        </button>
      </div>

      {/* Info approval */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-sm text-yellow-700">
        💡 Pengeluaran otomatis dikirim ke Ketua untuk disetujui. Edit tidak bisa dilakukan saat status <strong>Waiting Approval</strong>.
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-200">
          <p className="text-xs font-medium text-gray-500 mb-1">Total Saldo</p>
          <p className={`text-xl font-bold ${saldo >= 0 ? 'text-gray-900' : 'text-red-600'}`}>{formatRupiah(saldo)}</p>
          <p className="text-xs text-gray-400 mt-1">Hanya pengeluaran approved</p>
        </div>
        <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
          <p className="text-xs font-medium text-emerald-600 mb-1">Total Pemasukan</p>
          <p className="text-xl font-bold text-emerald-700">{formatRupiah(totalPemasukan)}</p>
        </div>
        <div className="bg-red-50 rounded-2xl p-5 border border-red-100">
          <p className="text-xs font-medium text-red-600 mb-1">Total Pengeluaran</p>
          <p className="text-xl font-bold text-red-700">{formatRupiah(totalPengeluaran)}</p>
          <p className="text-xs text-red-400 mt-1">Hanya yang approved</p>
        </div>
      </div>

      {/* Form Tambah */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-5">Tambah Transaksi Baru</h3>
          {formType === 'EXPENSE' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-xs text-yellow-700 mb-4">
              ⚠️ Pengeluaran akan otomatis dikirim ke Ketua untuk approval via WhatsApp
            </div>
          )}
          <form action={async (formData) => {
            formData.set('type', formType)
            formData.set('attachmentUrl', newAttachmentUrl)
            await createTransaksi(formData, selectedEntityId, personId)
            setShowForm(false)
            setNewAttachmentUrl('')
          }} className="space-y-4">

            {isAdmin && entities.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Entity</label>
                <select value={selectedEntityId} onChange={(e) => setSelectedEntityId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  {entities.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
            )}

            <div className="flex gap-3">
              <button type="button" onClick={() => setFormType('INCOME')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${formType === 'INCOME' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                📈 Pemasukan
              </button>
              <button type="button" onClick={() => setFormType('EXPENSE')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${formType === 'EXPENSE' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                📉 Pengeluaran
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Tanggal</label>
                <input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Nominal (Rp)</label>
                <input name="amount" type="number" required min="0" placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Kategori</label>
              <select name="categoryId" required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="">Pilih kategori...</option>
                {kategoriFiltered.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  {formType === 'INCOME' ? 'Nama Pemberi' : 'Nama Penerima'}
                </label>
                <input name="payerName" type="text" placeholder="Opsional"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Metode</label>
                <select name="paymentMethod"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="TUNAI">Tunai</option>
                  <option value="TRANSFER">Transfer Bank</option>
                  <option value="QRIS">QRIS</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Keterangan</label>
              <textarea name="description" rows={2} placeholder="Opsional"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
            </div>

            <UploadBukti fileId={`new-${Date.now()}`} onUpload={(url) => setNewAttachmentUrl(url)} />

            <div className="flex gap-3 pt-2">
              <button type="submit"
                className={`flex-1 text-white text-sm font-medium py-2.5 rounded-lg transition-colors ${
                  formType === 'EXPENSE' ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}>
                {formType === 'EXPENSE' ? '📤 Simpan & Ajukan Approval' : '💾 Simpan Transaksi'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-6 text-gray-500 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Form Edit */}
      {editingId && editData && (
        <div className="bg-white rounded-2xl border border-emerald-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-5">✏️ Edit Transaksi</h3>
          <form action={async (formData) => {
            formData.set('attachmentUrl', editAttachmentUrl)
            await updateTransaksi(editingId, formData)
            cancelEdit()
          }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Tanggal</label>
                <input name="date" type="date" required defaultValue={new Date(editData.date).toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Nominal (Rp)</label>
                <input name="amount" type="number" required min="0" defaultValue={Number(editData.amount)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Kategori</label>
              <select name="categoryId" required defaultValue={editData.category.id}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                {kategori.filter(k => k.type === editData.type).map(k => (
                  <option key={k.id} value={k.id}>{k.name} ({k.entity.name})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Nama Pemberi/Penerima</label>
                <input name="payerName" type="text" defaultValue={editData.payerName ?? ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Metode</label>
                <select name="paymentMethod" defaultValue={editData.paymentMethod ?? 'TUNAI'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="TUNAI">Tunai</option>
                  <option value="TRANSFER">Transfer Bank</option>
                  <option value="QRIS">QRIS</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Keterangan</label>
              <textarea name="description" rows={2} defaultValue={editData.description ?? ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
            </div>

            <UploadBukti fileId={editingId} existingUrl={editData.attachmentUrl} onUpload={(url) => setEditAttachmentUrl(url)} />

            <div className="flex gap-3 pt-2">
              <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2.5 rounded-lg transition-colors">
                Simpan Perubahan
              </button>
              <button type="button" onClick={cancelEdit}
                className="px-6 text-gray-500 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-wrap gap-3 items-center">
        <input type="text" placeholder="🔍 Cari transaksi..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-48 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        <div className="flex gap-2">
          {[
            { value: 'all', label: 'Semua' },
            { value: 'INCOME', label: '📈 Pemasukan' },
            { value: 'EXPENSE', label: '📉 Pengeluaran' },
          ].map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f.value ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* List Transaksi */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <span className="text-4xl block mb-3">💸</span>
            <p className="text-sm">{search ? 'Tidak ada transaksi yang cocok' : 'Belum ada transaksi'}</p>
          </div>
        ) : (
<>
            {/* Mobile Card Layout */}
            <div className="md:hidden divide-y divide-gray-100">
              {filtered.map((t) => (
                <div key={t.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          t.type === 'INCOME' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {t.category.name}
                        </span>
                        <StatusBadge status={t.approvalStatus} type={t.type} />
                      </div>
                      <p className="text-xs text-gray-500">{formatDate(t.date)}</p>
                      {t.description && <p className="text-xs text-gray-600 truncate">{t.description}</p>}
                      {isAdmin && <p className="text-xs text-gray-400">{t.entity.name}</p>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-base font-bold ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {t.type === 'INCOME' ? '+' : '-'}{formatRupiah(t.amount)}
                      </p>
                      {t.attachmentUrl && (
                        <button onClick={() => setViewingImage(t.attachmentUrl)} className="text-xs text-emerald-600">🖼️</button>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {canEdit(t) ? (
                      <button onClick={() => startEdit(t)} className="text-xs text-blue-500 px-3 py-1.5 rounded-lg border border-blue-200">✏️ Edit</button>
                    ) : (
                      <span className="text-xs text-gray-400">🔒 Terkunci</span>
                    )}
                    {(t.approvalStatus === 'DRAFT' || t.approvalStatus === 'REJECTED' || t.type === 'INCOME') && (
                      <form action={deleteTransaksi.bind(null, t.id)}>
                        <button type="submit" className="text-xs text-red-500 px-3 py-1.5 rounded-lg border border-red-200">🗑️ Hapus</button>
                      </form>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {/* Desktop Table Layout */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Tanggal</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Kategori</th>
                    {isAdmin && <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Entity</th>}
                    <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Keterangan</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Status</th>
                    <th className="text-center text-xs font-medium text-gray-500 px-6 py-3">Bukti</th>
                    <th className="text-right text-xs font-medium text-gray-500 px-6 py-3">Nominal</th>
                    <th className="text-right text-xs font-medium text-gray-500 px-6 py-3">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((t) => (
                    <tr key={t.id} className={`hover:bg-gray-50 ${editingId === t.id ? 'bg-emerald-50' : ''}`}>
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{formatDate(t.date)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          t.type === 'INCOME' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {t.category.name}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4">
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{t.entity.name}</span>
                        </td>
                      )}
                      <td className="px-6 py-4 text-sm text-gray-600">{t.description || '-'}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={t.approvalStatus} type={t.type} />
                      </td>
                      <td className="px-6 py-4 text-center">
                        {t.attachmentUrl ? (
                          <button onClick={() => setViewingImage(t.attachmentUrl)}
                            className="text-emerald-600 hover:text-emerald-700" title="Lihat bukti">
                            🖼️
                          </button>
                        ) : (
                          <span className="text-gray-300 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`text-sm font-semibold ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'}`}>
                          {t.type === 'INCOME' ? '+' : '-'}{formatRupiah(t.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {canEdit(t) ? (
                            <button onClick={() => startEdit(t)}
                              className="text-xs text-blue-500 hover:text-blue-700 px-2 py-1 rounded border border-blue-200 hover:bg-blue-50">
                              ✏️ Edit
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400 px-2 py-1">🔒 Terkunci</span>
                          )}
                          {(t.approvalStatus === 'DRAFT' || t.approvalStatus === 'REJECTED' || t.type === 'INCOME') && (
                            <form action={deleteTransaksi.bind(null, t.id)}>
                              <button type="submit"
                                className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded border border-red-200 hover:bg-red-50">
                                🗑️ Hapus
                              </button>
                            </form>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
</>
        )}      </div>
    </div>
  )
}
