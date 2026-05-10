import { prisma } from '@/lib/prisma'
import { approveUser, rejectUser } from './actions'
import UserRoleForm from './UserRoleForm'
import LinkPersonForm from './LinkPersonForm'

export default async function AdminUsersPage() {
  const [pendingUsers, users, persons] = await Promise.all([
    prisma.person.findMany({
      where: { status: 'PENDING' },
      include: {
        entityMembers: {
          include: { entity: { include: { mosque: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.user.findMany({
      include: {
        person: {
          include: {
            personType: true,
            entity: true,
            entityMembers: {
              include: { entity: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.person.findMany({
      where: { isActive: true, status: 'ACTIVE' },
      include: { personType: true, entity: true },
      orderBy: { fullName: 'asc' }
    })
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Manajemen User</h1>
        <p className="text-sm text-gray-500 mt-0.5">Kelola akun user, role, dan link ke data person</p>
      </div>

      {/* Pending */}
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

      {/* User Accounts */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">User Accounts ({users.length})</h3>
          <p className="text-xs text-gray-500 mt-0.5">Assign role dan link ke data person</p>
        </div>
        <div className="divide-y divide-gray-100">
          {users.map(user => {
            const member = user.person.entityMembers[0]
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

                {/* Role Assignment */}
                {member && (
                  <UserRoleForm
                    personId={user.personId}
                    entityId={member.entityId}
                    currentRole={member.role}
                    isBendahara={member.isBendahara}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
