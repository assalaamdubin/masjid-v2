'use client'

import { useState, useEffect } from 'react'

type Transaction = {
  id: string
  type: string
  date: Date
  amount: any
  category: { name: string }
  entity: { name: string; type: string }
}

type Entity = {
  id: string
  name: string
  type: string
  transactions: {
    id: string
    type: string
    date: Date
    amount: any
    category: { name: string }
  }[]
}

type Period = 'weekly' | 'monthly' | 'yearly'

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

function filterByPeriod(transactions: any[], period: Period) {
  const now = new Date()
  return transactions.filter(t => {
    const date = new Date(t.date)
    if (period === 'weekly') {
      const weekAgo = new Date(now)
      weekAgo.setDate(weekAgo.getDate() - 7)
      return date >= weekAgo
    } else if (period === 'monthly') {
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
    } else {
      return date.getFullYear() === now.getFullYear()
    }
  })
}

function EntityCard({ entity, period }: { entity: Entity; period: Period }) {
  const filtered = filterByPeriod(entity.transactions, period)
  const pemasukan = filtered.filter(t => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0)
  const pengeluaran = filtered.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0)
  const saldo = pemasukan - pengeluaran

  const periodLabel = period === 'weekly' ? 'Minggu Ini' : period === 'monthly' ? 'Bulan Ini' : 'Tahun Ini'

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Entity Header */}
      <div className={`px-6 py-4 flex items-center gap-3 ${
        entity.type === 'DKM' ? 'bg-emerald-600' : 'bg-blue-600'
      }`}>
        <span className="text-2xl">{entity.type === 'DKM' ? '🕌' : '🏫'}</span>
        <div>
          <h3 className="font-bold text-white">{entity.name}</h3>
          <p className="text-xs text-white/70">{entity.type} • {periodLabel}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-200">
        <div className="px-4 py-4 text-center">
          <p className="text-xs text-gray-500 mb-1">Saldo</p>
          <p className={`text-base font-bold ${saldo >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
            {formatRupiah(saldo)}
          </p>
        </div>
        <div className="px-4 py-4 text-center">
          <p className="text-xs text-emerald-600 mb-1">Pemasukan</p>
          <p className="text-base font-bold text-emerald-700">{formatRupiah(pemasukan)}</p>
        </div>
        <div className="px-4 py-4 text-center">
          <p className="text-xs text-red-600 mb-1">Pengeluaran</p>
          <p className="text-base font-bold text-red-600">{formatRupiah(pengeluaran)}</p>
        </div>
      </div>

      {/* Progress bar pemasukan vs pengeluaran */}
      {(pemasukan > 0 || pengeluaran > 0) && (
        <div className="px-6 py-3 border-b border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
            <span>Penggunaan Dana</span>
            <span>{pemasukan > 0 ? Math.round((pengeluaran / pemasukan) * 100) : 0}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                pengeluaran > pemasukan ? 'bg-red-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(pemasukan > 0 ? (pengeluaran / pemasukan) * 100 : 0, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Transaksi terbaru */}
      <div className="px-6 py-3">
        <p className="text-xs font-medium text-gray-500 mb-3">Transaksi Terbaru</p>
        {filtered.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            <span className="text-2xl block mb-1">📝</span>
            <p className="text-xs">Belum ada transaksi {periodLabel.toLowerCase()}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.slice(0, 3).map(t => (
              <div key={t.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm ${
                    t.type === 'INCOME' ? 'bg-emerald-100' : 'bg-red-100'
                  }`}>
                    {t.type === 'INCOME' ? '📈' : '📉'}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-900">{t.category.name}</p>
                    <p className="text-xs text-gray-400">
                      {new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(new Date(t.date))}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-semibold ${
                  t.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {t.type === 'INCOME' ? '+' : '-'}{formatRupiah(Number(t.amount))}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-6 pb-4">
        
          href="/dashboard/transaksi"
          className={`block text-center text-xs font-medium py-2 rounded-lg transition-colors mt-2 ${
            entity.type === 'DKM'
              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
          }`}
        >
          Lihat semua transaksi →
        </a>
      </div>
    </div>
  )
}

export default function DashboardClient({
  entities,
  allTransaksiTerbaru,
  isAdmin,
  mosqueName,
  entityIds,
}: {
  entities: Entity[]
  allTransaksiTerbaru: Transaction[]
  isAdmin: boolean
  mosqueName: string
  entityIds: string[]
}) {
  const [period, setPeriod] = useState<Period>('monthly')

  const totalPemasukan = filterByPeriod(allTransaksiTerbaru, period)
    .filter(t => t.type === 'INCOME')
    .reduce((s, t) => s + Number(t.amount), 0)

  const totalPengeluaran = filterByPeriod(allTransaksiTerbaru, period)
    .filter(t => t.type === 'EXPENSE')
    .reduce((s, t) => s + Number(t.amount), 0)

  const periods: { value: Period; label: string }[] = [
    { value: 'weekly', label: 'Mingguan' },
    { value: 'monthly', label: 'Bulanan' },
    { value: 'yearly', label: 'Tahunan' },
  ]

  return (
    <div className="space-y-6">
      {/* Header + Period Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          {isAdmin && (
            <p className="text-sm text-gray-500 mt-0.5">📊 {mosqueName} — Semua Entity</p>
          )}
        </div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {periods.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                period === p.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary total semua entity (admin only) */}
      {isAdmin && entities.length > 1 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-200 col-span-1">
            <p className="text-xs font-medium text-gray-500 mb-1">Total Saldo Gabungan</p>
            <p className={`text-xl font-bold ${(totalPemasukan - totalPengeluaran) >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
              {formatRupiah(totalPemasukan - totalPengeluaran)}
            </p>
            <p className="text-xs text-gray-400 mt-1">Semua entity</p>
          </div>
          <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
            <p className="text-xs font-medium text-emerald-600 mb-1">Total Pemasukan</p>
            <p className="text-xl font-bold text-emerald-700">{formatRupiah(totalPemasukan)}</p>
            <p className="text-xs text-emerald-500 mt-1">Semua entity</p>
          </div>
          <div className="bg-red-50 rounded-2xl p-5 border border-red-100">
            <p className="text-xs font-medium text-red-600 mb-1">Total Pengeluaran</p>
            <p className="text-xl font-bold text-red-600">{formatRupiah(totalPengeluaran)}</p>
            <p className="text-xs text-red-400 mt-1">Semua entity</p>
          </div>
        </div>
      )}

      {/* Entity Cards */}
      <div className={`grid gap-6 ${entities.length > 1 ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        {entities.map(entity => (
          <EntityCard key={entity.id} entity={entity} period={period} />
        ))}
      </div>
    </div>
  )
}
