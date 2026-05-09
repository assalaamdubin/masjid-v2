import { prisma } from '@/lib/prisma'
import { approveUser, rejectUser } from './actions'

export default async function AdminUsersPage() {
  const pendingUsers = await prisma.person.findMany({
    where: { status: 'PENDING' },
    include: {
      entityMembers: {
        include: { entity: { include: { mosque: true } } }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  const activeUsers = await prisma.person.findMany({
    where: { status: 'ACTIVE' },
    include: {
      entityMembers: {
        include: { entity: { include: { mosque: true } } }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Manajemen User</h1>
        <p className="text-sm text-gray-500 mt-0.5">Approve atau tolak pendaftaran user baru</p>
      </div>

      {/* Pending Users */}
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
            {pendingUsers.map((person) => {
              const member = person.entityMembers[0]
              return (
                <div key={person.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-lg">👤</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{person.fullName}</p>
                        <p className="text-xs text-gray-500">{person.email}</p>
                        {person.phoneNumber && (
                          <p className="text-xs text-gray-400">{person.phoneNumber}</p>
                        )}
                      </div>
                    </div>
                    {member && (
                      <div className="mt-2 ml-13 flex gap-2 flex-wrap pl-13">
                        <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                          🕌 {member.entity.mosque.name}
                        </span>
                        <span className="bg-purple-50 text-purple-700 text-xs px-2 py-0.5 rounded-full">
                          {member.entity.name}
                        </span>
                        <span className="bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5 rounded-full">
                          {member.role.replace('_', ' ')}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <form action={approveUser.bind(null, person.id)}>
                      <button
                        type="submit"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors"
                      >
                        ✅ Approve
                      </button>
                    </form>
                    <form action={rejectUser.bind(null, person.id)}>
                      <button
                        type="submit"
                        className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium px-4 py-2 rounded-lg transition-colors border border-red-200"
                      >
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

      {/* Active Users */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">User Aktif ({activeUsers.length})</h3>
        </div>
        {activeUsers.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <p className="text-sm">Belum ada user aktif</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Nama</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Email</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Masjid</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {activeUsers.map((person) => {
                const member = person.entityMembers[0]
                return (
                  <tr key={person.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">{person.fullName}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">{person.email}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {member?.entity.mosque.name ?? '-'}
                    </td>
                    <td className="px-6 py-3">
                      {member && (
                        <span className="bg-emerald-100 text-emerald-700 text-xs font-medium px-2 py-0.5 rounded-full">
                          {member.role.replace('_', ' ')}
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
