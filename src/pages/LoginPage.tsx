import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import GoogleLoginButton from '@/components/forms/GoogleLoginButton'
import { FinmLogo } from '@/components/shared/FinmLogo'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { dashboardFor } from '@/config/navigation'
import { useApp } from '@/context/AppContext'
import { getApiErrorMessage } from '@/services/api'

export default function LoginPage() {
  const { currentUser, loginWithGoogle } = useApp()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

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
    <main className="grid min-h-screen place-items-center bg-background p-4">
      <Card className="w-full max-w-sm">
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
              className="rounded-xl bg-red-50 p-3 text-sm text-red-700"
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
