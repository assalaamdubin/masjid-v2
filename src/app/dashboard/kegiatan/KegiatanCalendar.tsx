'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type Kegiatan = {
  id: string
  name: string
  startDate: Date
  endDate: Date | null
  status: string
  location: string | null
  entity: { name: string; type: string }
}

const statusChipClass: Record<string, string> = {
  PLANNED:   'bg-blue-100 text-blue-700 border-blue-200',
  ONGOING:   'bg-emerald-100 text-emerald-700 border-emerald-200',
  COMPLETED: 'bg-gray-100 text-gray-600 border-gray-200',
  CANCELLED: 'bg-red-100 text-red-600 border-red-200',
}

const DAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']

function isSameDay(a: Date, b: Date) {
  return a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()
}

function inRange(date: Date, start: Date, end: Date | null) {
  const d = date.getTime()
  const s = new Date(start).setHours(0,0,0,0)
  const e = end ? new Date(end).setHours(23,59,59,999) : new Date(start).setHours(23,59,59,999)
  return d >= s && d <= e
}

export default function KegiatanCalendar({
  kegiatan,
  onSelect,
}: {
  kegiatan: Kegiatan[]
  onSelect: (k: Kegiatan) => void
}) {
  const today = new Date()
  const [month, setMonth] = useState(today.getMonth())
  const [year, setYear] = useState(today.getFullYear())

  function prev() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }

  function next() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const firstDay = new Date(year, month, 1)
  let startDow = firstDay.getDay()
  startDow = startDow === 0 ? 6 : startDow - 1

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (Date | null)[] = []
  for (let i = 0; i < startDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
  while (cells.length % 7 !== 0) cells.push(null)

  function getEventsForDay(date: Date) {
    return kegiatan.filter(k => inRange(date, new Date(k.startDate), k.endDate ? new Date(k.endDate) : null))
  }

  function isStart(date: Date, k: Kegiatan) {
    return isSameDay(date, new Date(k.startDate))
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button onClick={prev} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
            <ChevronLeft size={18} />
          </button>
          <h2 className="text-base font-bold text-gray-900 w-48 text-center">
            {MONTHS[month]} {year}
          </h2>
          <button onClick={next} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
            <ChevronRight size={18} />
          </button>
        </div>
        <button
          onClick={() => { setMonth(today.getMonth()); setYear(today.getFullYear()) }}
          className="text-xs text-emerald-600 px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-50">
          Hari Ini
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-gray-100">
        {DAYS.map(d => (
          <div key={d} className={`py-2 text-center text-xs font-semibold ${d === 'Min' ? 'text-red-500' : 'text-gray-500'}`}>
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7">
        {cells.map((date, idx) => {
          const isToday = date ? isSameDay(date, today) : false
          const isSun = idx % 7 === 6
          const events = date ? getEventsForDay(date) : []

          return (
            <div key={idx} className={`min-h-24 border-b border-r border-gray-100 p-1.5 ${!date ? 'bg-gray-50' : ''} ${isSun ? 'border-r-0' : ''}`}>
              {date && (
                <>
                  <div className={`w-7 h-7 flex items-center justify-center rounded-full text-sm mb-1 ${
                    isToday ? 'bg-emerald-600 text-white font-semibold' : isSun ? 'text-red-500' : 'text-gray-700'
                  }`}>
                    {date.getDate()}
                  </div>
                  <div className="space-y-0.5">
                    {events.slice(0, 3).map(k => (
                      <button
                        key={k.id}
                        onClick={() => onSelect(k)}
                        className={`w-full text-left text-xs px-1.5 py-0.5 rounded font-medium truncate border transition-opacity hover:opacity-70 ${statusChipClass[k.status] ?? statusChipClass.PLANNED}`}
                      >
                        {isStart(date, k) || date.getDate() === 1 ? k.name : '\u00A0'}
                      </button>
                    ))}
                    {events.length > 3 && (
                      <p className="text-xs text-gray-400 pl-1">+{events.length - 3} lagi</p>
                    )}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-4 flex-wrap">
        {[
          { status: 'PLANNED', label: 'Direncanakan' },
          { status: 'ONGOING', label: 'Berlangsung' },
          { status: 'COMPLETED', label: 'Selesai' },
          { status: 'CANCELLED', label: 'Dibatalkan' },
        ].map(({ status, label }) => (
          <div key={status} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-sm border ${statusChipClass[status]}`}></div>
            <span className="text-xs text-gray-500">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
