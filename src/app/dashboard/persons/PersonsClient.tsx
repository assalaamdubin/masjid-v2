'use client'

import { useState } from 'react'
import { createPerson, updatePerson, deletePerson, createPersonType, updatePersonType, deletePersonType } from './actions'

type PersonType = { id: string; name: string; entityId: string; isPengurus: boolean; isActive: boolean }
type Entity = { id: string; name: string; type: string }
type Person = {
  id: string
  fullName: string
  phoneNumber: string | null
  email: string | null
  address: string | null
  personTypeId: string | null
  entityId: string | null
  reportToId: string | null
  isActive: boolean
  personType: PersonType | null
  entity: Entity | null
  reportTo: { id: string; fullName: string } | null
  user: { id: string } | null
  subordinates: { id: string; fullName: string; personType: PersonType | null }[]
}

export default function PersonsClient({
  persons,
  personTypes,
  entities,
  entityIds,
}: {
  persons: Person[]
  personTypes: PersonType[]
  entities: Entity[]
  entityIds: string[]
}) {
  const [tab, setTab] = useState<'persons' | 'orgchart' | 'types'>('persons')
  const [showForm, setShowForm] = useState(false)
  const [showTypeForm, setShowTypeForm] = useState(false)
  const [editingPerson, setEditingPerson] = useState<Person | null>(null)
  const [editingType, setEditingType] = useState<PersonType | null>(null)
  const [search, setSearch] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const [showInactiveTypes, setShowInactiveTypes] = useState(false)
  const [confirmNonaktif, setConfirmNonaktif] = useState<string | null>(null)
  const [confirmNonaktifType, setConfirmNonaktifType] = useState<string | null>(null)

  const filtered = persons.filter(p => {
    const matchActive = showInactive ? true : p.isActive
    const matchSearch = search === '' ? true :
      p.fullName.toLowerCase().includes(search.toLowerCase()) ||
      (p.email?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (p.personType?.name.toLowerCase().includes(search.toLowerCase()) ?? false)
    return matchActive && matchSearch
  })

  const roots = persons.filter(p => !p.reportToId && p.isActive)

  function OrgNode({ person, level }: { person: Person; level: number }) {
    const subs = persons.filter(p => p.reportToId === person.id && p.isActive)
    return (
      <div className={`${level > 0 ? 'ml-6 border-l-2 border-gray-200 pl-4' : ''}`}>
        <div className={`flex items-center gap-3 py-2 ${level === 0 ? 'mt-2' : 'mt-1'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 ${
            level === 0 ? 'bg-emerald-600' : level === 1 ? 'bg-blue-500' : 'bg-gray-400'
          }`}>
            {person.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{person.fullName}</p>
            <div className="flex items-center gap-2">
              {person.personType && (
                <span className={`text-xs px-1.5 py-0.5 rounded ${
                  person.personType.isPengurus ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {person.personType.name}
                </span>
              )}
              {person.user && (
                <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Has Account</span>
              )}
            </div>
          </div>
        </div>
        {subs.map(sub => <OrgNode key={sub.id} person={sub} level={level + 1} />)}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Manajemen Person</h1>
          <p className="text-sm text-gray-500 mt-0.5">Kelola data pengurus, jamaah, dan anggota</p>
        </div>
        <div className="flex gap-2">
          {tab === 'types' && (
            <button onClick={() => { setShowTypeForm(true); setEditingType(null) }}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
              + Tipe Baru
            </button>
          )}
          {tab === 'persons' && (
            <button onClick={() => { setShowForm(true); setEditingPerson(null) }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
              + Tambah Person
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { value: 'persons', label: '👥 Daftar Person' },
          { value: 'orgchart', label: '🏢 Org Chart' },
          { value: 'types', label: '🏷️ Tipe Person' },
        ].map(t => (
          <button key={t.value} onClick={() => { setTab(t.value as any); setShowForm(false); setShowTypeForm(false); setEditingPerson(null); setEditingType(null) }}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tab === t.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Form Person */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-5">
            {editingPerson ? '✏️ Edit Person' : '+ Tambah Person Baru'}
          </h3>
          <form action={async (formData) => {
            if (editingPerson) await updatePerson(editingPerson.id, formData)
            else await createPerson(formData)
            setShowForm(false)
            setEditingPerson(null)
          }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Nama Lengkap *</label>
                <input name="fullName" required defaultValue={editingPerson?.fullName}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">No. HP</label>
                <input name="phoneNumber" defaultValue={editingPerson?.phoneNumber ?? ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Email</label>
                <input name="email" type="email" defaultValue={editingPerson?.email ?? ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Entity</label>
                <select name="entityId" defaultValue={editingPerson?.entityId ?? entityIds[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  {entities.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Tipe Person</label>
                <select name="personTypeId" defaultValue={editingPerson?.personTypeId ?? ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="">Pilih tipe...</option>
                  {personTypes.filter(t => t.isActive).map(t => (
                    <option key={t.id} value={t.id}>{t.name} {t.isPengurus ? '⭐' : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Report To (Atasan)</label>
                <select name="reportToId" defaultValue={editingPerson?.reportToId ?? ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="">Tidak ada atasan</option>
                  {persons.filter(p => p.id !== editingPerson?.id && p.isActive).map(p => (
                    <option key={p.id} value={p.id}>{p.fullName}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Alamat</label>
              <textarea name="address" rows={2} defaultValue={editingPerson?.address ?? ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2.5 rounded-lg">
                {editingPerson ? 'Simpan Perubahan' : 'Tambah Person'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditingPerson(null) }}
                className="px-6 text-gray-500 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Form Tipe Person */}
      {showTypeForm && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            {editingType ? '✏️ Edit Tipe Person' : '+ Tambah Tipe Person Baru'}
          </h3>
          <form action={async (formData) => {
            if (editingType) await updatePersonType(editingType.id, formData)
            else await createPersonType(formData)
            setShowTypeForm(false)
            setEditingType(null)
          }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Nama Tipe *</label>
                <input name="name" required defaultValue={editingType?.name}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              {!editingType && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Entity</label>
                  <select name="entityId"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    {entities.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="isPengurus" name="isPengurus" value="true"
                defaultChecked={editingType?.isPengurus}
                className="w-4 h-4 text-emerald-600 rounded border-gray-300" />
              <label htmlFor="isPengurus" className="text-sm text-gray-700">
                ⭐ Tandai sebagai <strong>Pengurus</strong>
              </label>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-lg">
                {editingType ? 'Simpan Perubahan' : 'Tambah Tipe'}
              </button>
              <button type="button" onClick={() => { setShowTypeForm(false); setEditingType(null) }}
                className="px-6 text-gray-500 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab: Daftar Person */}
      {tab === 'persons' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input type="text" placeholder="🔍 Cari person..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer whitespace-nowrap">
              <input type="checkbox" checked={showInactive} onChange={e => setShowInactive(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-gray-300" />
              Tampilkan nonaktif
            </label>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <span className="text-4xl block mb-3">👥</span>
                <p className="text-sm">Belum ada person</p>
              </div>
            ) : (
              <>
                {/* Mobile Card Layout */}
                <div className="md:hidden divide-y divide-gray-100">
                  {filtered.map(p => (
                    <div key={p.id} className={`p-4 space-y-2 ${!p.isActive ? 'opacity-50 bg-gray-50' : ''}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                            p.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-500'
                          }`}>
                            {p.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{p.fullName}</p>
                            {!p.isActive && <span className="text-xs text-orange-500">⛔ Nonaktif</span>}
                            <div className="flex items-center gap-1 flex-wrap mt-0.5">
                              {p.personType && (
                                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                  p.personType.isPengurus ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {p.personType.isPengurus ? '⭐ ' : ''}{p.personType.name}
                                </span>
                              )}
                              {p.user && <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">✅ Akun</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 space-y-0.5 pl-13">
                        {p.entity && <p>🏢 {p.entity.name}</p>}
                        {p.reportTo && <p>👤 Atasan: {p.reportTo.fullName}</p>}
                        {p.phoneNumber && <p>📱 {p.phoneNumber}</p>}
                      </div>
                      {/* Konfirmasi nonaktif */}
                      {confirmNonaktif === p.id && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-orange-600">Yakin?</span>
                          <form action={deletePerson.bind(null, p.id)}>
                            <button type="submit" className="text-xs bg-orange-500 text-white px-2 py-1 rounded">Ya</button>
                          </form>
                          <button onClick={() => setConfirmNonaktif(null)} className="text-xs text-gray-500 px-2 py-1 rounded border border-gray-200">Batal</button>
                        </div>
                      )}
                      <div className="flex gap-2">
                        {p.isActive && (
                          <button onClick={() => { setEditingPerson(p); setShowForm(true) }}
                            className="text-xs text-blue-500 px-3 py-1.5 rounded-lg border border-blue-200">
                            ✏️ Edit
                          </button>
                        )}
                        <button onClick={() => setConfirmNonaktif(confirmNonaktif === p.id ? null : p.id)}
                          className={`text-xs px-3 py-1.5 rounded-lg border ${
                            p.isActive ? 'text-orange-500 border-orange-200' : 'text-emerald-600 border-emerald-200'
                          }`}>
                          {p.isActive ? '🔒 Nonaktifkan' : '🔓 Aktifkan'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table Layout */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Nama</th>
                        <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Tipe</th>
                        <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Entity</th>
                        <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Atasan</th>
                        <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Kontak</th>
                        <th className="text-center text-xs font-medium text-gray-500 px-6 py-3">Akun</th>
                        <th className="text-right text-xs font-medium text-gray-500 px-6 py-3">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filtered.map(p => (
                        <tr key={p.id} className={`hover:bg-gray-50 ${!p.isActive ? 'opacity-50 bg-gray-50' : ''}`}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                p.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-500'
                              }`}>
                                {p.fullName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{p.fullName}</p>
                                {!p.isActive && <span className="text-xs text-orange-500">⛔ Nonaktif</span>}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {p.personType ? (
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                p.personType.isPengurus ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {p.personType.isPengurus ? '⭐ ' : ''}{p.personType.name}
                              </span>
                            ) : <span className="text-gray-400 text-xs">-</span>}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{p.entity?.name ?? '-'}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{p.reportTo?.fullName ?? '-'}</td>
                          <td className="px-6 py-4">
                            <div className="text-xs text-gray-500">
                              {p.phoneNumber && <p>{p.phoneNumber}</p>}
                              {p.email && <p>{p.email}</p>}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {p.user ? (
                              <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full">✅ Ada</span>
                            ) : (
                              <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">Tidak ada</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {confirmNonaktif === p.id && (
                              <div className="flex items-center justify-end gap-2 mb-2">
                                <span className="text-xs text-orange-600">Yakin nonaktifkan?</span>
                                <form action={deletePerson.bind(null, p.id)}>
                                  <button type="submit" className="text-xs bg-orange-500 text-white px-2 py-1 rounded">Ya</button>
                                </form>
                                <button onClick={() => setConfirmNonaktif(null)} className="text-xs text-gray-500 px-2 py-1 rounded border border-gray-200">Batal</button>
                              </div>
                            )}
                            <div className="flex items-center justify-end gap-2">
                              {p.isActive && (
                                <button onClick={() => { setEditingPerson(p); setShowForm(true) }}
                                  className="text-xs text-blue-500 hover:text-blue-700 px-2 py-1 rounded border border-blue-200 hover:bg-blue-50">
                                  ✏️ Edit
                                </button>
                              )}
                              <button onClick={() => setConfirmNonaktif(confirmNonaktif === p.id ? null : p.id)}
                                className={`text-xs px-2 py-1 rounded border transition-colors ${
                                  p.isActive ? 'text-orange-500 border-orange-200 hover:bg-orange-50' : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                                }`}>
                                {p.isActive ? '🔒 Nonaktifkan' : '🔓 Aktifkan'}
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
      )}

      {/* Tab: Org Chart */}
      {tab === 'orgchart' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-2">🏢 Struktur Organisasi</h3>
          <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-600 inline-block"></span> Level 1</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span> Level 2</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-gray-400 inline-block"></span> Level 3+</span>
            <span>⭐ Pengurus</span>
          </div>
          {roots.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <span className="text-3xl block mb-2">🏢</span>
              <p className="text-sm">Belum ada data organisasi</p>
            </div>
          ) : (
            <div className="space-y-2">
              {roots.map(root => <OrgNode key={root.id} person={root} level={0} />)}
            </div>
          )}
        </div>
      )}

      {/* Tab: Tipe Person */}
      {tab === 'types' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" checked={showInactiveTypes} onChange={e => setShowInactiveTypes(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-gray-300" />
              Tampilkan nonaktif
            </label>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <>
              {/* Mobile Card Layout - Tipe Person */}
              <div className="md:hidden divide-y divide-gray-100">
                {personTypes.filter(t => showInactiveTypes ? true : t.isActive).map(t => (
                  <div key={t.id} className={`p-4 space-y-2 ${!t.isActive ? 'opacity-50' : ''}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                        <p className="text-xs text-gray-500">{entities.find(e => e.id === t.entityId)?.name ?? '-'}</p>
                        <div className="flex gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            t.isPengurus ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {t.isPengurus ? '⭐ Pengurus' : 'Jamaah'}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            t.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {t.isActive ? '✅ Aktif' : '⛔ Nonaktif'}
                          </span>
                        </div>
                      </div>
                    </div>
                    {confirmNonaktifType === t.id && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-orange-600">Yakin?</span>
                        <form action={deletePersonType.bind(null, t.id)}>
                          <button type="submit" className="text-xs bg-orange-500 text-white px-2 py-1 rounded">Ya</button>
                        </form>
                        <button onClick={() => setConfirmNonaktifType(null)} className="text-xs text-gray-500 px-2 py-1 rounded border border-gray-200">Batal</button>
                      </div>
                    )}
                    <div className="flex gap-2">
                      {t.isActive && (
                        <button onClick={() => { setEditingType(t); setShowTypeForm(true) }}
                          className="text-xs text-blue-500 px-3 py-1.5 rounded-lg border border-blue-200">
                          ✏️ Edit
                        </button>
                      )}
                      <button onClick={() => setConfirmNonaktifType(confirmNonaktifType === t.id ? null : t.id)}
                        className={`text-xs px-3 py-1.5 rounded-lg border ${
                          t.isActive ? 'text-orange-500 border-orange-200' : 'text-emerald-600 border-emerald-200'
                        }`}>
                        {t.isActive ? '🔒 Nonaktifkan' : '🔓 Aktifkan'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table Layout - Tipe Person */}
              <div className="hidden md:block">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Nama Tipe</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Entity</th>
                      <th className="text-center text-xs font-medium text-gray-500 px-6 py-3">Pengurus</th>
                      <th className="text-center text-xs font-medium text-gray-500 px-6 py-3">Status</th>
                      <th className="text-right text-xs font-medium text-gray-500 px-6 py-3">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {personTypes.filter(t => showInactiveTypes ? true : t.isActive).map(t => (
                      <tr key={t.id} className={`hover:bg-gray-50 ${!t.isActive ? 'opacity-50' : ''}`}>
                        <td className="px-6 py-3 text-sm font-medium text-gray-900">{t.name}</td>
                        <td className="px-6 py-3 text-sm text-gray-600">
                          {entities.find(e => e.id === t.entityId)?.name ?? '-'}
                        </td>
                        <td className="px-6 py-3 text-center">
                          {t.isPengurus ? (
                            <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full">⭐ Pengurus</span>
                          ) : (
                            <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">Jamaah</span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-center">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            t.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {t.isActive ? '✅ Aktif' : '⛔ Nonaktif'}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-right">
                          {confirmNonaktifType === t.id && (
                            <div className="flex items-center justify-end gap-2 mb-2">
                              <span className="text-xs text-orange-600">Yakin nonaktifkan?</span>
                              <form action={deletePersonType.bind(null, t.id)}>
                                <button type="submit" className="text-xs bg-orange-500 text-white px-2 py-1 rounded">Ya</button>
                              </form>
                              <button onClick={() => setConfirmNonaktifType(null)} className="text-xs text-gray-500 px-2 py-1 rounded border border-gray-200">Batal</button>
                            </div>
                          )}
                          <div className="flex items-center justify-end gap-2">
                            {t.isActive && (
                              <button onClick={() => { setEditingType(t); setShowTypeForm(true) }}
                                className="text-xs text-blue-500 hover:text-blue-700 px-2 py-1 rounded border border-blue-200 hover:bg-blue-50">
                                ✏️ Edit
                              </button>
                            )}
                            <button onClick={() => setConfirmNonaktifType(confirmNonaktifType === t.id ? null : t.id)}
                              className={`text-xs px-2 py-1 rounded border transition-colors ${
                                t.isActive ? 'text-orange-500 border-orange-200 hover:bg-orange-50' : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                              }`}>
                              {t.isActive ? '🔒 Nonaktifkan' : '🔓 Aktifkan'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          </div>
        </div>
      )}
    </div>
  )
}
