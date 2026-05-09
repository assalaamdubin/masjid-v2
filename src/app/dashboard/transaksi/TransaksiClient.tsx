'use client'

import { useState } from 'react'
import { createTransaksi, deleteTransaksi } from './actions'

type Kategori = {
  id: string
  name: string
  type: string
}

type Transaksi = {
  id: string
  type: string
  date: Date
  amount: any
  description: string | null
  payerName: string | null
  paymentMethod: string | null
  category: Kategori
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
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

export default function TransaksiClient({
  initialData,
  kategori,
}: {
  initialData: Transaksi[]
  kategori: Kategori[]
}) {
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('all')
  const [formType, setFormType] = useState('INCOME')

  const filtered = initialData.filter(t =>
    filter === 'all' ? true : t.type === filter
  )

  const totalPemasukan = initialData
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const totalPengeluaran = initialData
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const saldo = totalPemasukan - totalPengeluaran

  const kategoriFiltered = kategori.filter(k => k.type === formType)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Transaksi</h1>
          <p className="text-sm text-gray-500 mt-0.5">Kelola pemasukan dan pengeluaran</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Tambah Transaksi
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-200">
          <p className="text-xs font-medium text-gray-500 mb-1">Total Saldo</p>
          <p className={`text-xl font-bold ${saldo >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
            {formatRupiah(saldo)}
          </p>
        </div>
        <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
          <p className="text-xs font-medium text-emerald-600 mb-1">Total Pemasukan</p>
          <p className="text-xl font-bold text-emerald-700">{formatRupiah(totalPemasukan)}</p>
        </div>
        <div className="bg-red-50 rounded-2xl p-5 border border-red-100">
          <p className="text-xs font-medium text-red-600 mb-1">Total Pengeluaran</p>
          <p className="text-xl font-bold text-red-700">{formatRupiah(totalPengeluaran)}</p>
        </div>
      </div>

      {/* Form Tambah */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-5">Tambah Transaksi Baru</h3>
          <form action={async (formData) => {
            formData.set('type', formType)
            await createTransaksi(formData)
            setShowForm(false)
          }} className="space-y-4">

            {/* Tipe */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setFormType('INCOME')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  formType === 'INCOME'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                📈 Pemasukan
              </button>
              <button
                type="button"
                onClick={() => setFormType('EXPENSE')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  formType === 'EXPENSE'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                📉 Pengeluaran
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Tanggal */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Tanggal</label>
                <input
                  name="date"
                  type="date"
                  required
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Nominal */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Nominal (Rp)</label>
                <input
                  name="amount"
                  type="number"
                  required
                  min="0"
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Kategori */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Kategori</label>
              <select
                name="categoryId"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Pilih kategori...</option>
                {kategoriFiltered.map(k => (
                  <option key={k.id} value={k.id}>{k.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Nama Pemberi/Penerima */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  {formType === 'INCOME' ? 'Nama Pemberi' : 'Nama Penerima'}
                </label>
                <input
                  name="payerName"
                  type="text"
                  placeholder="Opsional"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Metode Pembayaran */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Metode</label>
                <select
                  name="paymentMethod"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="TUNAI">Tunai</option>
                  <option value="TRANSFER">Transfer Bank</option>
                  <option value="QRIS">QRIS</option>
                </select>
              </div>
            </div>

            {/* Keterangan */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Keterangan</label>
              <textarea
                name="description"
                rows={2}
                placeholder="Keterangan transaksi (opsional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
              >
                Simpan Transaksi
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 text-gray-500 hover:text-gray-700 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2">
        {[
          { value: 'all', label: 'Semua' },
          { value: 'INCOME', label: '📈 Pemasukan' },
          { value: 'EXPENSE', label: '📉 Pengeluaran' },
        ].map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f.value
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List Transaksi */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <span className="text-4xl block mb-3">💸</span>
            <p className="text-sm">Belum ada transaksi</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Tanggal</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Kategori</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Keterangan</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Metode</th>
                <th className="text-right text-xs font-medium text-gray-500 px-6 py-3">Nominal</th>
                <th className="text-right text-xs font-medium text-gray-500 px-6 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                    {formatDate(t.date)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      t.type === 'INCOME'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {t.category.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {t.description || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {t.paymentMethod || '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`text-sm font-semibold ${
                      t.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {t.type === 'INCOME' ? '+' : '-'}{formatRupiah(t.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <form action={deleteTransaksi.bind(null, t.id)}>
                      <button
                        type="submit"
                        className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded border border-red-200 hover:bg-red-50"
                      >
                        Hapus
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
