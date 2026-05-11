'use client'

import { useState } from 'react'
import { approveUser, rejectUser, deleteUser, updateUserStatus } from './actions'
import { createRole, updateRole, deleteRole } from '../roles/actions'
import UserRoleForm from './UserRoleForm'
import LinkPersonForm from './LinkPersonForm'

type Role = { id: string; name: string; entityId: string; isDefault: boolean; isActive: boolean }
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
  status: string
  isActive: boolean
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
  const [confirmNonaktif, setConfirmNonaktif] = useState<string | null>(null)
  const [confirmNonaktifRole, setConfirmNonaktifRole] = useState<string | null>(null)
  const [showInactiveUsers, setShowInactiveUsers] = useState(false)
  const [showInactiveRoles, setShowInactiveRoles] = useState(false)

  const filteredUsers = users.filter(u =>
    showInactiveUsers ? true : u.person.isActive
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
          { value: 'pending', label: `⏳${pendingUsers.length > 0 ? ` (${pendingUsers.length})` : ''}` },
          { value: 'users', label: '👤 Users' },
          { value: 'roles', label: '🔧 Role' },
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
                  <div key={person.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center font-bold text-yellow-700 flex-shrink-0">
                          {person.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{person.fullName}</p>
                          <p className="text-xs text-gray-500 truncate">{person.email}</p>
                          {person.phoneNumber && <p className="text-xs text-gray-400">{person.phoneNumber}</p>}
                          {member && (
                            <div className="flex gap-1 mt-1 flex-wrap">
                              <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full truncate max-w-32">
                                {member.entity.name}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <form action={approveUser.bind(null, person.id)}>
                          <button type="submit"
                            className="bg-emerald-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg w-full">
                            ✅ Approve
                          </button>
                        </form>
                        <form action={rejectUser.bind(null, person.id)}>
                          <button type="submit"
                            className="bg-red-50 text-red-600 text-xs font-medium px-3 py-1.5 rounded-lg border border-red-200 w-full">
                            ❌ Tolak
                          </button>
                        </form>
                      </div>
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
        <div className="space-y-4">
          <div className="flex justify-end">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" checked={showInactiveUsers} onChange={e => setShowInactiveUsers(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-gray-300" />
              Tampilkan nonaktif
            </label>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">User Accounts ({filteredUsers.length})</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {filteredUsers.map(user => {
                const member = user.person.entityMembers[0]
                const userRoles = roles.filter(r => r.entityId === member?.entityId && r.isActive)
                return (
                  <div key={user.id} className={`p-4 space-y-3 ${!user.person.isActive ? 'opacity-60 bg-gray-50' : ''}`}>
                    {confirmNonaktif === user.personId && (
                      <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
                        <p className="text-sm font-medium text-orange-700 mb-2">
                          Yakin nonaktifkan <strong>{user.person.fullName}</strong>?
                        </p>
                        <div className="flex gap-2">
                          <form action={deleteUser.bind(null, user.personId)}>
                            <button type="submit"
                              className="bg-orange-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg">
                              Ya, Nonaktifkan
                            </button>
                          </form>
                          <button onClick={() => setConfirmNonaktif(null)}
                            className="text-gray-500 text-xs px-3 py-1.5 border border-gray-300 rounded-lg">
                            Batal
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${
                          !user.person.isActive ? 'bg-gray-400' :
                          user.person.status === 'ACTIVE' ? 'bg-emerald-600' : 'bg-orange-500'
                        }`}>
                          {user.person.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{user.person.fullName}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          <div className="flex items-center gap-1 mt-1 flex-wrap">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              !user.person.isActive ? 'bg-gray-100 text-gray-500' :
                              user.person.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                              'bg-orange-100 text-orange-700'
                            }`}>
                              {!user.person.isActive ? '⛔ Nonaktif' : user.person.status}
                            </span>
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
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5 flex-shrink-0">
                        {user.person.isActive ? (
                          <form action={updateUserStatus.bind(null, user.personId, 'SUSPENDED' as any)}>
                            <button type="submit"
                              className="text-xs text-orange-500 px-3 py-1.5 rounded-lg border border-orange-200 w-full">
                              🔒 Suspend
                            </button>
                          </form>
                        ) : (
                          <form action={updateUserStatus.bind(null, user.personId, 'ACTIVE' as any)}>
                            <button type="submit"
                              className="text-xs text-emerald-600 px-3 py-1.5 rounded-lg border border-emerald-200 w-full">
                              🔓 Aktifkan
                            </button>
                          </form>
                        )}
                        <button onClick={() => setConfirmNonaktif(user.personId)}
                          className="text-xs text-orange-500 px-3 py-1.5 rounded-lg border border-orange-200">
                          🔒 Nonaktifkan
                        </button>
                        <LinkPersonForm userId={user.id} currentPersonId={user.personId} persons={persons} />
                      </div>
                    </div>

                    {member && user.person.isActive && (
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
        </div>
      )}

      {/* Tab: Manajemen Role */}
      {tab === 'roles' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 flex-1">
              ℹ️ Role default tidak bisa dinonaktifkan.
            </p>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer whitespace-nowrap">
                <input type="checkbox" checked={showInactiveRoles} onChange={e => setShowInactiveRoles(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-gray-300" />
                Nonaktif
              </label>
              <button onClick={() => { setShowRoleForm(true); setEditingRole(null) }}
                className="bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-lg whitespace-nowrap">
                + Role Baru
              </button>
            </div>
          </div>

          {showRoleForm && (
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-4">
                {editingRole ? '✏️ Edit Role' : '+ Tambah Role Baru'}
              </h3>
              <form action={async (formData) => {
                if (editingRole) await updateRole(editingRole.id, formData)
                else await createRole(formData)
                setShowRoleForm(false)
                setEditingRole(null)
              }} className="space-y-3">
                <input name="name" required defaultValue={editingRole?.name} placeholder="Nama role..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                {!editingRole && (
                  <select name="entityId"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    {entities.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
                )}
                <div className="flex gap-3">
                  <button type="submit"
                    className="flex-1 bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-lg">
                    Simpan
                  </button>
                  <button type="button" onClick={() => { setShowRoleForm(false); setEditingRole(null) }}
                    className="flex-1 text-gray-500 text-sm px-4 py-2 border border-gray-300 rounded-lg">
                    Batal
                  </button>
                </div>
              </form>
            </div>
          )}

          {entities.map(entity => {
            const entityRoles = roles.filter(r =>
              r.entityId === entity.id && (showInactiveRoles ? true : r.isActive)
            )
            return (
              <div key={entity.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className={`px-4 py-3 border-b border-gray-200 ${
                  entity.type === 'DKM' ? 'bg-emerald-50' : 'bg-blue-50'
                }`}>
                  <h3 className="font-semibold text-gray-900 text-sm">{entity.name}</h3>
                  <p className="text-xs text-gray-500">{entityRoles.length} role</p>
                </div>

                {/* Mobile Card Layout */}
                <div className="md:hidden divide-y divide-gray-100">
                  {entityRoles.map(role => (
                    <div key={role.id} className={`p-4 space-y-2 ${!role.isActive ? 'opacity-50' : ''}`}>
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{role.name}</p>
                          <div className="flex gap-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              role.isDefault ? 'bg-gray-100 text-gray-600' : 'bg-emerald-100 text-emerald-700'
                            }`}>
                              {role.isDefault ? 'Default' : 'Custom'}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              role.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                            }`}>
                              {role.isActive ? '✅ Aktif' : '⛔ Nonaktif'}
                            </span>
                          </div>
                        </div>
                      </div>
                      {confirmNonaktifRole === role.id && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-orange-600">Yakin nonaktifkan?</span>
                          <form action={deleteRole.bind(null, role.id)}>
                            <button type="submit" className="text-xs bg-orange-500 text-white px-2 py-1 rounded">Ya</button>
                          </form>
                          <button onClick={() => setConfirmNonaktifRole(null)} className="text-xs text-gray-500 px-2 py-1 rounded border border-gray-200">Batal</button>
                        </div>
                      )}
                      <div className="flex gap-2">
                        {role.isActive && (
                          <button onClick={() => { setEditingRole(role); setShowRoleForm(true) }}
                            className="text-xs text-blue-500 px-3 py-1.5 rounded-lg border border-blue-200">
                            ✏️ Edit
                          </button>
                        )}
                        {!role.isDefault && (
                          <button onClick={() => setConfirmNonaktifRole(confirmNonaktifRole === role.id ? null : role.id)}
                            className={`text-xs px-3 py-1.5 rounded-lg border ${
                              role.isActive ? 'text-orange-500 border-orange-200' : 'text-emerald-600 border-emerald-200'
                            }`}>
                            {role.isActive ? '🔒 Nonaktifkan' : '🔓 Aktifkan'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table Layout */}
                <div className="hidden md:block">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Nama Role</th>
                        <th className="text-center text-xs font-medium text-gray-500 px-6 py-3">Tipe</th>
                        <th className="text-center text-xs font-medium text-gray-500 px-6 py-3">Status</th>
                        <th className="text-right text-xs font-medium text-gray-500 px-6 py-3">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {entityRoles.map(role => (
                        <tr key={role.id} className={`hover:bg-gray-50 ${!role.isActive ? 'opacity-50' : ''}`}>
                          <td className="px-6 py-3 text-sm font-medium text-gray-900">{role.name}</td>
                          <td className="px-6 py-3 text-center">
                            {role.isDefault ? (
                              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">Default</span>
                            ) : (
                              <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full">Custom</span>
                            )}
                          </td>
                          <td className="px-6 py-3 text-center">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              role.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                            }`}>
                              {role.isActive ? '✅ Aktif' : '⛔ Nonaktif'}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-right">
                            {confirmNonaktifRole === role.id && (
                              <div className="flex items-center justify-end gap-2 mb-2">
                                <span className="text-xs text-orange-600">Yakin nonaktifkan?</span>
                                <form action={deleteRole.bind(null, role.id)}>
                                  <button type="submit" className="text-xs bg-orange-500 text-white px-2 py-1 rounded">Ya</button>
                                </form>
                                <button onClick={() => setConfirmNonaktifRole(null)}
                                  className="text-xs text-gray-500 px-2 py-1 rounded border border-gray-200">Batal</button>
                              </div>
                            )}
                            <div className="flex items-center justify-end gap-2">
                              {role.isActive && (
                                <button onClick={() => { setEditingRole(role); setShowRoleForm(true) }}
                                  className="text-xs text-blue-500 hover:text-blue-700 px-2 py-1 rounded border border-blue-200 hover:bg-blue-50">
                                  ✏️ Edit
                                </button>
                              )}
                              {!role.isDefault && (
                                <button onClick={() => setConfirmNonaktifRole(confirmNonaktifRole === role.id ? null : role.id)}
                                  className={`text-xs px-2 py-1 rounded border transition-colors ${
                                    role.isActive ? 'text-orange-500 border-orange-200 hover:bg-orange-50' : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                                  }`}>
                                  {role.isActive ? '🔒 Nonaktifkan' : '🔓 Aktifkan'}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
