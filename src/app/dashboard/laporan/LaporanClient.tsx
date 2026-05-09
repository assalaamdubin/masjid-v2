'use client'

import { useRouter } from 'next/navigation'

type Transaksi = {
  id: string
  type: string
  date: Date
  amount: any
  description: string | null
  payerName: string | null
  paymentMethod: string | null
  category: { name: string; type: string }
}

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

const BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

export default function LaporanClient({
  transaksi,
  totalPemasukan,
  totalPengeluaran,
  bulan,
  tahun,
}: {
  transaksi: Transaksi[]
  totalPemasukan: number
  totalPengeluaran: number
  bulan: number
  tahun: number
}) {
  const router = useRouter()
  const saldo = totalPemasukan - totalPengeluaran

  const tahunOptions = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

  // Rekap per kategori
  const rekapKategori = transaksi.reduce((acc, t) => {
    const key = t.category.name
    if (!acc[key]) acc[key] = { name: key, type: t.type, total: 0, count: 0 }
    acc[key].total += Number(t.amount)
    acc[key].count += 1
    return acc
  }, {} as Record<string, { name: string; type: string; total: number; count: number }>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Laporan Keuangan</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {BULAN[bulan - 1]} {tahun}
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          🖨️ Print / Export PDF
        </button>
      </div>

      {/* Filter Bulan & Tahun */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 flex gap-4 items-center">
        <span className="text-sm font-medium text-gray-700">Filter:</span>
        <select
          value={bulan}
          onChange={(e) => router.push(`/dashboard/laporan?bulan=${e.target.value}&tahun=${tahun}`)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {BULAN.map((b, i) => (
            <option key={i} value={i + 1}>{b}</option>
          ))}
        </select>
        <select
          value={tahun}
          onChange={(e) => router.push(`/dashboard/laporan?bulan=${bulan}&tahun=${e.target.value}`)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {tahunOptions.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
          <p className="text-xs font-medium text-emerald-600 mb-1">Total Pemasukan</p>
          <p className="text-xl font-bold text-emerald-700">{formatRupiah(totalPemasukan)}</p>
          <p className="text-xs text-emerald-500 mt-1">{transaksi.filter(t => t.type === 'INCOME').length} transaksi</p>
        </div>
        <div className="bg-red-50 rounded-2xl p-5 border border-red-100">
          <p className="text-xs font-medium text-red-600 mb-1">Total Pengeluaran</p>
          <p className="text-xl font-bold text-red-700">{formatRupiah(totalPengeluaran)}</p>
          <p className="text-xs text-red-500 mt-1">{transaksi.filter(t => t.type === 'EXPENSE').length} transaksi</p>
        </div>
        <div className={`rounded-2xl p-5 border ${saldo >= 0 ? 'bg-blue-50 border-blue-100' : 'bg-red-50 border-red-100'}`}>
          <p className={`text-xs font-medium mb-1 ${saldo >= 0 ? 'text-blue-600' : 'text-red-600'}`}>Saldo Bulan Ini</p>
          <p className={`text-xl font-bold ${saldo >= 0 ? 'text-blue-700' : 'text-red-700'}`}>{formatRupiah(saldo)}</p>
          <p className={`text-xs mt-1 ${saldo >= 0 ? 'text-blue-500' : 'text-red-500'}`}>{saldo >= 0 ? 'Surplus' : 'Defisit'}</p>
        </div>
      </div>

      {/* Rekap per Kategori */}
      {Object.keys(rekapKategori).length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Rekap per Kategori</h3>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Kategori</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Tipe</th>
                <th className="text-center text-xs font-medium text-gray-500 px-6 py-3">Jumlah</th>
                <th className="text-right text-xs font-medium text-gray-500 px-6 py-3">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Object.values(rekapKategori)
                .sort((a, b) => b.total - a.total)
                .map((k) => (
                <tr key={k.name} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">{k.name}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      k.type === 'INCOME' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {k.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-center text-sm text-gray-600">{k.count}x</td>
                  <td className={`px-6 py-3 text-right text-sm font-semibold ${
                    k.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {formatRupiah(k.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Transaksi */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Detail Transaksi</h3>
        </div>
        {transaksi.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <span className="text-4xl block mb-3">📋</span>
            <p className="text-sm">Tidak ada transaksi di bulan ini</p>
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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transaksi.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm text-gray-600 whitespace-nowrap">
                    {new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(new Date(t.date))}
                  </td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      t.type === 'INCOME' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {t.category.name}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">{t.description || '-'}</td>
                  <td className="px-6 py-3 text-sm text-gray-500">{t.paymentMethod || '-'}</td>
                  <td className={`px-6 py-3 text-right text-sm font-semibold ${
                    t.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {t.type === 'INCOME' ? '+' : '-'}{formatRupiah(Number(t.amount))}
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
