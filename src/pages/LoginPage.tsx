import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import GoogleLoginButton from '@/components/forms/GoogleLoginButton'
import { FinmLogo } from '@/components/shared/FinmLogo'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { dashboardFor } from '@/config/navigation'
import { useApp } from '@/context/AppContext'
import { getApiErrorMessage } from '@/services/api'

export default function LoginPage() {
  const { currentUser, loginWithGoogle } = useApp()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(() => {
    const message = sessionStorage.getItem('social-fund:suspended-message') || ''
    sessionStorage.removeItem('social-fund:suspended-message')
    return message
  })

  if (currentUser)
    return (
      <Navigate
        to={dashboardFor(currentUser.role)}
        replace
      />
    )

  const handleCredential = async (credential: string) => {
    setError('')
    setIsLoading(true)
    try {
      const user = await loginWithGoogle(credential)
      navigate(dashboardFor(user.role), { replace: true })
    } catch (reason) {
      setError(getApiErrorMessage(reason, 'Google login failed. Please try again.'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="relative grid min-h-screen place-items-center bg-background p-4">
      <ThemeToggle className="absolute right-5 top-5 border border-border/70 bg-card shadow-sm" />
      <Card className="w-full max-w-sm shadow-card">
        <CardHeader>
          <FinmLogo />
          <CardTitle className="pt-4">Welcome back</CardTitle>
          <CardDescription>
            Sign in securely with your Google account to continue to Social Fund.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <p
              role="alert"
              className="rounded-lg border border-[#547792]/40 bg-[#94B4C1]/25 p-3 text-sm text-[#213448] dark:text-[#EAE0CF]"
            >
              {error}
            </p>
          )}
          <div className="flex justify-center">
            <GoogleLoginButton
              disabled={isLoading}
              onCredential={handleCredential}
              onError={setError}
            />
          </div>
          {isLoading && (
            <p className="text-center text-xs text-muted-foreground">Signing you in…</p>
          )}
          <p className="text-center text-xs text-muted-foreground">
            Your role and account status are determined securely by the Social Fund server.
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
