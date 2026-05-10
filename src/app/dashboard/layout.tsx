import { getCurrentUser } from '@/lib/auth'
import Sidebar from '@/components/dashboard/Sidebar'
import Header from '@/components/dashboard/Header'
import { getNotifications, getUnreadCount } from '@/lib/notifications'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const currentUser = await getCurrentUser()
  const personId = currentUser.person.id

  const [notifications, unreadCount] = await Promise.all([
    getNotifications(personId),
    getUnreadCount(personId),
  ])

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar role={currentUser.role} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          fullName={currentUser.person.fullName}
          email={currentUser.person.email ?? ''}
          entityName={currentUser.entityName ?? ''}
          mosqueName={currentUser.mosqueName ?? ''}
          role={currentUser.role ?? ''}
          notifications={notifications}
          unreadCount={unreadCount}
        />
        <main className="flex-1 p-4 md:p-6 overflow-auto mt-14 md:mt-0">
          {children}
        </main>
      </div>
    </div>
  )
}
