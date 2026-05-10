'use client'

import { useState } from 'react'
import { linkPersonToUser } from '../../../dashboard/persons/actions'

type Person = {
  id: string
  fullName: string
  personType: { name: string } | null
  entity: { name: string } | null
}

export default function LinkPersonForm({
  userId,
  currentPersonId,
  persons,
}: {
  userId: string
  currentPersonId: string
  persons: Person[]
}) {
  const [editing, setEditing] = useState(false)
  const [selectedPersonId, setSelectedPersonId] = useState(currentPersonId)

  async function handleSave() {
    await linkPersonToUser(userId, selectedPersonId)
    setEditing(false)
  }

  const currentPerson = persons.find(p => p.id === currentPersonId)

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-right">
          {currentPerson?.personType ? (
            <p className="text-xs text-gray-500">
              Linked: <span className="text-emerald-600 font-medium">{currentPerson.fullName}</span>
            </p>
          ) : (
            <p className="text-xs text-gray-400">Belum di-link ke person</p>
          )}
        </div>
        <button
          onClick={() => setEditing(true)}
          className="text-xs text-blue-500 hover:text-blue-700 px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-50 whitespace-nowrap"
        >
          🔗 {currentPerson?.personType ? 'Ganti' : 'Link'} Person
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={selectedPersonId}
        onChange={(e) => setSelectedPersonId(e.target.value)}
        className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        {persons.map(p => (
          <option key={p.id} value={p.id}>
            {p.fullName}{p.personType ? ` (${p.personType.name})` : ''}{p.entity ? ` - ${p.entity.name}` : ''}
          </option>
        ))}
      </select>
      <button
        onClick={handleSave}
        className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg"
      >
        Simpan
      </button>
      <button
        onClick={() => setEditing(false)}
        className="text-xs text-gray-500 px-3 py-1.5 border border-gray-300 rounded-lg"
      >
        Batal
      </button>
    </div>
  )
}
