import { useNavigate } from 'react-router-dom'
import { LogOut, ShieldCheck } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useApp } from '@/context/AppContext'

export function LogoutPage() {
  const navigate = useNavigate()
  const { isAuthenticated, logout, login } = useApp()

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#0F9D58]/10">
              <ShieldCheck className="h-8 w-8 text-[#0F9D58]" />
            </div>
            <h2 className="mt-4 text-xl font-bold">You've been logged out</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your session has ended. Sign back in to access your dashboard.
            </p>
            <Button
              className="mt-6 rounded-full bg-[#0F9D58] hover:bg-[#0F9D58]/90"
              onClick={() => {
                login()
                navigate('/')
              }}
            >
              Sign Back In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Logout" description="End your current session securely" />
      <Card className="max-w-lg">
        <CardContent className="p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <LogOut className="h-7 w-7 text-red-500" />
          </div>
          <h2 className="mt-4 text-lg font-semibold">Confirm Logout</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Are you sure you want to log out of your Finm account?
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="outline" className="rounded-full" onClick={() => navigate('/')}>
              Cancel
            </Button>
            <Button
              className="rounded-full bg-red-500 hover:bg-red-600"
              onClick={() => logout()}
            >
              Log Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
