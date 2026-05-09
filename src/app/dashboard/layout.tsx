import { getCurrentUser } from '@/lib/auth'
import Sidebar from '@/components/dashboard/Sidebar'
import Header from '@/components/dashboard/Header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const currentUser = await getCurrentUser()

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
        />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
