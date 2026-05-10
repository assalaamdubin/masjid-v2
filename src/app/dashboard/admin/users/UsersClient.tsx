'use client'

import { useState } from 'react'
import { approveUser, rejectUser } from './actions'
import { createRole, updateRole, deleteRole } from '../roles/actions'
import UserRoleForm from './UserRoleForm'
import LinkPersonForm from './LinkPersonForm'

type Role = { id: string; name: string; entityId: string; isDefault: boolean }
type Entity = { id: string; name: string; type: string }
type EntityMember = {
  entityId: string
  role: string
  roleId: string | null
  isBendahara: boolean
  entity: Entity
}
type Person = {
  id: string
  fullName: string
  email: string | null
  phoneNumber: string | null
  personType: { name: string } | null
  entity: Entity | null
  entityMembers: EntityMember[]
}
type User = {
  id: string
  email: string
  personId: string
  person: Person
}
type PendingPerson = {
  id: string
  fullName: string
  email: string | null
  phoneNumber: string | null
  entityMembers: {
    entity: { name: string; mosque: { name: string } }
    role: string
  }[]
}

export default function UsersClient({
  pendingUsers,
  users,
  persons,
  roles,
  entities,
}: {
  pendingUsers: PendingPerson[]
  users: User[]
  persons: any[]
  roles: Role[]
  entities: Entity[]
}) {
  const [tab, setTab] = useState<'pending' | 'users' | 'roles'>('pending')
  const [showRoleForm, setShowRoleForm] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)

  const allMembers = users.flatMap(u =>
    u.person.entityMembers.map(m => ({ user: u, member: m }))
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Manajemen User</h1>
        <p className="text-sm text-gray-500 mt-0.5">Kelola akun user, role, dan link ke data person</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { value: 'pending', label: `⏳ Pending${pendingUsers.length > 0 ? ` (${pendingUsers.length})` : ''}` },
          { value: 'users', label: '👤 User Accounts' },
          { value: 'roles', label: '🔧 Manajemen Role' },
        ].map(t => (
          <button key={t.value} onClick={() => setTab(t.value as any)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tab === t.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Pending */}
      {tab === 'pending' && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
            <h3 className="font-semibold text-gray-900">Menunggu Approval</h3>
            {pendingUsers.length > 0 && (
              <span className="bg-yellow-100 text-yellow-700 text-xs font-medium px-2 py-0.5 rounded-full">
                {pendingUsers.length} pending
              </span>
            )}
          </div>
          {pendingUsers.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <span className="text-3xl block mb-2">✅</span>
              <p className="text-sm">Tidak ada pendaftaran yang menunggu</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {pendingUsers.map(person => {
                const member = person.entityMembers[0]
                return (
                  <div key={person.id} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center font-bold text-yellow-700">
                          {person.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{person.fullName}</p>
                          <p className="text-xs text-gray-500">{person.email}</p>
                          {person.phoneNumber && <p className="text-xs text-gray-400">{person.phoneNumber}</p>}
                          {member && (
                            <div className="flex gap-2 mt-1">
                              <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                                🕌 {member.entity.mosque.name}
                              </span>
                              <span className="bg-purple-50 text-purple-700 text-xs px-2 py-0.5 rounded-full">
                                {member.entity.name}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <form action={approveUser.bind(null, person.id)}>
                        <button type="submit"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium px-4 py-2 rounded-lg">
                          ✅ Approve
                        </button>
                      </form>
                      <form action={rejectUser.bind(null, person.id)}>
                        <button type="submit"
                          className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium px-4 py-2 rounded-lg border border-red-200">
                          ❌ Tolak
                        </button>
                      </form>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: User Accounts */}
      {tab === 'users' && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">User Accounts ({users.length})</h3>
            <p className="text-xs text-gray-500 mt-0.5">Link user ke data person & assign role</p>
          </div>
          <div className="divide-y divide-gray-100">
            {users.map(user => {
              const member = user.person.entityMembers[0]
              const userRoles = roles.filter(r => r.entityId === member?.entityId)
              return (
                <div key={user.id} className="px-6 py-4 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center font-bold text-emerald-700">
                        {user.person.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{user.person.fullName}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {member && (
                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                              {member.entity.name}
                            </span>
                          )}
                          {member && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              member.role === 'KETUA' ? 'bg-purple-100 text-purple-700' :
                              member.role === 'BENDAHARA' ? 'bg-yellow-100 text-yellow-700' :
                              member.role === 'SUPER_ADMIN' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {member.isBendahara ? '💰 ' : ''}{member.role.replace(/_/g, ' ')}
                            </span>
                          )}
                          {user.person.personType && (
                            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                              {user.person.personType.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <LinkPersonForm
                      userId={user.id}
                      currentPersonId={user.personId}
                      persons={persons}
                    />
                  </div>
                  {member && (
                    <UserRoleForm
                      personId={user.personId}
                      entityId={member.entityId}
                      currentRole={member.role}
                      currentRoleId={member.roleId}
                      isBendahara={member.isBendahara}
                      roles={userRoles}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Tab: Manajemen Role */}
      {tab === 'roles' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700 flex-1 mr-4">
              ℹ️ Role default tidak bisa dihapus. Tambah role custom sesuai kebutuhan organisasi.
            </div>
            <button
              onClick={() => { setShowRoleForm(true); setEditingRole(null) }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg whitespace-nowrap"
            >
              + Role Baru
            </button>
          </div>

          {/* Form tambah/edit role */}
          {showRoleForm && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                {editingRole ? '✏️ Edit Role' : '+ Tambah Role Baru'}
              </h3>
              <form action={async (formData) => {
                if (editingRole) await updateRole(editingRole.id, formData)
                else await createRole(formData)
                setShowRoleForm(false)
                setEditingRole(null)
              }} className="flex gap-3">
                <input name="name" required defaultValue={editingRole?.name}
                  placeholder="Nama role..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                {!editingRole && (
                  <select name="entityId"
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    {entities.map(e => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                )}
                <button type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
                  Simpan
                </button>
                <button type="button" onClick={() => { setShowRoleForm(false); setEditingRole(null) }}
                  className="text-gray-500 text-sm px-4 py-2 border border-gray-300 rounded-lg">
                  Batal
                </button>
              </form>
            </div>
          )}

          {/* List roles per entity */}
          {entities.map(entity => {
            const entityRoles = roles.filter(r => r.entityId === entity.id)
            return (
              <div key={entity.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className={`px-6 py-3 border-b border-gray-200 ${
                  entity.type === 'DKM' ? 'bg-emerald-50' : 'bg-blue-50'
                }`}>
                  <h3 className="font-semibold text-gray-900 text-sm">{entity.name}</h3>
                  <p className="text-xs text-gray-500">{entityRoles.length} role terdaftar</p>
                </div>
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Nama Role</th>
                      <th className="text-center text-xs font-medium text-gray-500 px-6 py-3">Tipe</th>
                      <th className="text-right text-xs font-medium text-gray-500 px-6 py-3">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {entityRoles.map(role => (
                      <tr key={role.id} className="hover:bg-gray-50">
                        <td className="px-6 py-3 text-sm font-medium text-gray-900">{role.name}</td>
                        <td className="px-6 py-3 text-center">
                          {role.isDefault ? (
                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                              Default
                            </span>
                          ) : (
                            <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full">
                              Custom
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => { setEditingRole(role); setShowRoleForm(true) }}
                              className="text-xs text-blue-500 hover:text-blue-700 px-2 py-1 rounded border border-blue-200 hover:bg-blue-50">
                              ✏️ Edit
                            </button>
                            {!role.isDefault && (
                              <form action={deleteRole.bind(null, role.id)}>
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
            )
          })}
        </div>
      )}
    </div>
  )
}
