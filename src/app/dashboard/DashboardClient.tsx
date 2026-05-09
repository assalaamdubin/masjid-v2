'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

const GrafikKeuangan = dynamic(() => import('@/components/dashboard/GrafikKeuangan'), { ssr: false })

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

function buildGrafikData(transactions: any[], period: Period) {
  const now = new Date()

  if (period === 'weekly') {
    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now)
      date.setDate(date.getDate() - (6 - i))
      const dayTx = transactions.filter(t => {
        const d = new Date(t.date)
        return d.toDateString() === date.toDateString()
      })
      return {
        name: days[date.getDay()],
        pemasukan: dayTx.filter(t => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0),
        pengeluaran: dayTx.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0),
      }
    })
  } else if (period === 'monthly') {
    const bulan = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    return Array.from({ length: 12 }, (_, i) => {
      const monthTx = transactions.filter(t => {
        const d = new Date(t.date)
        return d.getMonth() === i && d.getFullYear() === now.getFullYear()
      })
      return {
        name: bulan[i],
        pemasukan: monthTx.filter(t => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0),
        pengeluaran: monthTx.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0),
      }
    })
  } else {
    return Array.from({ length: 5 }, (_, i) => {
      const year = now.getFullYear() - (4 - i)
      const yearTx = transactions.filter(t => new Date(t.date).getFullYear() === year)
      return {
        name: String(year),
        pemasukan: yearTx.filter(t => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0),
        pengeluaran: yearTx.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0),
      }
    })
  }
}

function EntityCard({ entity, period }: { entity: Entity; period: Period }) {
  const filtered = filterByPeriod(entity.transactions, period)
  const pemasukan = filtered.filter(t => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0)
  const pengeluaran = filtered.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0)
  const saldo = pemasukan - pengeluaran
  const grafikData = buildGrafikData(entity.transactions, period)
  const periodLabel = period === 'weekly' ? 'Minggu Ini' : period === 'monthly' ? 'Bulan Ini' : 'Tahun Ini'

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className={`px-6 py-4 flex items-center gap-3 ${entity.type === 'DKM' ? 'bg-emerald-600' : 'bg-blue-600'}`}>
        <span className="text-2xl">{entity.type === 'DKM' ? '🕌' : '🏫'}</span>
        <div>
          <h3 className="font-bold text-white">{entity.name}</h3>
          <p className="text-xs text-white/70">{entity.type} • {periodLabel}</p>
        </div>
      </div>

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

      {(pemasukan > 0 || pengeluaran > 0) && (
        <div className="px-6 py-3 border-b border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
            <span>Penggunaan Dana</span>
            <span>{pemasukan > 0 ? Math.round((pengeluaran / pemasukan) * 100) : 0}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${pengeluaran > pemasukan ? 'bg-red-500' : 'bg-emerald-500'}`}
              style={{ width: `${Math.min(pemasukan > 0 ? (pengeluaran / pemasukan) * 100 : 0, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Grafik */}
      <div className="px-6 py-4 border-b border-gray-100">
        <GrafikKeuangan data={grafikData} title="" />
      </div>

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
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm ${t.type === 'INCOME' ? 'bg-emerald-100' : 'bg-red-100'}`}>
