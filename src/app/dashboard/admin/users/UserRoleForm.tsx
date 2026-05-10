'use client'

import { useState } from 'react'
import { updateUserRole } from './actions'

const roles = [
  { value: 'SUPER_ADMIN', label: '⭐ Super Admin' },
  { value: 'KETUA', label: '👑 Ketua' },
  { value: 'BENDAHARA', label: '💰 Bendahara' },
  { value: 'PENGURUS', label: '🏢 Pengurus' },
  { value: 'VIEWER', label: '👁️ Viewer' },
]

export default function UserRoleForm({
  personId,
  entityId,
  currentRole,
  isBendahara,
}: {
  personId: string
  entityId: string
  currentRole: string
  isBendahara: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [role, setRole] = useState(currentRole)
  const [bendahara, setBendahara] = useState(isBendahara)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    await updateUserRole(personId, entityId, role as any, bendahara)
    setSaving(false)
    setEditing(false)
  }

  if (!editing) {
    return (
      <button onClick={() => setEditing(true)}
        className="text-xs text-blue-500 hover:text-blue-700 px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-50">
        🔧 Ubah Role
      </button>
    )
  }

  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-3">
      <p className="text-xs font-medium text-gray-700">Assign Role:</p>
      <div className="flex flex-wrap gap-2">
        {roles.map(r => (
          <button key={r.value} type="button"
            onClick={() => setRole(r.value)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
              role === r.value
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}>
            {r.label}
          </button>
        ))}
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={bendahara}
          onChange={(e) => setBendahara(e.target.checked)}
          className="w-4 h-4 text-emerald-600 rounded border-gray-300"
        />
        <span className="text-xs text-gray-700">💰 Tandai sebagai <strong>Bendahara</strong> entity ini</span>
      </label>

      <div className="flex gap-2">
        <button onClick={handleSave} disabled={saving}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-medium py-2 rounded-lg">
          {saving ? 'Menyimpan...' : 'Simpan Role'}
        </button>
        <button onClick={() => setEditing(false)}
          className="px-4 text-gray-500 text-xs border border-gray-300 rounded-lg hover:bg-gray-50">
          Batal
        </button>
      </div>
    </div>
  )
}
