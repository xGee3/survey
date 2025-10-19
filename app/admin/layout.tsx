import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import AdminNav from '@/components/admin/AdminNav'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''

  // Allow access to login page without authentication
  const isLoginPage = pathname === '/admin/login'

  if (!isLoginPage) {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    // If no user and not on login page, redirect to login
    if (!user) {
      redirect('/admin/login')
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNav userEmail={user.email || ''} />
        {children}
      </div>
    )
  }

  // For login page, just render children without auth check or nav
  return <>{children}</>
}
